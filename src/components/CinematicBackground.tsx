import React, { useEffect, useRef, useState } from 'react';
import bgImage from '../assets/astronaut-wormhole.jpg';

interface CinematicBackgroundProps {
  onAdminClick?: () => void;
  cinemaMode?: boolean;
  onToggleCinemaMode?: (active: boolean) => void;
}

export const CinematicBackground: React.FC<CinematicBackgroundProps> = ({
  cinemaMode: externalCinemaMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const mouseRef = useRef({
    x: 0.5,
    y: 0.5,
    targetX: 0.5,
    targetY: 0.5,
  });

  const animStateRef = useRef({
    isPlaying: true,
    speed: 1.0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Cosmic Stardust Particles drifting through space
    const STAR_COUNT = 65;
    const dustParticles = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.0 + 0.5,
      alpha: Math.random() * 0.5 + 0.15,
      baseAlpha: Math.random() * 0.45 + 0.15,
      speedY: -(Math.random() * 0.22 + 0.05),
      speedX: -(Math.random() * 0.35 + 0.08), // drifting towards the vortex on right/center
      phase: Math.random() * Math.PI * 2,
    }));

    // Soft vortex energy pulses
    let time = 0;

    const render = () => {
      if (animStateRef.current.isPlaying) {
        time += 0.016 * animStateRef.current.speed;
      }

      // Smooth mouse parallax
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      const parallaxX = (mouseRef.current.x - 0.5) * 16;
      const parallaxY = (mouseRef.current.y - 0.5) * 10;

      ctx.clearRect(0, 0, width, height);

      // 1. Subtle Ethereal Wormhole / Vortex Glow (Center-Right)
      const vortexCenterX = width * 0.72 + parallaxX * 0.5;
      const vortexCenterY = height * 0.46 + parallaxY * 0.5;
      const glowRadius = Math.min(width, height) * 0.45;
      const pulse = 1 + 0.08 * Math.sin(time * 1.5);

      const vortexGlow = ctx.createRadialGradient(
        vortexCenterX,
        vortexCenterY,
        20,
        vortexCenterX,
        vortexCenterY,
        glowRadius * pulse
      );
      vortexGlow.addColorStop(0, 'rgba(125, 211, 252, 0.16)'); // cyan light
      vortexGlow.addColorStop(0.35, 'rgba(56, 189, 248, 0.08)');
      vortexGlow.addColorStop(0.70, 'rgba(14, 165, 233, 0.02)');
      vortexGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = vortexGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Floating Cosmic Stardust & Light Motes
      for (const p of dustParticles) {
        if (animStateRef.current.isPlaying) {
          p.y += p.speedY * animStateRef.current.speed;
          p.x += p.speedX * animStateRef.current.speed;

          if (p.y < 0) {
            p.y = height;
            p.x = Math.random() * width;
          }
          if (p.x < 0) {
            p.x = width;
            p.y = Math.random() * height;
          }
          if (p.x > width) p.x = 0;
        }

        const twinkle = p.baseAlpha * (0.65 + 0.35 * Math.sin(time * 2.2 + p.phase));
        const px = p.x + parallaxX * 0.2;
        const py = p.y + parallaxY * 0.2;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(224, 242, 254, ${twinkle.toFixed(2)})`;
        ctx.fill();
      }

      // 3. Cinematic Perimeter Vignette for optimal UI contrast
      const vignette = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        Math.min(width, height) * 0.40,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.88
      );
      vignette.addColorStop(0, 'rgba(2, 4, 10, 0.35)');
      vignette.addColorStop(0.65, 'rgba(2, 4, 10, 0.65)');
      vignette.addColorStop(1, 'rgba(1, 2, 6, 0.88)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      // Cinema Mode Anamorphic Letterbox Bars (2.39:1)
      if (externalCinemaMode) {
        const targetAspect = 2.39;
        const currentAspect = width / height;
        if (currentAspect < targetAspect) {
          const letterboxHeight = (height - width / targetAspect) / 2;
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, width, letterboxHeight);
          ctx.fillRect(0, height - letterboxHeight, width, letterboxHeight);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleMouseMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth;
      const ny = e.clientY / window.innerHeight;
      mouseRef.current.targetX = nx;
      mouseRef.current.targetY = ny;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [externalCinemaMode]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#020307]">
      {/* High-Resolution Cinematic Space Artwork */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={bgImage}
          alt="Astronaut floating in zero-gravity with curved earth cylinder world and glowing cosmic vortex wormhole"
          referrerPolicy="no-referrer"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover object-center transform transition-transform duration-700 ease-out scale-105 filter contrast-[1.05] brightness-[0.95] ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            transform: `scale(1.05) translate3d(${(mouseRef.current.x - 0.5) * -10}px, ${(mouseRef.current.y - 0.5) * -6}px, 0)`,
          }}
        />

        {/* Ambient Gradient Fallback before image loads */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#09101d] via-[#040710] to-[#010205] animate-pulse" />
        )}
      </div>

      {/* Dynamic Atmospheric Canvas Layer (Vortex Glow, Cosmic Dust Motes) */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

      {/* Cinematic Film Grain Texture */}
      <div className="absolute inset-0 bg-grain pointer-events-none opacity-20 mix-blend-overlay" />
    </div>
  );
};
