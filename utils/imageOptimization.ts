// Image optimization utilities for better mobile performance

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Check if WebP is supported by the browser
 */
export const isWebPSupported = (): boolean => {
  const elem = document.createElement('canvas');
  
  if (elem.getContext && elem.getContext('2d')) {
    return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  
  return false;
};

/**
 * Get optimized image src based on device pixel ratio and viewport width
 */
export const getOptimizedImageSrc = (
  originalSrc: string,
  options: ImageOptimizationOptions = {}
): string => {
  // If it's already a data URL or external URL, return as is
  if (originalSrc.startsWith('data:') || originalSrc.startsWith('http')) {
    return originalSrc;
  }

  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 80,
    format = isWebPSupported() ? 'webp' : 'jpeg'
  } = options;

  // Get device pixel ratio for retina displays
  const dpr = window.devicePixelRatio || 1;
  const scaledWidth = Math.min(maxWidth * dpr, maxWidth * 2); // Cap at 2x

  // In a production app, you might use a CDN service here
  // For now, return the original with query parameters for documentation
  return `${originalSrc}?w=${scaledWidth}&h=${maxHeight}&q=${quality}&f=${format}`;
};

/**
 * Lazy load images with Intersection Observer
 */
export const lazyLoadImage = (img: HTMLImageElement): void => {
  const src = img.dataset.src;
  const srcset = img.dataset.srcset;

  if (!src && !srcset) return;

  const loadImage = () => {
    if (src) img.src = src;
    if (srcset) img.srcset = srcset;
    img.classList.add('loaded');
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadImage();
          obs.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px' // Start loading 50px before the image enters viewport
    });

    observer.observe(img);
  } else {
    // Fallback for browsers without Intersection Observer
    loadImage();
  }
};

/**
 * Preload critical images
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Get responsive image sizes based on viewport
 */
export const getResponsiveImageSizes = () => {
  const width = window.innerWidth;
  
  if (width < 640) {
    return { size: 'sm', maxWidth: 640 };
  } else if (width < 768) {
    return { size: 'md', maxWidth: 768 };
  } else if (width < 1024) {
    return { size: 'lg', maxWidth: 1024 };
  } else if (width < 1280) {
    return { size: 'xl', maxWidth: 1280 };
  } else {
    return { size: '2xl', maxWidth: 1920 };
  }
};

/**
 * Create srcset for responsive images
 */
export const createSrcSet = (baseSrc: string, sizes: number[] = [640, 768, 1024, 1280, 1920]): string => {
  return sizes.map(size => `${baseSrc}?w=${size} ${size}w`).join(', ');
};

/**
 * Optimize image on canvas (client-side compression)
 */
export const compressImage = async (
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<Blob> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          `image/${format}`,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Initialize lazy loading for all images with data-src attribute
 */
export const initLazyLoading = (): void => {
  const images = document.querySelectorAll('img[data-src]');
  images.forEach((img) => {
    if (img instanceof HTMLImageElement) {
      lazyLoadImage(img);
    }
  });
};

/**
 * Get optimal image format based on browser support
 */
export const getOptimalImageFormat = (): 'webp' | 'jpeg' => {
  return isWebPSupported() ? 'webp' : 'jpeg';
};

/**
 * Calculate image aspect ratio
 */
export const getAspectRatio = (width: number, height: number): string => {
  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };
  
  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
};

/**
 * Add blur-up placeholder effect
 */
export const addBlurUpEffect = (img: HTMLImageElement, placeholderSrc: string): void => {
  const placeholder = new Image();
  placeholder.src = placeholderSrc;
  placeholder.className = 'blur-up-placeholder';
  
  img.parentElement?.insertBefore(placeholder, img);
  
  img.onload = () => {
    img.classList.add('loaded');
    setTimeout(() => {
      placeholder.remove();
    }, 300);
  };
};

// Auto-initialize lazy loading when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyLoading);
  } else {
    initLazyLoading();
  }
}
