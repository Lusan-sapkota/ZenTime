/**
 * Enhanced Zen Mode System Tests
 * 
 * Tests for zen mode configuration, state management, and persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ZenModeConfig } from '../types/theme';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('Enhanced Zen Mode System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ZenModeProvider>{children}</ZenModeProvider>
  );

  describe('ZenModeConfig Interface', () => {
    it('should initialize with default zen mode configuration', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useZenModeContext(), { wrapper });

      // Wait for initial load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.zenConfig).toEqual({
        enabled: false,
        autoHideDelay: 3000,
        breathingAnimation: true,
        pulseEffect: false,
        gradualDimming: true,
        tapToReveal: true,
        revealDuration: 3000,
        hideStatusBar: true,
        preventScreenDim: true,
      });
    });

    it('should load saved zen mode configuration from storage', async () => {
      const savedConfig: ZenModeConfig = {
        enabled: true,
        autoHideDelay: 5000,
        breathingAnimation: false,
        pulseEffect: true,
        gradualDimming: false,
        tapToReveal: false,
        revealDuration: 2000,
        hideStatusBar: false,
        preventScreenDim: false,
      };

      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'zenMode') return Promise.resolve('true');
        if (key === 'zenConfig') return Promise.resolve(JSON.stringify(savedConfig));
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useZenModeContext(), { wrapper });

      // Wait for async loading
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.zenMode).toBe(true);
      expect(result.current.zenConfig).toEqual(savedConfig);
    });
  });

  describe('Zen Mode State Management', () => {
    it('should toggle zen mode with smooth transitions', async () => {
      const { result } = renderHook(() => useZenModeContext(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.zenMode).toBe(false);
      expect(result.current.isTransitioning).toBe(false);

      // Enable zen mode
      await act(async () => {
        result.current.setZenMode(true);
      });

      // Should be transitioning initially
      expect(result.current.isTransitioning).toBe(true);

      // Wait for transition to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });

      expect(result.current.zenMode).toBe(true);
      expect(result.current.isTransitioning).toBe(false);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('zenMode', 'true');
    });

    it('should prevent multiple simultaneous transitions', async () => {
      const { result } = renderHook(() => useZenModeContext(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Start first transition
      act(() => {
        result.current.setZenMode(true);
      });

      expect(result.current.isTransitioning).toBe(true);

      // Try to start second transition while first is in progress
      act(() => {
        result.current.setZenMode(false);
      });

      // Should still be in the original transition state
      expect(result.current.isTransitioning).toBe(true);
    });
  });

  describe('Zen Configuration Updates', () => {
    it('should update zen configuration and persist to storage', async () => {
      const { result } = renderHook(() => useZenModeContext(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const configUpdate = {
        breathingAnimation: false,
        autoHideDelay: 5000,
        pulseEffect: true,
      };

      await act(async () => {
        await result.current.updateZenConfig(configUpdate);
      });

      expect(result.current.zenConfig).toMatchObject(configUpdate);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'zenConfig',
        JSON.stringify(expect.objectContaining(configUpdate))
      );
    });

    it('should handle partial configuration updates', async () => {
      const { result } = renderHook(() => useZenModeContext(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const originalConfig = result.current.zenConfig;

      await act(async () => {
        await result.current.updateZenConfig({ autoHideDelay: 10000 });
      });

      expect(result.current.zenConfig).toEqual({
        ...originalConfig,
        autoHideDelay: 10000,
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle storage load errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { result } = renderHook(() => useZenModeContext(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Should use default values when storage fails
      expect(result.current.zenMode).toBe(false);
      expect(result.current.zenConfig.enabled).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load zen mode settings:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should handle storage save errors gracefully', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Save error'));
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { result } = renderHook(() => useZenModeContext(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.setZenMode(true);
      });

      // Should still update state even if save fails
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });

      expect(result.current.zenMode).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save zen mode state:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('Requirements Validation', () => {
    it('should meet requirement 3.1: zen mode activation/deactivation', async () => {
      const { result } = renderHook(() => useZenModeContext(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Test activation
      await act(async () => {
        result.current.setZenMode(true);
        await new Promise(resolve => setTimeout(resolve, 200));
      });

      expect(result.current.zenMode).toBe(true);

      // Test deactivation
      await act(async () => {
        result.current.setZenMode(false);
        await new Promise(resolve => setTimeout(resolve, 200));
      });

      expect(result.current.zenMode).toBe(false);
    });

    it('should meet requirement 3.5: zen mode settings persistence', async () => {
      const { result } = renderHook(() => useZenModeContext(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Update configuration
      await act(async () => {
        await result.current.updateZenConfig({
          breathingAnimation: false,
          autoHideDelay: 8000,
        });
      });

      // Verify persistence calls
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'zenConfig',
        expect.stringContaining('"breathingAnimation":false')
      );
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'zenConfig',
        expect.stringContaining('"autoHideDelay":8000')
      );
    });

    it('should meet requirement 6.3: smooth transitions', async () => {
      const { result } = renderHook(() => useZenModeContext(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Start transition
      act(() => {
        result.current.setZenMode(true);
      });

      // Should indicate transitioning state
      expect(result.current.isTransitioning).toBe(true);

      // Wait for transition to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });

      // Transition should be complete
      expect(result.current.isTransitioning).toBe(false);
      expect(result.current.zenMode).toBe(true);
    });
  });
});