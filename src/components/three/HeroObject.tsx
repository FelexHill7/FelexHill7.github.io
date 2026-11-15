"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/**
 * Hero object: a small neural network swaying slowly in space. Gold signals
 * fire through it layer by layer (a forward pass) every couple of seconds;
 * each node lights up gold as a signal arrives, then fades back to blue.
 */

const LAYERS = [4, 7, 7, 5, 2];
const SPACING = 0.95;
const NODE_RADIUS = 0.15;
const HOP = 0.45; // seconds for a signal to cross one layer
const WAVE_EVERY = 2.2; // seconds between forward passes
const FIRE_RATE = 0.28; // share of connections that carry a signal each pass
const MAX_PULSES = 40;

type NodeSpec = { pos: THREE.Vector3; layer: number };

/** Nodes sit on a ring per layer, layers spaced along x, so it has depth as it turns. */
function layout(): { nodes: NodeSpec[]; edges: [number, number][] } {
  const nodes: NodeSpec[] = [];
  LAYERS.forEach((n, layer) => {
    const x = (layer - (LAYERS.length - 1) / 2) * SPACING;
    const r = 0.3 + n * 0.14;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + layer * 0.5;
      nodes.push({ pos: new THREE.Vector3(x, Math.sin(a) * r, Math.cos(a) * r * 0.75), layer });
    }
  });
  const edges: [number, number][] = [];
  nodes.forEach((a, i) =>
    nodes.forEach((b, j) => {
      if (b.layer === a.layer + 1) edges.push([i, j]);
    }),
  );
  return { nodes, edges };
}

/** Deterministic pseudo-random in [0, 1) so each pass picks its own set of connections. */
function rand(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

/** Soft radial glow drawn once into a small texture; additive sprites stand in for bloom. */
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

function Network() {
  const group = useRef<THREE.Group>(null);
  const glow = useGlowTexture();
  const { nodes, edges } = useMemo(layout, []);
  const sphere = useMemo(() => new THREE.SphereGeometry(NODE_RADIUS, 32, 32), []);
  const level = useMemo(() => new Float32Array(nodes.length), [nodes]);
  const golds = useRef<(THREE.Mesh | null)[]>([]);
  const halos = useRef<(THREE.Sprite | null)[]>([]);
  const pulses = useRef<(THREE.Sprite | null)[]>([]);

  const lines = useMemo(() => {
    const pos = new Float32Array(edges.length * 6);
    edges.forEach(([a, b], k) => {
      nodes[a].pos.toArray(pos, k * 6);
      nodes[b].pos.toArray(pos, k * 6 + 3);
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, [nodes, edges]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    // sway within side-on angles rather than spinning fully: end-on, the layers stack up
    g.rotation.y = -0.35 + Math.sin(t * 0.25) * 0.55;
    g.rotation.x = 0.25 + Math.sin(t * 0.3) * 0.12;
    g.position.y = Math.sin(t * 1.4) * 0.06;

    level.fill(0);
    let used = 0;
    const current = Math.floor(t / WAVE_EVERY);
    // a pass lasts longer than WAVE_EVERY, so the previous two may still be fading out
    for (let w = current - 2; w <= current; w++) {
      const start = w * WAVE_EVERY;
      for (let k = 0; k < edges.length; k++) {
        if (rand(w * 997 + k) > FIRE_RATE) continue;
        const [a, b] = edges[k];
        const p = (t - start - nodes[a].layer * HOP) / HOP;
        if (p < 0) continue;
        if (p <= 1 && used < MAX_PULSES) {
          const s = pulses.current[used++];
          if (s) {
            s.visible = true;
            s.position.lerpVectors(nodes[a].pos, nodes[b].pos, p);
            (s.material as THREE.SpriteMaterial).opacity = Math.sin(p * Math.PI) * 0.95 + 0.05;
          }
        }
        if (p < 0.4) level[a] = Math.max(level[a], 1 - p / 0.4); // source fires
        if (p > 0.85) level[b] = Math.max(level[b], 1 - (p - 0.85) / 1.6); // target lights up, then fades
      }
    }
    for (let i = used; i < MAX_PULSES; i++) {
      const s = pulses.current[i];
      if (s) s.visible = false;
    }
    for (let i = 0; i < nodes.length; i++) {
      const v = Math.max(0, level[i]);
      const gold = golds.current[i];
      const halo = halos.current[i];
      if (gold) {
        gold.visible = v > 0.01;
        // steep curve: a firing node reads as gold, never a blue-gold mix
        (gold.material as THREE.MeshStandardMaterial).opacity = Math.min(1, v * 2);
      }
      if (halo) {
        halo.visible = v > 0.01;
        (halo.material as THREE.SpriteMaterial).opacity = v * 0.9;
      }
    }
  });

  return (
    <group ref={group}>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color="#5b7dff" transparent opacity={0.18} depthWrite={false} />
      </lineSegments>

      {nodes.map((n, i) => (
        <group key={i} position={n.pos}>
          {/* glossy blue node, same finish as the rest of the hero */}
          <mesh geometry={sphere}>
            <meshPhysicalMaterial
              color="#1b56ff"
              roughness={0.16}
              metalness={0.12}
              clearcoat={1}
              clearcoatRoughness={0.08}
              envMapIntensity={1.5}
            />
          </mesh>
          {/* gold shell that fades in when the node fires */}
          <mesh
            geometry={sphere}
            scale={1.04}
            visible={false}
            ref={(m) => {
              golds.current[i] = m;
            }}
          >
            <meshStandardMaterial
              color="#ffb21c"
              emissive="#ffa200"
              emissiveIntensity={2.6}
              roughness={0.3}
              transparent
              opacity={0}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
          <sprite
            scale={1.15}
            visible={false}
            ref={(s) => {
              halos.current[i] = s;
            }}
          >
            <spriteMaterial map={glow} blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0} toneMapped={false} />
          </sprite>
        </group>
      ))}

      {Array.from({ length: MAX_PULSES }, (_, i) => (
        <sprite
          key={`p${i}`}
          scale={0.42}
          visible={false}
          ref={(s) => {
            pulses.current[i] = s;
          }}
        >
          <spriteMaterial map={glow} blending={THREE.AdditiveBlending} depthWrite={false} transparent toneMapped={false} />
        </sprite>
      ))}
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
      className="absolute inset-0 [mask-image:radial-gradient(circle_at_center,#000_50%,transparent_72%)]"
    >
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 7.6], fov: 36 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => gl.setClearColor("#0b0b0c", 1)}
        className="!absolute inset-0"
      >
        <ambientLight intensity={0.25} />
        <directionalLight position={[4, 6, 5]} intensity={1.6} />
        <pointLight position={[-4, -2, 3]} intensity={0.8} color="#6f8dff" />
        <Network />
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={3} position={[0, 4, -2]} scale={[6, 3, 1]} color="#ffffff" />
          <Lightformer form="rect" intensity={2} position={[-5, 1, 3]} scale={[3, 6, 1]} color="#9ab4ff" />
          <Lightformer form="rect" intensity={1.6} position={[5, -2, 2]} scale={[3, 4, 1]} color="#ffffff" />
        </Environment>
      </Canvas>
    </div>
  );
}
