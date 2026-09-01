import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Edges, OrbitControls } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { cubeSceneColors } from '../../../../core/theme';
import type { ResolvedTheme } from '../../../../core/theme';
import { FACE_FRAMES } from '../../domain/cubeGeometry';
import type { FacePosition } from '../../domain/types';
import { COURSE_FACE_COLORS, COURSE_FACE_IDS, COURSE_FACE_TO_POSITION } from '../courseFixtures';
import type { CourseFaceId } from '../courseModel';
import type { RingScene } from '../ringSceneModel';
import { useReducedMotion } from './useReducedMotion';

export interface MentalRingCubeLayers {
  neighbors: boolean;
  opposite: boolean;
  numbers: boolean;
  edges: boolean;
  neighborLabels: boolean;
}

export interface RingFaceVisual {
  label: string;
  neighborNumber: number | null;
  center: boolean;
  opposite: boolean;
}

const DEFAULT_LAYERS: MentalRingCubeLayers = {
  neighbors: true,
  opposite: true,
  numbers: true,
  edges: true,
  neighborLabels: true,
};

export function getRingFaceVisual(
  scene: RingScene,
  faceId: CourseFaceId,
  showNumbers: boolean,
  showNeighborLabels: boolean,
): RingFaceVisual {
  const index = scene.displayedNeighbors.indexOf(faceId);
  const neighbor = index >= 0;
  return {
    label: neighbor && !showNeighborLabels ? '?' : faceId,
    neighborNumber: neighbor && showNumbers ? index + 1 : null,
    center: faceId === scene.centerFaceId,
    opposite: faceId === scene.oppositeFaceId,
  };
}

function faceQuaternion(position: FacePosition): THREE.Quaternion {
  const frame = FACE_FRAMES[position];
  const matrix = new THREE.Matrix4().set(
    frame.right[0], frame.up[0], frame.normal[0], 0,
    frame.right[1], frame.up[1], frame.normal[1], 0,
    frame.right[2], frame.up[2], frame.normal[2], 0,
    0, 0, 0, 1,
  );
  return new THREE.Quaternion().setFromRotationMatrix(matrix);
}

function sceneQuaternion(scene: RingScene): THREE.Quaternion {
  const matrix = scene.cubeTransform;
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().set(
    matrix[0], matrix[1], matrix[2], 0,
    matrix[3], matrix[4], matrix[5], 0,
    matrix[6], matrix[7], matrix[8], 0,
    0, 0, 0, 1,
  ));
}

