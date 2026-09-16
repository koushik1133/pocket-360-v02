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

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    // Set up Scene, Camera, Renderer safely
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

    // Create subtle particles / light dust field
    const particleCount = 45;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      scales[i] = Math.random() * 0.04 + 0.02;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xb53526,
      size: 0.06,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Subtle 3D torus ring placed in the upper background to avoid distracting from typography
    const ringGeo = new THREE.TorusGeometry(1.3, 0.006, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x8a382e,
      transparent: true,
      opacity: 0.08,
      wireframe: true,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(1.6, 1.1, -1.2);
    ring.rotation.x = Math.PI / 3;
    ring.rotation.y = Math.PI / 5;
    scene.add(ring);

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 0.6;
      targetY = (e.clientY / window.innerHeight - 0.5) * 0.6;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      particles.rotation.y += 0.001;
      particles.rotation.x = mouseY * 0.4;
      particles.position.x = mouseX * 0.5;

      ring.rotation.z += 0.002;
      ring.rotation.x = Math.PI / 3 + mouseY * 0.3;
      ring.rotation.y = Math.PI / 6 + mouseX * 0.3;

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      material.dispose();
      ringGeo.dispose();
      ringMat.dispose();
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
      <div className="hero-fallback-ambient" />
    </div>
  );
}

