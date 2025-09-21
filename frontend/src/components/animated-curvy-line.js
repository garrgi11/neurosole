"use client";

import { useEffect, useRef } from "react";

const TWO_PI = Math.PI * 2;

// Animated canvas line with smooth random target shifts.
export default function AnimatedCurvyLine({
  className = "",
  stroke = "rgba(148, 163, 184, 0.65)",
  thickness = 1.2,
  pointCount = 36,
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const pointsRef = useRef([]);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return undefined;
    }

    const initPoints = (width, height) => {
      const usableCount = Math.max(6, pointCount);
      const horizontalGap = width / (usableCount - 1 || 1);
      pointsRef.current = Array.from({ length: usableCount }, (_, index) => {
        const x = index * horizontalGap;
        return {
          x,
          y: height * 0.5,
          targetY: height * 0.5,
          velocity: 0,
          changeTimer: Math.random() * 600,
          changeInterval: 1100 + Math.random() * 1800,
          phase: Math.random() * TWO_PI,
          sway: 0.5 + Math.random() * 0.9,
        };
      });
    };

    const prepareSize = () => {
      const parent = canvas.parentElement;
      if (!parent) {
        return;
      }

      const rect = parent.getBoundingClientRect();
      const width = rect.width || 1;
      const height = rect.height || 1;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      sizeRef.current = { width, height, dpr };

      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      initPoints(width, height);
    };

    const updatePoints = (deltaMs, timestamp) => {
      const { height } = sizeRef.current;
      if (!height) {
        return;
      }

      const maxAmplitude = height * 0.32;
      const spring = 0.0028;
      const damping = 0.87;
      const jitterFactor = 0.12;

      pointsRef.current.forEach((point, index, arr) => {
        point.changeTimer += deltaMs;

        if (point.changeTimer >= point.changeInterval) {
          point.changeTimer = 0;
          point.changeInterval = 900 + Math.random() * 1500;
          const denominator = Math.max(arr.length - 1, 1);
          const normalized = index / denominator;
          const edgeWeights = Math.min(normalized, 1 - normalized);
          const smoothEdge = Math.pow(edgeWeights, 0.6);
          point.targetY = height * 0.5 + (Math.random() - 0.5) * maxAmplitude * (0.4 + smoothEdge * 0.9);
        }

        const swayOffset = Math.sin(point.phase + timestamp * 0.0006 * point.sway) * maxAmplitude * jitterFactor;
        const acceleration = (point.targetY + swayOffset - point.y) * spring * deltaMs;
        point.velocity = (point.velocity + acceleration) * damping;
        point.y += point.velocity;
      });
    };

    const draw = () => {
      const { width, height } = sizeRef.current;
      if (!width || !height) {
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const points = pointsRef.current;
      if (points.length < 2) {
        return;
      }

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length - 1; i += 1) {
        const current = points[i];
        const next = points[i + 1];
        const midX = (current.x + next.x) / 2;
        const midY = (current.y + next.y) / 2;
        ctx.quadraticCurveTo(current.x, current.y, midX, midY);
      }

      const lastPoint = points[points.length - 1];
      ctx.lineTo(lastPoint.x, lastPoint.y);

      ctx.strokeStyle = stroke;
      ctx.lineWidth = thickness;
      ctx.stroke();
    };

    const animate = (timestamp) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }
      const deltaMs = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      updatePoints(deltaMs, timestamp);
      draw();

      animationRef.current = requestAnimationFrame(animate);
    };

    prepareSize();
    lastTimeRef.current = 0;
    animationRef.current = requestAnimationFrame(animate);

    let resizeObserver;
    let handleResize;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        prepareSize();
      });
      resizeObserver.observe(canvas.parentElement || canvas);
    } else {
      handleResize = () => {
        prepareSize();
      };
      window.addEventListener("resize", handleResize);
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (handleResize) {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, [pointCount, stroke, thickness]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
