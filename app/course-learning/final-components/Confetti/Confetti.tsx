'use client';

import React, { useEffect, useState, useMemo } from 'react';

interface ConfettiProps {
  active?: boolean;
  config?: {
    angle?: number;
    spread?: number;
    startVelocity?: number;
    elementCount?: number;
    dragFriction?: number;
    duration?: number;
    stagger?: number;
    width?: string;
    height?: string;
    perspective?: string;
    colors?: string[];
  };
}

const Confetti: React.FC<ConfettiProps> = ({ 
  active = false, 
  config = {} 
}) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    left: number;
    animationDelay: number;
    color: string;
  }>>([]);

  const defaultConfig = useMemo(() => ({
    angle: 90,
    spread: 45,
    startVelocity: 45,
    elementCount: 50,
    dragFriction: 0.1,
    duration: 3000,
    stagger: 0,
    width: '10px',
    height: '10px',
    perspective: '500px',
    colors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a'],
    ...config
  }), [config]);

  useEffect(() => {
    if (active) {
      const newParticles = Array.from({ length: defaultConfig.elementCount }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        animationDelay: Math.random() * defaultConfig.duration,
        color: defaultConfig.colors[Math.floor(Math.random() * defaultConfig.colors.length)]
      }));
      
      setParticles(newParticles);
      
      // Clear particles after animation duration
      const timeout = setTimeout(() => {
        setParticles([]);
      }, defaultConfig.duration + 1000);
      
      return () => clearTimeout(timeout);
    } else {
      setParticles([]);
    }
  }, [active, defaultConfig.duration, defaultConfig.elementCount, defaultConfig.colors]);

  if (!active || particles.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 opacity-90"
          style={{
            left: `${particle.left}%`,
            top: '-10px',
            backgroundColor: particle.color,
            animation: `confetti-fall ${defaultConfig.duration}ms linear forwards`,
            animationDelay: `${particle.animationDelay}ms`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10px) rotateZ(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotateZ(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Confetti; 