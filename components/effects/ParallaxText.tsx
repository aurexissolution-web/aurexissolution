import React from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef } from 'react';

interface ParallaxTextProps {
  children: React.ReactNode;
  className?: string;
  type?: 'fadeUp' | 'fadeIn' | 'slideIn' | 'zoom';
  delay?: number;
  duration?: number;
  stagger?: boolean;
}

const ParallaxText: React.FC<ParallaxTextProps> = ({
  children,
  className = '',
  type = 'fadeUp',
  delay = 0,
  duration = 0.8,
  stagger = false
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const variants = {
    fadeUp: {
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0 }
    },
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    },
    slideIn: {
      hidden: { opacity: 0, x: -100 },
      visible: { opacity: 1, x: 0 }
    },
    zoom: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 }
    }
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger ? 0.1 : 0
      }
    }
  };

  if (stagger && typeof children === 'string') {
    const words = children.split(' ');
    return (
      <motion.div
        ref={ref}
        className={className}
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {words.map((word, index) => (
          <motion.span
            key={index}
            variants={variants[type]}
            transition={{
              duration,
              delay: delay + (index * 0.05),
              ease: [0.25, 0.1, 0.25, 1]
            }}
            className="inline-block mr-2"
          >
            {word}
          </motion.span>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={variants[type]}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
    >
      {children}
    </motion.div>
  );
};

export default ParallaxText;
