'use client';

import { useEffect, useRef } from 'react';

export function MathParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;

    const mouse = {
      x: null as number | null,
      y: null as number | null,
      radius: 175,
    };

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      pulseSpeed: number;
      pulseVal: number;
    }

    let particles: Particle[] = [];

    const resizeCanvas = () => {
      if (!canvas) return;
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
    };

    const createParticles = () => {
      particles = [];
      // Кількість зірок розрахована для плавної роботи 60 FPS на весь екран
      const count = Math.min(Math.floor(width / 18), 70);

      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 1.5 + 1.2,
          alpha: Math.random() * 0.35 + 0.3,
          pulseSpeed: Math.random() * 0.02 + 0.01,
          pulseVal: Math.random() * Math.PI,
        });
      }
    };

    resizeCanvas();
    createParticles();

    const handleResize = () => {
      resizeCanvas();
      createParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        // М'який відскок від меж вікна
        if (p.x <= 0 || p.x >= width) p.vx *= -1;
        if (p.y <= 0 || p.y >= height) p.vy *= -1;

        // Пульсація яскравості
        p.pulseVal += p.pulseSpeed;
        const currentAlpha = p.alpha + Math.sin(p.pulseVal) * 0.16;

        // Взаємодія з курсором миші
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            p.x += (dx / dist) * force * 1.3;
            p.y += (dy / dist) * force * 1.3;

            // Промінь від курсора до найближчої зірки
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = `rgba(30, 86, 255, ${0.32 * force})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Малювання зірки
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(30, 86, 255, ${Math.max(0.12, Math.min(0.85, currentAlpha))})`;
        ctx.fill();

        // Лінії сузір'їв між частинками
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 135) {
            const lineAlpha = (1 - dist / 135) * 0.2;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(30, 86, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}