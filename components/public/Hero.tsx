import React, { useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import { ArrowRight, BarChart3 } from 'lucide-react';

const Hero: React.FC = () => {
  const { siteContent } = useAppContext();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleNavigate = () => {
    navigate('/contact');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[];
    const particleCount = 100;
    const maxDistance = 120;
    
    const colors = {
      dot: 'rgba(14, 165, 233, 0.8)', // primary color
      line: 'rgba(14, 165, 233, 0.15)'
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 1.5 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx!.fillStyle = colors.dot;
        ctx!.fill();
      }
    }

    const init = () => {
      resizeCanvas();
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };
    
    const connectParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            ctx!.beginPath();
            ctx!.strokeStyle = colors.line;
            ctx!.lineWidth = 0.5;
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx!.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();
    
    const handleMouseMove = (e: MouseEvent) => {
        if (!containerRef.current) return;
        const { clientX, clientY } = e;
        const { offsetWidth: width, offsetHeight: height } = containerRef.current;
        const x = (clientX / width - 0.5) * 30; // 30 is the parallax intensity
        const y = (clientY / height - 0.5) * 30;
        
        const content = containerRef.current.querySelector('.hero-content') as HTMLDivElement;
        if(content){
            content.style.transform = `translate3d(${-x}px, ${-y}px, 0)`;
        }
    };

    window.addEventListener('resize', init);
    containerRef.current?.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', init);
      containerRef.current?.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section ref={containerRef} id="hero" className="relative h-screen flex items-center justify-center text-center overflow-hidden bg-background safe-area-top">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10"></div>
      
      <div className="relative z-20 px-4 sm:px-6 lg:px-8 hero-content transition-transform duration-300 ease-out container-mobile">
        <h1 className="text-mobile-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-4 animate-fade-in-down drop-shadow-lg leading-tight">
          {siteContent.heroTitle}
        </h1>
        <p className="text-mobile-base sm:text-lg md:text-xl text-text-secondary max-w-3xl mx-auto mb-6 sm:mb-8 animate-fade-in-up px-2">
          {siteContent.heroSubtitle}
        </p>
        <div className="flex-mobile gap-4 justify-center items-center">
          <button
            onClick={handleNavigate}
            className="btn-mobile bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold transition-all transform hover:scale-105 shadow-lg shadow-primary/30 animate-fade-in-up"
          >
            Get Started <ArrowRight size={18} className="icon-mobile ml-2" />
          </button>
          <button
            onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-mobile border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold transition-all transform hover:scale-105 animate-fade-in-up"
          >
            Learn More
          </button>
        </div>
        
        {/* Dashboard Access for Logged-in Users */}
        <div className="mt-8 animate-fade-in-up">
          <Link
            to="/dashboard"
            className="btn-mobile bg-surface/80 backdrop-blur-lg border border-neutral text-text-primary hover:text-primary font-medium transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <BarChart3 size={18} className="icon-mobile mr-2" />
            Access Your Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;