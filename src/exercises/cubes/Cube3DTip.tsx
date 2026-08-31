import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { Cube } from './cube-model';
import { NetSvg, SYMBOLS } from './CubeSvg';

/**
 * Démo 3D : le patron à gauche, le cube plié à droite — MANIPULABLE à la souris.
 * Les conventions d'orientation sont identiques au jeu : l'ordre des matériaux de
 * BoxGeometry (+X,−X,+Y,−Y,+Z,−Z) correspond exactement à nos positions R,L,U,D,F,B,
 * et les axes UV de chaque face de three.js coïncident avec nos repères (u,v).
 */

const DEMO_CUBE: Cube = [
  { id: 'R', originalPosition: 0, sym: 0, rot: 0 },
  { id: 'L', originalPosition: 1, sym: 1, rot: 1 },
  { id: 'U', originalPosition: 2, sym: 2, rot: 0 },
  { id: 'D', originalPosition: 3, sym: 3, rot: 2 },
  { id: 'F', originalPosition: 4, sym: 4, rot: 0 },
  { id: 'B', originalPosition: 5, sym: 5, rot: 3 },
];

function faceTexture(sym: number, rot: number): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#d4d4d8';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = '#3f3f46';
  ctx.lineWidth = 10;
  ctx.strokeRect(0, 0, size, size);
  // rot = quarts de tour anti-horaires dans le repère (u,v) de la face ;
  // canvas y vers le bas ⇒ rotation d'écran de −90°·rot, comme en SVG.
  ctx.translate(size / 2, size / 2);
  ctx.rotate((-rot * Math.PI) / 2);
  ctx.translate(-size / 2, -size / 2);
  ctx.scale(size / 100, size / 100);
  ctx.fillStyle = '#18181b';
  const def = SYMBOLS[sym] ?? SYMBOLS[0];
  if (def.kind === 'shape') {
    ctx.fill(new Path2D(def.path));
  } else {
    // Les lettres sont du texte, pas un tracé : on les dessine à la main sur la
    // texture, centrées dans la boîte 100×100 comme les formes.
    ctx.font = '800 64px Helvetica, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(def.char, 50, 53);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function SpinnableCube({ cube }: { cube: Cube }) {
  const materials = useMemo(
    () => cube.map((f) => new THREE.MeshBasicMaterial({ map: faceTexture(f.sym, f.rot) })),
    [cube],
  );
  return (
    <mesh material={materials}>
      <boxGeometry args={[2, 2, 2]} />
    </mesh>
  );
}

export function Cube3DTip() {
  return (
    <div>
      <p className="text-sm text-zinc-300">
        Le même cube, en patron et en 3D : <span className="text-sky-400 font-semibold">fais-le tourner à la souris</span>{' '}
        et vérifie face par face comment les symboles se retrouvent orientés après pliage. C'est le
        geste mental à automatiser.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-8">
        <div className="text-center">
          <NetSvg cube={DEMO_CUBE} size={44} />
          <p className="mt-1 text-xs text-zinc-500">le patron</p>
        </div>
        <div className="h-56 w-56 rounded-lg border border-zinc-800 bg-zinc-950">
          <Canvas camera={{ position: [2.6, 2.2, 2.6], fov: 40 }}>
            <SpinnableCube cube={DEMO_CUBE} />
            <OrbitControls enableZoom={false} enablePan={false} />
          </Canvas>
          <p className="mt-1 text-center text-xs text-zinc-500">le cube plié — tourne-moi 🖱</p>
        </div>
      </div>
      <p className="mt-6 text-sm text-zinc-400">
        Repère utile : sur le patron en croix, deux faces séparées de 2 cases sont TOUJOURS
        opposées sur le cube (jamais visibles ensemble). Vérifie-le en tournant le cube ci-dessus.
      </p>
    </div>
  );
}
