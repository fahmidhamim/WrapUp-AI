import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  angle: number;
  speed: number;
  length: number;
  life: number;
  maxLife: number;
  color: string;
}

const STAR_COLORS = [
  "255, 255, 255",
  "200, 220, 255",
  "160, 180, 255",
  "130, 160, 255",
  "220, 180, 255",
  "255, 200, 220",
  "140, 220, 255",
  "180, 140, 255",
  "255, 210, 160",
  "100, 200, 255",
  "200, 160, 255",
  "120, 255, 220",
];

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingRef = useRef<ShootingStar[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = Math.min(180, Math.floor((window.innerWidth * window.innerHeight) / 8000));
    starsRef.current = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.18 + 0.04;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 0.7 + 0.2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        opacity: Math.random() * 0.3 + 0.7,
        twinkleSpeed: Math.random() * 0.02 + 0.004,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      };
    });

    let time = 0;
    let nextShoot = Math.random() * 200 + 100;

    const spawnShootingStar = () => {
      const angle = Math.random() * 0.6 + 0.3; // ~20-50 degrees downward
      const startX = Math.random() * canvas.width * 0.8;
      const startY = Math.random() * canvas.height * 0.4;
      shootingRef.current.push({
        x: startX,
        y: startY,
        angle,
        speed: Math.random() * 8 + 6,
        length: Math.random() * 60 + 40,
        life: 0,
        maxLife: Math.random() * 40 + 30,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      });
    };

    const animate = () => {
      time += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Stars
      for (const star of starsRef.current) {
        star.x += star.vx;
        star.y += star.vy;

        if (star.x < -2) star.x = canvas.width + 2;
        if (star.x > canvas.width + 2) star.x = -2;
        if (star.y < -2) star.y = canvas.height + 2;
        if (star.y > canvas.height + 2) star.y = -2;

        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.5 + 0.5;
        const alpha = star.opacity * (0.5 + twinkle * 0.5);

        // Crisp bright dot
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${star.color}, ${Math.min(alpha * 1.6, 1)})`;
        ctx.fill();

        // Tiny sharp glow ring (not blurry, just slightly larger)
        if (twinkle > 0.6) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size + 0.5, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${star.color}, ${alpha * 0.3})`;
          ctx.lineWidth = 0.3;
          ctx.stroke();
        }
      }

      // Shooting stars
      nextShoot -= 1;
      if (nextShoot <= 0) {
        spawnShootingStar();
        nextShoot = Math.random() * 300 + 150;
      }

      shootingRef.current = shootingRef.current.filter((s) => {
        s.life += 1;
        const progress = s.life / s.maxLife;
        const fadeIn = Math.min(progress * 4, 1);
        const fadeOut = 1 - Math.pow(progress, 2);
        const alpha = fadeIn * fadeOut;

        const headX = s.x + Math.cos(s.angle) * s.speed * s.life;
        const headY = s.y + Math.sin(s.angle) * s.speed * s.life;
        const tailX = headX - Math.cos(s.angle) * s.length * alpha;
        const tailY = headY - Math.sin(s.angle) * s.length * alpha;

        const grad = ctx.createLinearGradient(tailX, tailY, headX, headY);
        grad.addColorStop(0, `rgba(${s.color}, 0)`);
        grad.addColorStop(1, `rgba(${s.color}, ${alpha * 0.8})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(headX, headY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Bright head dot
        ctx.beginPath();
        ctx.arc(headX, headY, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
        ctx.fill();

        return s.life < s.maxLife;
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: "transparent" }}
    />
  );
}
