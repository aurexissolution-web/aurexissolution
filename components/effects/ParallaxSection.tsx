import React, { ReactNode } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

interface ParallaxSectionProps {
  children: ReactNode;
  offset?: number;
  className?: string;
  speed?: number;
  direction?: 'up' | 'down';
  fadeIn?: boolean;
}

const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  offset = 50,
  className = '',
  speed = 0.5,
  direction = 'up',
  fadeIn = true
}) => {
  const { scrollYProgress } = useScroll();
  
  // Calculate the transform range based on direction and speed
  const yRange = direction === 'up' 
    ? [offset, -offset * speed]
    : [-offset, offset * speed];
  
  const y = useTransform(scrollYProgress, [0, 1], yRange);
  
  // Optional fade in effect
  const opacity = fadeIn 
    ? useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0.3, 1, 1, 0.3])
    : 1;

  return (
    <motion.div
      style={{ y, opacity }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ParallaxSection;
