import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  speed?: number;
  scale?: boolean;
  overlay?: boolean;
  overlayOpacity?: number;
}

const ParallaxImage: React.FC<ParallaxImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  speed = 0.5,
  scale = true,
  overlay = false,
  overlayOpacity = 0.4
}) => {
  const { scrollYProgress } = useScroll();
  
  // Parallax Y movement
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    ['0%', `${speed * 100}%`]
  );
  
  // Scale effect
  const scaleValue = scale 
    ? useTransform(scrollYProgress, [0, 1], [1, 1.2])
    : 1;

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      <motion.div
        style={{
          y,
          scale: scaleValue,
        }}
        className="relative w-full h-full"
      >
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover ${className}`}
        />
        {overlay && (
          <div 
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity }}
          />
        )}
      </motion.div>
    </div>
  );
};

export default ParallaxImage;
