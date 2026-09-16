"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function HeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Check WebGL availability on a throwaway canvas so we never taint the actual canvas
    let glAvailable = false;
    try {
      const probeCanvas = document.createElement("canvas");
      glAvailable = Boolean(
        probeCanvas.getContext("webgl2") ||
        probeCanvas.getContext("webgl") ||
        probeCanvas.getContext("experimental-webgl"),
      );
    } catch {
      glAvailable = false;
    }

    if (!glAvailable) {
      return;
    }

    // Disable WebGL loop on mobile (<768px) — CSS flakes cover mobile instead
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) {
      return;
    }

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    // ─── Renderer ───────────────────────────────────────────────────────────
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    camera.position.z = 5;

    // ─── Red Flakes / Particle Field ────────────────────────────────────────
    const particleCount = 55;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3); // individual drift

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
      // slow individual drift per particle
      velocities[i * 3]     = (Math.random() - 0.5) * 0.0012;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.0008;
      velocities[i * 3 + 2] = 0;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xcc101e,       // brand accent red
      size: 0.08,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // ─── Mouse tracking ──────────────────────────────────────────────────────
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let isVisible = true;

    const onMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 0.8;
      targetY = (e.clientY / window.innerHeight - 0.5) * 0.8;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    let animationFrameId: number;
    let clock = 0;

    const animate = () => {
      if (!isVisible) return;
      animationFrameId = requestAnimationFrame(animate);

      clock += 0.016;
      mouseX += (targetX - mouseX) * 0.04;
      mouseY += (targetY - mouseY) * 0.04;

      // Drift each particle independently
      const pos = geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        pos.setX(i, pos.getX(i) + (velocities[i * 3] ?? 0));
        pos.setY(i, pos.getY(i) + (velocities[i * 3 + 1] ?? 0) + Math.sin(clock * 0.5 + i) * 0.0003);
        // wrap particles back into scene bounds
        if (pos.getX(i) > 5)  pos.setX(i, -5);
        if (pos.getX(i) < -5) pos.setX(i,  5);
        if (pos.getY(i) > 4)  pos.setY(i, -4);
        if (pos.getY(i) < -4) pos.setY(i,  4);
      }
      pos.needsUpdate = true;

      particles.rotation.y += 0.0008;
      particles.rotation.x = mouseY * 0.35;
      particles.position.x = mouseX * 0.6;
      particles.position.y = -mouseY * 0.2;

      renderer.render(scene, camera);
    };

    // ─── Pause RAF when hero scrolls out of view ─────────────────────────────
    const observer = new IntersectionObserver(
      ([entry]) => {
        const currentlyVisible = entry ? entry.isIntersecting : true;
        if (currentlyVisible && !isVisible) {
          isVisible = true;
          animate();
        } else if (!currentlyVisible && isVisible) {
          isVisible = false;
          cancelAnimationFrame(animationFrameId);
        }
      },
      { threshold: 0.05 },
    );

    observer.observe(container);
    animate();

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="hero-canvas-container absolute inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* CSS flakes — visible on ALL devices incl. mobile, respect prefers-reduced-motion */}
      <div className="hero-css-flakes" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} className={`hero-flake hero-flake--${i + 1}`} />
        ))}
      </div>
      <div className="hero-fallback-ambient" />
    </div>
  );
}
