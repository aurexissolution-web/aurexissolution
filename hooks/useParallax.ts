import { useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';
import { RefObject, useRef } from 'react';

interface ParallaxConfig {
  offset?: number;
  speed?: number;
  springConfig?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  };
}

interface ParallaxReturn {
  ref: RefObject<HTMLDivElement>;
  scrollYProgress: MotionValue<number>;
  y: MotionValue<number>;
  opacity: MotionValue<number>;
  scale: MotionValue<number>;
  rotateX: MotionValue<number>;
}

export const useParallax = (config: ParallaxConfig = {}): ParallaxReturn => {
  const {
    offset = 100,
    speed = 0.5,
    springConfig = { stiffness: 100, damping: 30, mass: 0.5 }
  } = config;

  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Create smooth parallax Y movement
  const yTransform = useTransform(
    scrollYProgress,
    [0, 1],
    [offset, -offset * speed]
  );
  const y = useSpring(yTransform, springConfig);

  // Create opacity fade effect
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0, 1, 1, 0]
  );

  // Create scale effect for zoom
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.8, 1, 1.1]
  );

  // Create 3D rotation effect
  const rotateX = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [15, 0, -15]
  );

  return {
    ref,
    scrollYProgress,
    y,
    opacity,
    scale,
    rotateX
  };
};
