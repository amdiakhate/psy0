import { useState } from 'react';
import { Glyph } from '../../CubeSvg';
import { ALL_ROTATIONS, POS, applyRotation } from '../../cube-model';
import { getSharedEdge } from '../../domain/cubeGeometry';
import { COURSE_CUBE } from '../courseFixtures';
import { PhysicalEdgeJourney } from './PhysicalEdgeJourney';
import { RecenterSequence } from './RecenterSequence';
import { RingCubeWorkshop } from './RingCubeWorkshop';

export function RecenterWorkshop() {
  return <RecenterSequence />;
}

export function RingWorkshop() {
  return <RingCubeWorkshop />;
}

export function PhysicalEdgeRotation() {
  const [symbol, setSymbol] = useState<'arrow' | 'F' | 'L' | 'asymmetric' | 'symmetric'>('arrow');
  const sourceFace = COURSE_CUBE[POS.D];
  const anchorFace = COURSE_CUBE[POS.F];
  const rotation = ALL_ROTATIONS.find((candidate) => candidate.dest[POS.D] === POS.F && candidate.dest[POS.F] === POS.L);
  if (!rotation) throw new Error('Rotation pédagogique F/B introuvable');
  const targetCube = applyRotation(COURSE_CUBE, rotation);
  const sourceShared = getSharedEdge(POS.D, POS.F);
  const targetShared = getSharedEdge(POS.F, POS.L);
  if (!sourceShared || !targetShared) throw new Error('Arête pédagogique F/B introuvable');
  const isolatedGlyph = symbol === 'arrow'
    ? <path d="M50 16 78 48H61v34H39V48H22Z" fill="var(--ink-200)" />
    : symbol === 'F'
      ? <Glyph sym={1} rot={0} />
      : symbol === 'L'
        ? <Glyph sym={0} rot={0} />
        : symbol === 'asymmetric'
          ? <Glyph sym={2} rot={0} />
          : <Glyph sym={8} rot={0} />;
  return (
    <section className="cube-workshop" aria-labelledby="edge-title">
      <header><p className="cube-kicker">Atelier 08</p><h3 id="edge-title">Le même bord physique doit retrouver son voisin</h3><p>Le vrai patron fournit le voisin et le bord. Extrais la face, tourne-la, puis vérifie que le bord rouge rejoint exactement le même voisin.</p></header>
      <div className="mt-5 flex flex-wrap items-center gap-2"><span className="mr-2 text-[10px] font-bold uppercase tracking-[.16em] text-zinc-500">Symboles progressifs</span>{(['arrow','F','L','asymmetric','symmetric'] as const).map((value) => <button key={value} type="button" onClick={() => setSymbol(value)} aria-pressed={symbol === value} className={`rounded-lg border px-3 py-2 text-sm ${symbol === value ? 'border-sky-400 bg-sky-950 text-sky-100' : 'border-zinc-700 text-zinc-400'}`}>{value === 'arrow' ? '↑ Flèche' : value === 'asymmetric' ? 'G asymétrique' : value === 'symmetric' ? '○ Symétrique' : value}</button>)}</div>
      <div className="mt-6">
        <PhysicalEdgeJourney
          key={symbol}
          originalCube={COURSE_CUBE} targetCube={targetCube}
          faceId={sourceFace.id} anchorFaceId={anchorFace.id}
          sourceEdge={sourceShared.aEdge} targetEdge={targetShared.aEdge}
          referenceRot={sourceFace.rot} expectedRot={targetCube[POS.F].rot}
          faceLabel={(id) => id} interactive isolatedGlyph={isolatedGlyph}
        />
      </div>
      {symbol === 'symmetric' && <p className="mt-3 rounded-lg border border-zinc-800 bg-zinc-950/50 p-3 text-sm text-zinc-400">Ici la rotation existe physiquement — le bord rouge le prouve — mais elle est invisible dans le cercle.</p>}
      <p className="cube-rule"><strong>Règle :</strong> ce n’est pas « le haut de l’écran » qui reste fixe. C’est l’arête physique attachée au voisin.</p>
    </section>
  );
}