function makeTexture(faceId: CourseFaceId, visual: RingFaceVisual): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D indisponible');
  const base = visual.label === '?' ? '#3f3f46' : visual.opposite ? '#27272a' : COURSE_FACE_COLORS[faceId];
  context.fillStyle = base;
  context.fillRect(0, 0, 256, 256);
  context.strokeStyle = visual.center ? '#ffffff' : visual.neighborNumber ? '#38bdf8' : '#52525b';
  context.lineWidth = visual.center ? 18 : 10;
  context.strokeRect(7, 7, 242, 242);
  context.fillStyle = visual.opposite ? '#a1a1aa' : '#111827';
  context.font = '900 112px ui-monospace, monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(visual.label, 128, 137);
  if (visual.neighborNumber !== null) {
    context.beginPath();
    context.arc(42, 42, 27, 0, Math.PI * 2);
    context.fillStyle = '#38bdf8';
    context.fill();
    context.fillStyle = '#082f49';
    context.font = '900 32px ui-monospace, monospace';
    context.fillText(String(visual.neighborNumber), 42, 44);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function FacePlane({ faceId, scene, layers, onFaceClick }: {
  faceId: CourseFaceId;
  scene: RingScene;
  layers: MentalRingCubeLayers;
  onFaceClick?(faceId: CourseFaceId): void;
}) {
  const position = COURSE_FACE_TO_POSITION[faceId];
  const frame = FACE_FRAMES[position];
  const visual = getRingFaceVisual(scene, faceId, layers.numbers, layers.neighborLabels);
  const texture = useMemo(() => makeTexture(faceId, visual), [faceId, visual.label, visual.neighborNumber, visual.center, visual.opposite]);
  useEffect(() => () => texture.dispose(), [texture]);
  const opacity = visual.opposite && layers.opposite ? 0.28 : 1;
  const neighborHidden = scene.displayedNeighbors.includes(faceId) && !layers.neighbors;
  return (
    <mesh
      position={[frame.normal[0] * 1.01, frame.normal[1] * 1.01, frame.normal[2] * 1.01]}
      quaternion={faceQuaternion(position)}
      onClick={(event) => { event.stopPropagation(); onFaceClick?.(faceId); }}
    >
      <planeGeometry args={[1.92, 1.92]} />
      <meshBasicMaterial
        map={texture}
        transparent={neighborHidden || opacity < 1}
        opacity={neighborHidden ? 0.2 : opacity}
        depthWrite={!neighborHidden && opacity === 1}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

function AnimatedCube({ scene, layers, onFaceClick, theme }: {
  scene: RingScene;
  layers: MentalRingCubeLayers;
  onFaceClick?(faceId: CourseFaceId): void;
  theme: ResolvedTheme;
}) {
  const group = useRef<THREE.Group>(null);
  const reduced = useReducedMotion();
  const target = useMemo(() => sceneQuaternion(scene), [scene]);
  useFrame((_, delta) => {
    if (!group.current) return;
    if (reduced) group.current.quaternion.copy(target);
    else group.current.quaternion.slerp(target, 1 - Math.exp(-8 * delta));
  });
  return (
    <group ref={group}>
      {COURSE_FACE_IDS.map((faceId) => <FacePlane key={faceId} faceId={faceId} scene={scene} layers={layers} onFaceClick={onFaceClick} />)}
      {layers.edges && (
        <mesh>
          <boxGeometry args={[2.03, 2.03, 2.03]} />
          <meshBasicMaterial transparent opacity={0} />
          <Edges color={cubeSceneColors(theme).edge} threshold={15} />
        </mesh>
      )}
    </group>
  );
}

function CameraReset({ scene }: { scene: RingScene }) {
  const camera = useThree((state) => state.camera);
  useEffect(() => {
    camera.position.set(0, 0, 5.4);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, scene.centerFaceId, scene.quarterTurn]);
  return null;
}

export function MentalRingCube3D({
  scene,
  hidden = false,
  layers = DEFAULT_LAYERS,
  interactive = true,
  onFaceClick,
}: {
  scene: RingScene;
  hidden?: boolean;
  layers?: MentalRingCubeLayers;
  interactive?: boolean;
  onFaceClick?(faceId: CourseFaceId): void;
}) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<ResolvedTheme>('sombre');
  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    const updateTheme = () => setTheme(root.dataset.theme === 'light' ? 'clair' : 'sombre');
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  if (hidden) {
    return <div className="grid min-h-[320px] place-items-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/55 p-6 text-center text-zinc-400"><p><strong className="block text-zinc-200">Cube 3D masqué avant ta réponse</strong>Reconstruis l’anneau depuis le patron, puis révèle le cube en correction.</p></div>;
  }
  return (
    <figure className="cube-3d-stage relative min-h-[320px] overflow-hidden rounded-2xl border border-zinc-800" aria-label={`Cube 3D, face ${scene.centerFaceId} devant`}>
      <figcaption className="absolute left-3 top-3 z-10 rounded-lg bg-zinc-950/90 px-3 py-2 text-xs font-semibold text-zinc-200">Face centrale {scene.centerFaceId} · Face opposée {scene.oppositeFaceId}</figcaption>
      {layers.neighborLabels && (
        <div className="sr-only">
          {scene.displayedNeighbors.map((faceId, index) => <span key={faceId}>Voisin {index + 1} : {faceId}. </span>)}
        </div>
      )}
      {mounted ? (
        <div data-cube-canvas className="h-[340px] w-full">
          <Canvas camera={{ position: [0, 0, 5.4], fov: 38 }} dpr={[1, 1.75]}>
            <CameraReset scene={scene} />
            <AnimatedCube scene={scene} layers={layers} onFaceClick={onFaceClick} theme={theme} />
            <OrbitControls makeDefault enabled={interactive} enablePan={false} minDistance={4.2} maxDistance={7} />
          </Canvas>
        </div>
      ) : <div className="h-[340px]" aria-hidden />}
      {layers.neighbors && (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {scene.displayedNeighbors.map((faceId, index) => {
            const positions = ['left-1/2 top-12 -translate-x-1/2', 'right-3 top-1/2 -translate-y-1/2', 'bottom-10 left-1/2 -translate-x-1/2', 'left-3 top-1/2 -translate-y-1/2'] as const;
            return (
              <span key={faceId} className={`absolute rounded-full border border-sky-400/70 bg-zinc-950/90 px-2.5 py-1 font-mono text-xs font-black text-sky-200 shadow-lg ${positions[index]}`}>
                {index + 1}{layers.neighborLabels ? ` · ${faceId}` : ''}
              </span>
            );
          })}
        </div>
      )}
      <p className="absolute inset-x-3 bottom-3 text-center text-[11px] text-zinc-400">Glisse pour explorer · clique une face pour la sélectionner</p>
    </figure>
  );
}
