import React, { useEffect, useRef } from 'react';
import { 
  View, 
  TouchableWithoutFeedback, 
  Animated, 
  StyleSheet, 
  StatusBar 
} from 'react-native';
import { useZenModeContext } from '../contexts/ZenModeContext';
import { useEnhancedTheme } from '../contexts/ThemeContext';

interface ZenModeOverlayProps {
  children: React.ReactNode;
  controls?: React.ReactNode;
}

export const ZenModeOverlay: React.FC<ZenModeOverlayProps> = ({ 
  children, 
  controls 
}) => {
  const { 
    zenMode, 
    zenConfig, 
    zenAnimations, 
    isRevealed, 
    setRevealed, 
    resetRevealTimer 
  } = useZenModeContext();
  const { getCurrentColors } = useEnhancedTheme();
  const colors = getCurrentColors();
  
  // Animation refs for fade effects
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  
  // Handle tap-to-reveal functionality
  const handleTap = () => {
    if (!zenMode || !zenConfig.tapToReveal) return;
    
    if (isRevealed) {
      // If already revealed, reset the timer
      resetRevealTimer();
    } else {
      // Reveal controls
      setRevealed(true);
    }
  };

  // Animate controls visibility based on zen mode and reveal state
  useEffect(() => {
    if (zenMode) {
      if (isRevealed && zenConfig.tapToReveal) {
        // Fade in controls
        Animated.timing(controlsOpacity, {
          toValue: 1,
          duration: zenAnimations.revealAnimations.duration,
          useNativeDriver: true,
        }).start();
      } else {
        // Fade out controls
        Animated.timing(controlsOpacity, {
          toValue: 0,
          duration: zenAnimations.fadeTransitions.duration,
          useNativeDriver: true,
        }).start();
      }
    } else {
      // Always show controls when not in zen mode
      Animated.timing(controlsOpacity, {
        toValue: 1,
        duration: zenAnimations.fadeTransitions.duration,
        useNativeDriver: true,
      }).start();
    }
  }, [
    zenMode, 
    isRevealed, 
    zenConfig.tapToReveal, 
    zenAnimations.revealAnimations.duration,
    zenAnimations.fadeTransitions.duration,
    controlsOpacity
  ]);

  // Handle zen mode overlay visibility
  useEffect(() => {
    if (zenMode) {
      // Show zen mode overlay
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: zenAnimations.fadeTransitions.duration,
        useNativeDriver: true,
      }).start();
      
      // Hide status bar if configured
      if (zenConfig.hideStatusBar) {
        StatusBar.setHidden(true, 'fade');
      }
    } else {
      // Hide zen mode overlay
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: zenAnimations.fadeTransitions.duration,
        useNativeDriver: true,
      }).start();
      
      // Show status bar
      StatusBar.setHidden(false, 'fade');
    }
  }, [
    zenMode, 
    zenConfig.hideStatusBar, 
    zenAnimations.fadeTransitions.duration,
    overlayOpacity
  ]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      position: 'relative',
    },
    zenOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.background,
      zIndex: 1,
    },
    touchableArea: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    controlsContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 2,
      pointerEvents: isRevealed || !zenMode ? 'auto' : 'none',
    },
    contentContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  if (!zenMode) {
    // Normal mode - render children and controls normally
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          {children}
        </View>
        {controls && (
          <Animated.View 
            style={[
              styles.controlsContainer,
              { opacity: controlsOpacity }
            ]}
          >
            {controls}
          </Animated.View>
        )}
      </View>
    );
  }

  // Zen mode - render with overlay and tap-to-reveal functionality
  return (
    <View style={styles.container}>
      {/* Zen mode overlay */}
      <Animated.View 
        style={[
          styles.zenOverlay,
          { opacity: overlayOpacity }
        ]}
      >
        <TouchableWithoutFeedback onPress={handleTap}>
          <View style={styles.touchableArea}>
            {children}
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* Controls that fade in/out */}
      {controls && (
        <Animated.View 
          style={[
            styles.controlsContainer,
            { opacity: controlsOpacity }
          ]}
        >
          {controls}
        </Animated.View>
      )}
    </View>
  );
};