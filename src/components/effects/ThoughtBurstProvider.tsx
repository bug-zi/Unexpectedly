import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import * as THREE from 'three';

export interface ThoughtBurstOptions {
  x: number;
  y: number;
  color?: string;
  accentColor?: string;
  intensity?: number;
}

interface ThoughtBurstContextValue {
  triggerThoughtBurst: (options: ThoughtBurstOptions) => void;
}

interface BurstItem {
  group: THREE.Group;
  particles: THREE.Points;
  particleMaterial: THREE.PointsMaterial;
  particlePositions: Float32Array;
  particleVelocities: Float32Array;
  shards: THREE.Mesh[];
  rings: THREE.Mesh[];
  startTime: number;
  duration: number;
}

const ThoughtBurstContext = createContext<ThoughtBurstContextValue>({
  triggerThoughtBurst: () => undefined,
});

const MAX_BURSTS = 4;
const DEFAULT_COLOR = '#f59e0b';
const DEFAULT_ACCENT = '#22d3ee';

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function screenToWorld(x: number, y: number, camera: THREE.PerspectiveCamera) {
  const vector = new THREE.Vector3(
    (x / window.innerWidth) * 2 - 1,
    -(y / window.innerHeight) * 2 + 1,
    0.5
  );
  vector.unproject(camera);

  const direction = vector.sub(camera.position).normalize();
  const distance = -camera.position.z / direction.z;

  return camera.position.clone().add(direction.multiplyScalar(distance));
}

function disposeBurst(burst: BurstItem, scene: THREE.Scene) {
  scene.remove(burst.group);

  burst.particles.geometry.dispose();
  burst.particleMaterial.dispose();

  burst.shards.forEach((shard) => {
    shard.geometry.dispose();
    const material = shard.material;
    if (Array.isArray(material)) {
      material.forEach((item) => item.dispose());
    } else {
      material.dispose();
    }
  });

  burst.rings.forEach((ring) => {
    ring.geometry.dispose();
    const material = ring.material;
    if (Array.isArray(material)) {
      material.forEach((item) => item.dispose());
    } else {
      material.dispose();
    }
  });
}

function createParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;

  const context = canvas.getContext('2d');
  if (!context) {
    return null;
  }

  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.85)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function ThoughtBurstProvider({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const textureRef = useRef<THREE.Texture | null>(null);
  const burstsRef = useRef<BurstItem[]>([]);
  const frameRef = useRef<number | null>(null);
  const disabledRef = useRef(false);

  const stopAnimation = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const renderFrame = useCallback(() => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;

    if (!renderer || !scene || !camera) {
      frameRef.current = null;
      return;
    }

    const now = performance.now();
    burstsRef.current = burstsRef.current.filter((burst) => {
      const elapsed = now - burst.startTime;
      const progress = clamp(elapsed / burst.duration, 0, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const fade = 1 - progress;

      const positions = burst.particlePositions;
      const velocities = burst.particleVelocities;

      for (let index = 0; index < positions.length; index += 3) {
        const particleIndex = index / 3;
        const drag = 1 - progress * 0.36;
        const pullBack = progress > 0.64 ? (progress - 0.64) * 2.4 : 0;

        positions[index] = velocities[index] * easeOut * drag * (1 - pullBack);
        positions[index + 1] =
          velocities[index + 1] * easeOut * drag * (1 - pullBack) +
          Math.sin(progress * Math.PI + particleIndex) * 0.06;
        positions[index + 2] = velocities[index + 2] * easeOut * (1 - pullBack);
      }

      burst.particles.geometry.attributes.position.needsUpdate = true;
      burst.particleMaterial.opacity = Math.max(0, fade);
      burst.particleMaterial.size = 0.06 + Math.sin(progress * Math.PI) * 0.03;

      burst.shards.forEach((shard, index) => {
        const orbit = progress * Math.PI * (index % 2 === 0 ? 1.25 : -1.1);
        const radius = 0.35 + (index % 5) * 0.08;

        shard.position.x = Math.cos(orbit + index) * radius * easeOut;
        shard.position.y = Math.sin(orbit * 0.8 + index) * radius * easeOut;
        shard.position.z = Math.sin(orbit + index) * 0.35;
        shard.rotation.x += 0.045 + index * 0.002;
        shard.rotation.y += 0.035 + index * 0.002;
        shard.scale.setScalar(0.5 + Math.sin(progress * Math.PI) * 0.7);

        const material = shard.material as THREE.MeshBasicMaterial;
        material.opacity = Math.max(0, fade * 0.82);
      });

      burst.rings.forEach((ring, index) => {
        const ringScale = 0.25 + easeOut * (1.4 + index * 0.36);
        ring.scale.set(ringScale, ringScale, ringScale);
        ring.rotation.z += index % 2 === 0 ? 0.018 : -0.014;

        const material = ring.material as THREE.MeshBasicMaterial;
        material.opacity = Math.max(0, fade * (0.52 - index * 0.08));
      });

      if (progress >= 1) {
        disposeBurst(burst, scene);
        return false;
      }

      return true;
    });

    renderer.render(scene, camera);

    if (burstsRef.current.length > 0) {
      frameRef.current = requestAnimationFrame(renderFrame);
    } else {
      frameRef.current = null;
      renderer.clear();
    }
  }, []);

  const ensureRenderer = useCallback(() => {
    if (disabledRef.current || prefersReducedMotion()) {
      return null;
    }

    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      return {
        renderer: rendererRef.current,
        scene: sceneRef.current,
        camera: cameraRef.current,
      };
    }

    const container = containerRef.current;
    if (!container) {
      return null;
    }

    try {
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        100
      );
      camera.position.z = 8;

      rendererRef.current = renderer;
      sceneRef.current = scene;
      cameraRef.current = camera;
      textureRef.current = createParticleTexture();

      return { renderer, scene, camera };
    } catch (error) {
      disabledRef.current = true;
      return null;
    }
  }, []);

  const triggerThoughtBurst = useCallback(
    ({ x, y, color = DEFAULT_COLOR, accentColor = DEFAULT_ACCENT, intensity = 1 }: ThoughtBurstOptions) => {
      const ready = ensureRenderer();
      if (!ready) {
        return;
      }

      const { scene, camera } = ready;
      const origin = screenToWorld(x, y, camera);
      const burstColor = new THREE.Color(color);
      const secondaryColor = new THREE.Color(accentColor);
      const normalizedIntensity = clamp(intensity, 0.7, 1.35);
      const particleCount = Math.round(78 * normalizedIntensity);
      const shardCount = Math.round(10 * normalizedIntensity);
      const duration = 980 + Math.random() * 180;
      const group = new THREE.Group();

      group.position.copy(origin);

      const positions = new Float32Array(particleCount * 3);
      const velocities = new Float32Array(particleCount * 3);
      for (let index = 0; index < particleCount; index += 1) {
        const offset = index * 3;
        const angle = Math.random() * Math.PI * 2;
        const elevation = (Math.random() - 0.5) * Math.PI;
        const speed = 0.55 + Math.random() * 1.3;

        velocities[offset] = Math.cos(angle) * Math.cos(elevation) * speed;
        velocities[offset + 1] = Math.sin(angle) * Math.cos(elevation) * speed;
        velocities[offset + 2] = Math.sin(elevation) * speed * 0.75;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const particleMaterial = new THREE.PointsMaterial({
        color: burstColor,
        map: textureRef.current,
        size: 0.08,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const particles = new THREE.Points(geometry, particleMaterial);
      group.add(particles);

      const shards: THREE.Mesh[] = [];
      for (let index = 0; index < shardCount; index += 1) {
        const shardGeometry =
          index % 3 === 0
            ? new THREE.TetrahedronGeometry(0.12 + Math.random() * 0.08, 0)
            : new THREE.IcosahedronGeometry(0.08 + Math.random() * 0.06, 0);
        const shardMaterial = new THREE.MeshBasicMaterial({
          color: index % 2 === 0 ? burstColor : secondaryColor,
          wireframe: true,
          transparent: true,
          opacity: 0.78,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const shard = new THREE.Mesh(shardGeometry, shardMaterial);
        shard.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        shards.push(shard);
        group.add(shard);
      }

      const rings: THREE.Mesh[] = [];
      for (let index = 0; index < 3; index += 1) {
        const ringGeometry = new THREE.TorusGeometry(0.36 + index * 0.12, 0.008, 8, 96);
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: index % 2 === 0 ? secondaryColor : burstColor,
          transparent: true,
          opacity: 0.45,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2 + (index - 1) * 0.28;
        ring.rotation.y = (index - 1) * 0.22;
        rings.push(ring);
        group.add(ring);
      }

      const burst: BurstItem = {
        group,
        particles,
        particleMaterial,
        particlePositions: positions,
        particleVelocities: velocities,
        shards,
        rings,
        startTime: performance.now(),
        duration,
      };

      if (burstsRef.current.length >= MAX_BURSTS) {
        const oldest = burstsRef.current.shift();
        if (oldest) {
          disposeBurst(oldest, scene);
        }
      }

      burstsRef.current.push(burst);
      scene.add(group);

      if (frameRef.current === null) {
        frameRef.current = requestAnimationFrame(renderFrame);
      }
    },
    [ensureRenderer, renderFrame]
  );

  useEffect(() => {
    const handleResize = () => {
      const renderer = rendererRef.current;
      const camera = cameraRef.current;

      if (!renderer || !camera) {
        return;
      }

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = () => {
      if (motionQuery.matches) {
        stopAnimation();

        const scene = sceneRef.current;
        if (scene) {
          burstsRef.current.forEach((burst) => disposeBurst(burst, scene));
        }
        burstsRef.current = [];
      }
    };

    window.addEventListener('resize', handleResize);
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      motionQuery.removeEventListener('change', handleMotionChange);
      stopAnimation();

      const scene = sceneRef.current;
      if (scene) {
        burstsRef.current.forEach((burst) => disposeBurst(burst, scene));
      }
      burstsRef.current = [];

      textureRef.current?.dispose();
      rendererRef.current?.dispose();
      rendererRef.current?.domElement.remove();

      textureRef.current = null;
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
    };
  }, [stopAnimation]);

  const value = useMemo(
    () => ({
      triggerThoughtBurst,
    }),
    [triggerThoughtBurst]
  );

  return (
    <ThoughtBurstContext.Provider value={value}>
      {children}
      <div
        ref={containerRef}
        aria-hidden="true"
        className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
      />
    </ThoughtBurstContext.Provider>
  );
}

export function useThoughtBurst() {
  return useContext(ThoughtBurstContext);
}
