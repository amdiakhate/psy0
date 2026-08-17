import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import type { PerspectiveCamera } from 'three';
import { CAMERA_HEIGHT, LOOK_AT_HEIGHT, SCENE_RADIUS, VIEW_RADIUS } from './config';
import { OBJECT_COLORS, viewpointPosition } from './scene';
import type { ObjectKind, SceneObject } from './scene';

/**
 * La scène du désert vue depuis un des 8 points de vue.
 *
 * La caméra est placée EXACTEMENT au point de vue (rayon VIEW_RADIUS) et regarde
 * le centre : la projection perspective à l'écran est donc celle que `scene.ts`
 * calcule (latéral / profondeur), ce qui rend l'unicité vérifiée dans les tests
 * réellement lisible sur l'image.
 */

/**
 * Le plus grand écart horizontal possible : un objet au bord du désert vu de
 * trois-quarts atteint une tangente de 0,73 (0,58 pour son centre + son
 * encombrement). On garde une marge.
 */
const MIN_HALF_TAN_X = 0.78;
/** Ouverture verticale minimale, pour ne pas écraser la scène sur les cadres larges. */
const MIN_FOV_DEG = 42;

function CameraRig({ viewpoint }: { viewpoint: number }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  useEffect(() => {
    const p = viewpointPosition(viewpoint);
    camera.position.set(p.x, CAMERA_HEIGHT, p.z);
    camera.lookAt(0, LOOK_AT_HEIGHT, 0);

    // Le champ vertical s'adapte au format du conteneur : QUEL QUE SOIT son ratio,
    // le champ horizontal couvre toute la scène et aucun objet n'est coupé.
    const perspective = camera as PerspectiveCamera;
    const aspect = Math.max(size.width, 1) / Math.max(size.height, 1);
    const halfTanY = Math.max(Math.tan((MIN_FOV_DEG * Math.PI) / 360), MIN_HALF_TAN_X / aspect);
    perspective.fov = (2 * Math.atan(halfTanY) * 180) / Math.PI;
    perspective.updateProjectionMatrix();
  }, [camera, viewpoint, size.width, size.height]);

  return null;
}

function Prop({ kind }: { kind: ObjectKind }) {
  const color = OBJECT_COLORS[kind];
  switch (kind) {
    case 'pyramide':
      return (
        <mesh position={[0, 0.95, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[0.85, 1.9, 4]} />
          <meshStandardMaterial color={color} flatShading roughness={0.85} />
        </mesh>
      );
    case 'tour':
      return (
        <group>
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.3, 0.38, 2.4, 10]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
          <mesh position={[0, 2.55, 0]}>
            <boxGeometry args={[0.62, 0.32, 0.62]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.8} />
          </mesh>
        </group>
      );
    case 'cube':
      return (
        <mesh position={[0, 0.6, 0]} rotation={[0, 0.35, 0]}>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      );
    case 'cactus':
      return (
        <group>
          <mesh position={[0, 0.95, 0]}>
            <cylinderGeometry args={[0.24, 0.28, 1.9, 10]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
          <mesh position={[0.24, 1.2, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.14, 0.14, 0.48, 8]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
          <mesh position={[0.45, 1.55, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.75, 8]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
        </group>
      );
    case 'rocher':
      return (
        <mesh position={[0, 0.65, 0]} rotation={[0.4, 0.9, 0.2]}>
          <icosahedronGeometry args={[0.8, 0]} />
          <meshStandardMaterial color={color} flatShading roughness={1} />
        </mesh>
      );
    case 'antenne':
      return (
        <group>
          <mesh position={[0, 1.35, 0]}>
            <cylinderGeometry args={[0.07, 0.11, 2.7, 8]} />
            <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
          </mesh>
          <mesh position={[0, 2.85, 0]}>
            <sphereGeometry args={[0.28, 14, 10]} />
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
          </mesh>
        </group>
      );
  }
}

function Desert({ objects }: { objects: readonly SceneObject[] }) {
  return (
    <group>
      {/* le sable */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[VIEW_RADIUS + 6, 64]} />
        <meshStandardMaterial color="#c8a26a" roughness={1} />
      </mesh>
      {/* le cercle des points de vue, tracé au sol */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[SCENE_RADIUS + 0.35, SCENE_RADIUS + 0.5, 64]} />
        <meshBasicMaterial color="#a17a45" />
      </mesh>
      {objects.map((o, i) => (
        <group key={i} position={[o.x, 0, o.z]}>
          <Prop kind={o.kind} />
        </group>
      ))}
    </group>
  );
}

export function DesertView({
  objects,
  viewpoint,
}: {
  objects: readonly SceneObject[];
  viewpoint: number;
}) {
  return (
    // Le fov est recalculé par CameraRig d'après le format réel du conteneur.
    <Canvas camera={{ fov: MIN_FOV_DEG, near: 0.1, far: 120 }} gl={{ antialias: true }}>
      <color attach="background" args={['#7dbbe6']} />
      <fog attach="fog" args={['#c9ddec', 22, 60]} />
      <CameraRig viewpoint={viewpoint} />
      <hemisphereLight args={['#cfe8ff', '#b08a4f', 1.1]} />
      <directionalLight position={[8, 14, 6]} intensity={1.5} />
      <Desert objects={objects} />
    </Canvas>
  );
}
