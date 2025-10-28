// Mobile utility functions for touch interactions and gestures

export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const getViewportSize = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

export const isLandscape = (): boolean => {
  return window.innerWidth > window.innerHeight;
};

export const isPortrait = (): boolean => {
  return window.innerHeight > window.innerWidth;
};

// Touch gesture utilities
export const addSwipeGesture = (
  element: HTMLElement,
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void
) => {
  if (!element) {
    console.warn('addSwipeGesture: element is null or undefined');
    return () => {};
  }

  let startX = 0;
  let startY = 0;
  let endX = 0;
  let endY = 0;

  const handleTouchStart = (e: TouchEvent) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    endX = e.changedTouches[0].clientX;
    endY = e.changedTouches[0].clientY;
    handleSwipe();
  };

  const handleSwipe = () => {
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > minSwipeDistance && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < -minSwipeDistance && onSwipeLeft) {
        onSwipeLeft();
      }
    } else {
      // Vertical swipe
      if (deltaY > minSwipeDistance && onSwipeDown) {
        onSwipeDown();
      } else if (deltaY < -minSwipeDistance && onSwipeUp) {
        onSwipeUp();
      }
    }
  };

  try {
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
  } catch (error) {
    console.warn('Error adding swipe gesture listeners:', error);
    return () => {};
  }

  return () => {
    try {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    } catch (error) {
      console.warn('Error removing swipe gesture listeners:', error);
    }
  };
};

// Prevent zoom on double tap
export const preventDoubleTapZoom = (element: HTMLElement) => {
  if (!element) {
    console.warn('preventDoubleTapZoom: element is null or undefined');
    return () => {};
  }

  let lastTouchEnd = 0;
  
  const handleTouchEnd = (e: TouchEvent) => {
    const now = new Date().getTime();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  };

  try {
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
  } catch (error) {
    console.warn('Error adding double tap zoom prevention:', error);
    return () => {};
  }
  
  return () => {
    try {
      element.removeEventListener('touchend', handleTouchEnd);
    } catch (error) {
      console.warn('Error removing double tap zoom prevention:', error);
    }
  };
};

// Add haptic feedback for supported devices
export const hapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30]
    };
    navigator.vibrate(patterns[type]);
  }
};

// Optimize scroll performance on mobile
export const optimizeScroll = (element: HTMLElement) => {
  if (!element) {
    console.warn('optimizeScroll: element is null or undefined');
    return;
  }

  try {
    (element.style as any).webkitOverflowScrolling = 'touch';
    (element.style as any).overflowScrolling = 'touch';
  } catch (error) {
    console.warn('Error optimizing scroll:', error);
  }
};

// Add pull-to-refresh functionality
export const addPullToRefresh = (
  element: HTMLElement,
  onRefresh: () => void,
  threshold: number = 100
) => {
  if (!element) {
    console.warn('addPullToRefresh: element is null or undefined');
    return () => {};
  }

  let startY = 0;
  let currentY = 0;
  let isPulling = false;

  const handleTouchStart = (e: TouchEvent) => {
    if (element.scrollTop === 0) {
      startY = e.touches[0].clientY;
      isPulling = true;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isPulling) return;
    
    currentY = e.touches[0].clientY;
    const pullDistance = currentY - startY;
    
    if (pullDistance > 0) {
      e.preventDefault();
      element.style.transform = `translateY(${Math.min(pullDistance * 0.5, threshold)}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (!isPulling) return;
    
    const pullDistance = currentY - startY;
    
    if (pullDistance > threshold) {
      onRefresh();
    }
    
    element.style.transform = '';
    isPulling = false;
  };

  try {
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
  } catch (error) {
    console.warn('Error adding pull-to-refresh listeners:', error);
    return () => {};
  }

  return () => {
    try {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    } catch (error) {
      console.warn('Error removing pull-to-refresh listeners:', error);
    }
  };
};

// Mobile-specific CSS classes
export const getMobileClasses = () => {
  const classes = [];
  
  if (isMobile()) {
    classes.push('mobile-device');
  }
  
  if (isTouchDevice()) {
    classes.push('touch-device');
  }
  
  if (isLandscape()) {
    classes.push('landscape');
  } else {
    classes.push('portrait');
  }
  
  return classes.join(' ');
};

// Add mobile-specific event listeners
export const addMobileEventListeners = () => {
  // Prevent context menu on long press for better UX
  document.addEventListener('contextmenu', (e) => {
    if (isMobile()) {
      e.preventDefault();
    }
  });

  // Add mobile-specific resize handler
  const handleResize = () => {
    try {
      const classes = getMobileClasses();
      // Check if document.body exists before manipulating it
      if (document.body) {
        document.body.className = document.body.className.replace(/mobile-device|touch-device|landscape|portrait/g, '').trim();
        document.body.classList.add(...classes.split(' '));
      }
    } catch (error) {
      console.warn('Error updating mobile classes:', error);
    }
  };

  window.addEventListener('resize', handleResize);
  
  // Only call handleResize if document.body exists
  if (document.body) {
    handleResize(); // Initial call
  } else {
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', handleResize);
  }

  return () => {
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('DOMContentLoaded', handleResize);
  };
};
