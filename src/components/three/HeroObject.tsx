"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const P = 2;
const Q = 3;
const RADIUS = 1.12;
const TUBE = 0.3;
const Z_SQUASH = 0.72;
const ORBS = 7;

/**
 * Same parametrisation as THREE.TorusKnotGeometry, pushed outward from the
 * knot's core ring so each orb sits on the tube surface instead of inside it.
 */
function orbPoint(u: number): THREE.Vector3 {
  const cu = Math.cos(u);
  const su = Math.sin(u);
  const quOverP = (Q / P) * u;
  const cs = Math.cos(quOverP);
  const p = new THREE.Vector3(
    RADIUS * (2 + cs) * 0.5 * cu,
    RADIUS * (2 + cs) * su * 0.5,
    RADIUS * Math.sin(quOverP) * 0.5,
  );
  const core = new THREE.Vector3(RADIUS * cu, RADIUS * su, 0);
  const outward = p.clone().sub(core).normalize();
  p.addScaledVector(outward, TUBE * 0.85);
  p.z *= Z_SQUASH;
  return p;
}

/**
 * Soft radial glow drawn once into a small texture. Additive sprites using it
 * stand in for a full-screen bloom pass at a fraction of the GPU cost.
 */
function useGlowTexture() {
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,214,120,1)");
    g.addColorStop(0.2, "rgba(255,178,28,0.7)");
    g.addColorStop(0.45, "rgba(255,150,0,0.24)");
    g.addColorStop(1, "rgba(255,140,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

function Knot() {
  const group = useRef<THREE.Group>(null);
  const glow = useGlowTexture();
  const orbs = useMemo(
    () => Array.from({ length: ORBS }, (_, i) => orbPoint((i / ORBS) * Math.PI * 2 * P + 0.35)),
    [],
  );

  useFrame((state, dt) => {
    if (!group.current) return;
    group.current.rotation.y += dt * 0.22;
    group.current.rotation.x = 0.35 + Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
  });

  return (
    <group ref={group} rotation={[0.35, 0, 0.25]}>
      <mesh scale={[1, 1, Z_SQUASH]}>
        <torusKnotGeometry args={[RADIUS, TUBE, 220, 36, P, Q]} />
        <meshPhysicalMaterial
          color="#1b56ff"
          roughness={0.16}
          metalness={0.12}
          clearcoat={1}
          clearcoatRoughness={0.08}
          envMapIntensity={1.5}
        />
      </mesh>
      {orbs.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh>
            <sphereGeometry args={[0.19, 24, 24]} />
            <meshStandardMaterial
              color="#ffb21c"
              emissive="#ffa200"
              emissiveIntensity={2.6}
              roughness={0.3}
              toneMapped={false}
            />
          </mesh>
          <sprite scale={1.45}>
            <spriteMaterial
              map={glow}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              transparent
              toneMapped={false}
            />
          </sprite>
        </group>
      ))}
      <pointLight position={[0, 0, 0]} intensity={2} color="#ffb21c" distance={4} />
    </group>
  );
}

/** Renders only while on screen and the tab is visible. */
function useActive(ref: React.RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return inView;
}

export default function HeroObject() {
  const wrap = useRef<HTMLDivElement>(null);
  const active = useActive(wrap);

  return (
    <div
      ref={wrap}
      className="absolute inset-0 [mask-image:radial-gradient(circle_at_center,#000_48%,transparent_71%)]"
    >
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 7.2], fov: 36 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => gl.setClearColor("#0b0b0c", 1)}
        className="!absolute inset-0"
      >
        <ambientLight intensity={0.25} />
        <directionalLight position={[4, 6, 5]} intensity={1.6} />
        <pointLight position={[-4, -2, 3]} intensity={0.8} color="#6f8dff" />
        <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.7}>
          <Knot />
        </Float>
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={3} position={[0, 4, -2]} scale={[6, 3, 1]} color="#ffffff" />
          <Lightformer form="rect" intensity={2} position={[-5, 1, 3]} scale={[3, 6, 1]} color="#9ab4ff" />
          <Lightformer form="rect" intensity={1.6} position={[5, -2, 2]} scale={[3, 4, 1]} color="#ffffff" />
        </Environment>
      </Canvas>
    </div>
  );
}
