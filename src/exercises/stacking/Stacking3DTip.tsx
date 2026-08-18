import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { SHAPES } from './data';
import { mirror, normalize } from './model';
import type { Shape } from './model';

/**
 * Démo 3D : le même empilement à gauche, son SYMÉTRIQUE à droite — les deux
 * manipulables à la souris. Le geste à ancrer : tourner autant qu'on veut ne
 * superposera jamais les deux, parce que la forme est chirale.
 */

const DEMO = SHAPES.find((s) => s.name === 'crochet-5') ?? SHAPES[0];

function Stack3D({ cells, color }: { cells: Shape; color: string }) {
  const centered = useMemo(() => {
    const n = normalize(cells);
    const c = [0, 1, 2].map((i) => (Math.min(...n.map((p) => p[i])) + Math.max(...n.map((p) => p[i]))) / 2);
    return n.map(([x, y, z]) => [x - c[0], y - c[1], z - c[2]] as const);
  }, [cells]);

  return (
    <group>
      {centered.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.9, 0.9, 0.9]} />
          <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />
        </mesh>
      ))}
    </group>
  );
}

function Viewer({ cells, color, label }: { cells: Shape; color: string; label: string }) {
  return (
    <div className="text-center">
      <div className="h-52 w-52 rounded-lg border border-zinc-800 bg-zinc-950">
        <Canvas camera={{ position: [4.2, 3.4, 4.2], fov: 42 }}>
          <ambientLight intensity={0.75} />
          <directionalLight position={[5, 8, 4]} intensity={1.5} />
          <directionalLight position={[-6, 2, -3]} intensity={0.5} />
          <Stack3D cells={cells} color={color} />
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </div>
  );
}

export function Stacking3DTip() {
  const mirrored = useMemo(() => mirror(DEMO.cells), []);

  return (
    <div>
      <p className="text-sm text-zinc-300">
        À gauche l'empilement, à droite son{' '}
        <span className="text-red-400 font-semibold">symétrique</span> (image dans un miroir).{' '}
        <span className="text-sky-400 font-semibold">Fais-les tourner tous les deux</span> : tu ne
        les superposeras jamais. C'est exactement ce que tu dois détecter en 10 secondes.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-8">
        <Viewer cells={DEMO.cells} color="#38bdf8" label="l'original — tourne-moi 🖱" />
        <Viewer cells={mirrored} color="#f87171" label="le symétrique — tourne-moi 🖱" />
      </div>
      <p className="mt-6 text-sm text-zinc-400">
        Le test qui tranche : trois flèches sur la figure — ① le long du plus long bras, ② vers ce
        qui en sort, ③ vers le cube posé au bout — puis pouce, index, majeur. Si ta main droite
        fait le geste sur l'une et pas sur l'autre, elles sont miroirs. Ce sens survit à toutes les
        rotations que tu infliges ici à la souris — essaie de le prendre en défaut.
      </p>
    </div>
  );
}
