import React, { ReactNode, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface ParallaxLayer {
  children: ReactNode;
  speed?: number;
  offset?: number;
  className?: string;
  zIndex?: number;
}

interface ParallaxContainerProps {
  layers: ParallaxLayer[];
  className?: string;
  height?: string;
}

const ParallaxContainer: React.FC<ParallaxContainerProps> = ({
  layers,
  className = '',
  height = '100vh'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ height }}
    >
      {layers.map((layer, index) => {
        const speed = layer.speed || 0.5;
        const offset = layer.offset || 0;
        
        // Create parallax effect for each layer
        const yTransform = useTransform(
          scrollYProgress,
          [0, 1],
          [offset, offset + (100 * speed)]
        );
        
        const y = useSpring(yTransform, {
          stiffness: 100,
          damping: 30,
          mass: 0.5
        });

        return (
          <motion.div
            key={index}
            className={`absolute inset-0 ${layer.className || ''}`}
            style={{
              y,
              zIndex: layer.zIndex || index
            }}
          >
            {layer.children}
          </motion.div>
        );
      })}
    </div>
  );
};

export default ParallaxContainer;
