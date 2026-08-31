# Cubes Visual Coach Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a geometry-backed visual Coach, targeted drills, per-skill progress and replayable history to the existing Cubes 2D/3D exercise without changing its gameplay semantics.

**Architecture:** Extend the current 24-rotation model with stable face identities and frame-derived topology. Keep `sameCube()` authoritative until an exhaustive differential suite reports zero identity, orientation and global-verdict divergences; only then switch validation and build React UI. Store Cubes Coach records in a versioned localStorage document separate from the generic event log.

**Tech Stack:** React 19, TypeScript 6 strict, Vite 8, Tailwind CSS 4, Vitest 4, localStorage, SVG/CSS, existing Three.js stack.

**Spec:** `docs/superpowers/specs/2026-08-31-cubes-coach-design.md`

## Global Constraints

- Preserve the current Cubes gameplay, timing and simulation behavior.
- Do not create Coach UI before the exhaustive differential report has all three counters at zero.
- Derive opposites, adjacency, rings and physical edges from face frames, never from duplicated lookup tables.
- Keep `sameCube()` in place until the differential gate passes.
- Enable the Coach by default in training and never show it during a simulation.
- Add no dependency.
- Keep TypeScript strict and do not add `any`.
- Respect `prefers-reduced-motion`; every animation has replay and skip controls.

---

### Task 1: Stable face identity and frame-derived geometry

**Files:**
- Create: `src/exercises/cubes/domain/types.ts`
- Create: `src/exercises/cubes/domain/cubeGeometry.ts`
- Create: `src/exercises/cubes/domain/fixtures.ts`
- Create: `src/exercises/cubes/domain/cubeGeometry.test.ts`
- Modify: `src/exercises/cubes/cube-model.ts`
- Modify: `src/exercises/cubes/generator.ts`
- Modify: `src/exercises/cubes/CubeSvg.tsx`
- Modify: `src/exercises/cubes/FoldingNet.tsx`
- Modify: `src/exercises/cubes/generator.test.ts`

**Interfaces:**
- Produces: `FaceId`, `FacePosition`, `QuarterTurn`, `FaceEdge`, `CubeFace`, `Cube`, `FaceFrame`.
- Produces: `getOppositePosition`, `getNeighborAtEdge`, `getClockwiseNeighbors`, `getSharedEdge`, `rotateEdge`, `applyGeometryRotation`, `sameCubeGeometry`.
- Preserves: `ALL_ROTATIONS`, `applyRotation`, `sameCube` for the migration gate.

- [ ] **Step 1: Write geometry tests against A/B/C/D/E/F fixtures**

```ts
expect(getOppositePosition(POS.L)).toBe(POS.R);
expect(getOppositePosition(POS.F)).toBe(POS.B);
expect(getOppositePosition(POS.U)).toBe(POS.D);
expect(getClockwiseNeighbors(POS.F)).toEqual([POS.U, POS.R, POS.D, POS.L]);
expect(getClockwiseNeighbors(POS.B)).toEqual([POS.U, POS.L, POS.D, POS.R]);
```

- [ ] **Step 2: Run the new geometry test and verify that imports fail**

Run: `npm test -- --run src/exercises/cubes/domain/cubeGeometry.test.ts`

Expected: FAIL because `cubeGeometry.ts` does not exist.

- [ ] **Step 3: Add strict domain types and integer face frames**

```ts
export type FacePosition = 0 | 1 | 2 | 3 | 4 | 5;
export type QuarterTurn = 0 | 1 | 2 | 3;
export type FaceEdge = 'top' | 'right' | 'bottom' | 'left';
export interface CubeFace {
  id: string;
  sym: number;
  rot: QuarterTurn;
  originalPosition: FacePosition;
}
export type Cube = readonly [CubeFace, CubeFace, CubeFace, CubeFace, CubeFace, CubeFace];
```

- [ ] **Step 4: Derive topology from frames**

Implement normals and local `right`/`up` vectors for each position. Resolve a neighboring position by matching its normal to `up`, `right`, `-up` or `-right`. Derive the opposite by matching `-normal`.

- [ ] **Step 5: Propagate stable IDs through generation and rotation**

`randomCube()` assigns `face-${originalPosition}`. `Piece` gains `faceId`. Rotations move the whole `CubeFace` and retain `id` and `originalPosition`.

- [ ] **Step 6: Run legacy and new geometry tests**

Run: `npm test -- --run src/exercises/cubes/generator.test.ts src/exercises/cubes/fold-model.test.ts src/exercises/cubes/domain/cubeGeometry.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit the parallel geometry model**

```bash
git add src/exercises/cubes
git commit -m "feat: add identity-aware cube geometry"
```

### Task 2: Exhaustive differential gate and validator switch

**Files:**
- Create: `src/exercises/cubes/domain/cubeGeometry.differential.test.ts`
- Create: `src/exercises/cubes/domain/differentialReport.ts`
- Modify: `src/exercises/cubes/generator.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `sameCube`, `sameCubeGeometry`, generated `CubesQuestion` fixtures.
- Produces: `CubeDifferentialReport` with `identityDivergences`, `orientationDivergences`, `verdictDivergences`, `casesCompared`.
- Produces: `compareCubeValidators(question, answer): CubeDifferentialCase`.

- [ ] **Step 1: Write a failing report-classification test**

```ts
expect(report.identityDivergences).toBe(0);
expect(report.orientationDivergences).toBe(0);
expect(report.verdictDivergences).toBe(0);
expect(report.casesCompared).toBeGreaterThan(1_000_000);
```

- [ ] **Step 2: Implement answer enumeration**

Enumerate every permutation of available pieces over holes and every visually distinct rotation combination. Add separate partial-answer and duplicated-piece cases.

- [ ] **Step 3: Keep `validate()` unchanged and run the sample differential suite**

Run: `npm test -- --run src/exercises/cubes/domain/cubeGeometry.differential.test.ts`

Expected: PASS with all three counters at zero on the default sample.

- [ ] **Step 4: Add the exhaustive command**

```json
"test:cubes:exhaustive": "CUBES_EXHAUSTIVE=1 vitest run src/exercises/cubes/domain/cubeGeometry.differential.test.ts --reporter=verbose"
```

- [ ] **Step 5: Run 1,000 generated planches exhaustively**

Run: `npm run test:cubes:exhaustive`

Expected output includes:

```text
face identity divergences: 0
symbol orientation divergences: 0
global verdict divergences: 0
```

- [ ] **Step 6: Switch `validate()` only after Step 5 passes**

Keep the reconstruction guards for missing and duplicated pieces, then return `sameCubeGeometry(filled, reference)`.

- [ ] **Step 7: Re-run legacy, differential and full tests**

Run: `npm test -- --run src/exercises/cubes && npm test`

Expected: PASS.

- [ ] **Step 8: Commit the zero-divergence migration**

```bash
git add package.json src/exercises/cubes
git commit -m "test: prove Cubes geometry parity"
```

### Task 3: Attempt analysis and minimal reasoning path

**Files:**
- Create: `src/exercises/cubes/domain/cubeAnalysis.ts`
- Create: `src/exercises/cubes/domain/cubeAnalysis.test.ts`
- Create: `src/exercises/cubes/domain/reasoningPath.ts`
- Create: `src/exercises/cubes/domain/reasoningPath.test.ts`

**Interfaces:**
- Produces: `CubeErrorCause`, diagnostics and `CubeAttemptAnalysis`.
- Produces: `ReasoningPath { minimalSteps, decisiveStepIndex, alternativeValidSteps? }`.
- Produces: `analyzeCubeAttempt(question, answer)` and `buildReasoningPath(question)`.

- [ ] **Step 1: Write three readable diagnostic fixtures**

Create a fixture solved by opposite deductions, one with two candidates resolved by a ring, and one with correct identities but 90° and 180° orientation errors.

- [ ] **Step 2: Assert exact minimal paths**

```ts
expect(path.minimalSteps.map((step) => step.kind)).toEqual([
  'opposite-deduction',
  'elimination',
]);
expect(path.decisiveStepIndex).toBe(1);
```

- [ ] **Step 3: Implement per-face and relation diagnostics**

Classify wrong identity, wrong orientation, broken opposite, broken adjacency, reversed circular order and mirror. Normalize symbol rotations before emitting orientation errors.

- [ ] **Step 4: Implement the bounded shortest-path solver**

Search candidate states in pedagogical cost order: visible opposite, elimination, two-candidate ring, mirror rejection, orientation anchor. Stop when placement and orientation are unique.

- [ ] **Step 5: Verify no needless ring step**

For every generated planche whose holes all have visible opposites, assert that `minimalSteps` contains no `ring-comparison`.

- [ ] **Step 6: Run analysis tests and commit**

Run: `npm test -- --run src/exercises/cubes/domain/cubeAnalysis.test.ts src/exercises/cubes/domain/reasoningPath.test.ts`

```bash
git add src/exercises/cubes/domain
git commit -m "feat: diagnose Cubes reasoning errors"
```

### Task 4: Targeted drill generators

**Files:**
- Create: `src/exercises/cubes/domain/cubeDrills.ts`
- Create: `src/exercises/cubes/domain/cubeDrills.test.ts`
- Modify: `src/exercises/cubes/config.ts`
- Modify: `src/exercises/cubes/generator.ts`

**Interfaces:**
- Produces: `CubeDrillType` and discriminated `CubeDrillQuestion`/`CubeDrillAnswer` unions.
- Produces: `generateCubeDrill(seed, type)` and `validateCubeDrill(question, answer)`.
- Supports: opposites, adjacency, rings, mirror, rotation, full puzzle, two remaining faces, orientation only.

- [ ] **Step 1: Write uniqueness tests for every drill type**

Sweep at least 250 seeds per type and assert one accepted choice or one accepted placement set.

- [ ] **Step 2: Lock both two-candidate locations**

```ts
const locations = new Set(
  seeds.map((seed) => generateCubeDrill(seed, 'two-remaining').ambiguityLocation),
);
expect(locations).toEqual(new Set(['center', 'non-center']));
```

- [ ] **Step 3: Prove the two-candidate invariant**

Before ring comparison, assert exactly two candidates; after it, assert exactly one. Reject a generated item that an opposite or trivial elimination resolves sooner.

- [ ] **Step 4: Prove orientation-only invariants**

Assert one to three orientable symbols, correct face identities, no symmetric symbols, and coverage of clockwise 90°, counter-clockwise 90° and 180°.

- [ ] **Step 5: Implement generators and connect `forceTag`**

Map stable tags such as `cube-two-remaining` and `cube-orientation-only` without changing normal generation.

- [ ] **Step 6: Run drill tests and commit**

Run: `npm test -- --run src/exercises/cubes/domain/cubeDrills.test.ts`

```bash
git add src/exercises/cubes
git commit -m "feat: add Cubes subskill drills"
```

### Task 5: Versioned Coach history and per-skill statistics

**Files:**
- Create: `src/exercises/cubes/progress/cubeCoachStorage.ts`
- Create: `src/exercises/cubes/progress/cubeCoachStorage.test.ts`
- Create: `src/exercises/cubes/progress/cubeCoachStats.ts`
- Create: `src/exercises/cubes/progress/cubeCoachStats.test.ts`
- Modify: `src/core/types.ts`
- Modify: `src/app/SessionRunner.tsx`
- Modify: `src/exercises/cubes/index.ts`

**Interfaces:**
- Produces: `CubeCoachStorageV1`, `CubeAttemptRecord`, `CubeSkill`, `CubeSkillResult`.
- Produces: `loadCubeCoachState`, `saveCubeAttempt`, `cubeSkillStats`, `dominantCubeWeakness`.
- Adds optional `ExerciseModule.onAttemptResult(context)` invoked after generic validation.

- [ ] **Step 1: Write storage tests with a localStorage stub**

Cover empty, corrupt, wrong-version, valid state and append behavior under `psy0.cubes-coach`.

- [ ] **Step 2: Write statistics tests**

Assert the last 30 observations per skill, the five-observation threshold and that a global full-puzzle success does not create synthetic success for every subskill.

- [ ] **Step 3: Implement storage and stats**

Snapshot question, answer, solution and diagnostic. Catch storage-write failures and keep the gameplay callback successful.

- [ ] **Step 4: Add the generic result hook**

Pass item, answer, correct, response time, session ID and mode. Cubes converts this context to a `CubeAttemptRecord`; other modules remain unchanged.

- [ ] **Step 5: Run core and Cubes progress tests**

Run: `npm test -- --run src/exercises/cubes/progress src/core`

- [ ] **Step 6: Commit persistence**

```bash
git add src/app/SessionRunner.tsx src/core/types.ts src/exercises/cubes
git commit -m "feat: persist Cubes coach progress"
```

### Task 6: Coach correction and visual explanations

**Files:**
- Create: `src/exercises/cubes/coach/CubeCoachCorrection.tsx`
- Create: `src/exercises/cubes/coach/CubeCoachVisuals.tsx`
- Create: `src/exercises/cubes/coach/CubeReasoningSteps.tsx`
- Create: `src/exercises/cubes/coach/CubeDetailedGeometry.tsx`
- Create: `src/exercises/cubes/coach/CubeRotationExplanation.tsx`
- Modify: `src/exercises/cubes/index.ts`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `CubeAttemptAnalysis`, `ReasoningPath`, `NetSvg`, `FoldingNet`.
- Produces: an `ExplainProps<CubesQuestion, CubesAnswer>` component.

- [ ] **Step 1: Implement static SVG states before motion**

Render pair colors, candidate rings, reversed ring, physical anchor edge and rotated isolated face from domain data only.

- [ ] **Step 2: Build the short correction**

Show the primary cause, minimal steps and decisive step. Do not render the full topology until the user selects « Comprendre en détail ».

- [ ] **Step 3: Add direct orientation disclosure**

Every orientation error renders « Pourquoi cette face tourne ? ». It opens `CubeRotationExplanation` directly and does not toggle the detailed-geometry section.

- [ ] **Step 4: Add replayable animations**

Use 300–800 ms CSS/SVG transitions. Supply Replay and Skip buttons. Disable autoplay under reduced motion.

- [ ] **Step 5: Register the correction**

Set `Explain: CubeCoachCorrection` and `visualCorrectionOnly: true` on the Cubes module.

- [ ] **Step 6: Run typecheck before wider UI work**

Run: `npm run typecheck`

- [ ] **Step 7: Commit correction UI**

```bash
git add src/exercises/cubes src/index.css
git commit -m "feat: explain Cubes attempts visually"
```

### Task 7: Coach preference and normal fallback

**Files:**
- Modify: `src/core/prefs.ts`
- Modify: `src/core/prefs.test.ts`
- Modify: `src/pages/Settings.tsx`
- Modify: `src/exercises/cubes/CubesExercise.tsx`
- Modify: `src/exercises/cubes/coach/CubeCoachCorrection.tsx`

**Interfaces:**
- Adds: `Prefs.cubeCoachEnabled: boolean`, default `true`.
- Preserves: simulation behavior and generic pause settings.

- [ ] **Step 1: Write preference migration tests**

Assert old stored preferences receive `cubeCoachEnabled: true` and an explicit `false` survives loading.

- [ ] **Step 2: Add the Settings toggle**

Place it in « Aide pendant l’entraînement » with copy stating that simulation never shows the Coach.

- [ ] **Step 3: Build the fallback correction**

When disabled, render the frozen target with the user answer and expected placement, without detailed Coach steps.

- [ ] **Step 4: Run preference and Cubes tests, then commit**

Run: `npm test -- --run src/core/prefs.test.ts src/exercises/cubes`

```bash
git add src/core/prefs.ts src/core/prefs.test.ts src/pages/Settings.tsx src/exercises/cubes
git commit -m "feat: make Cubes coach configurable"
```

### Task 8: Cubes dashboard, drills and guided solve

**Files:**
- Create: `src/exercises/cubes/pages/CubesCoachPage.tsx`
- Create: `src/exercises/cubes/pages/CubesDrillPlayer.tsx`
- Create: `src/exercises/cubes/pages/CubesGuidedSolve.tsx`
- Modify: `src/main.tsx`
- Modify: `src/pages/Train.tsx`
- Modify: `src/pages/Learn.tsx`
- Modify: `src/pages/Tips.tsx`

**Interfaces:**
- Adds routes: `/cubes`, `/cubes/drill/:type`, `/cubes/guided`.
- Consumes: drill generators, storage statistics and existing session start for full puzzles.

- [ ] **Step 1: Build the dashboard information hierarchy**

Show the visual memo, skill rates with sample sizes, dominant weakness, drill cards and history link. Mark fewer than five observations as « échantillon faible ».

- [ ] **Step 2: Build the eight drill flows**

Offer five or ten questions, immediate correction and keyboard choices. Persist each result as `mode: 'drill'`.

- [ ] **Step 3: Build « Résoudre avec moi »**

Implement opposite-pair selection, immediate deduction, optional two-candidate selection, ring verification and symbol orientation. Persist guided skill results without adding `full-puzzle` success.

- [ ] **Step 4: Link the Coach from existing Cubes surfaces**

Add contextual links to Train, Learn and Tips without adding a global navigation item.

- [ ] **Step 5: Run typecheck and route smoke build**

Run: `npm run typecheck && npm run build`

- [ ] **Step 6: Commit the Coach hub**

```bash
git add src/main.tsx src/pages src/exercises/cubes/pages
git commit -m "feat: add Cubes coach drills and dashboard"
```

### Task 9: Replayable history, permanent lesson and development debug

**Files:**
- Create: `src/exercises/cubes/pages/CubesHistoryPage.tsx`
- Create: `src/exercises/cubes/coach/CubeDebugPanel.tsx`
- Modify: `src/exercises/cubes/pages/CubesCoachPage.tsx`
- Modify: `src/exercises/cubes/lesson.tsx`
- Modify: `src/exercises/cubes/FoldingNet.tsx`
- Modify: `src/main.tsx`

**Interfaces:**
- Adds route: `/cubes/history`.
- Consumes: stored snapshots, Coach correction and frame-derived debug data.

- [ ] **Step 1: Build history replay from snapshots**

List recent records with date, time, verdict and causes. « Revoir la correction » reconstructs the analysis from the stored snapshot, never from generic event strings.

- [ ] **Step 2: Add « Pourquoi la lettre tourne ? »**

Expose the permanent physical-edge lesson from the Cubes dashboard and reuse `CubeRotationExplanation`.

- [ ] **Step 3: Add the current-net learning section**

Show the standard topology, its opposite pairs and frame-derived rings. Do not claim coverage of other cube nets.

- [ ] **Step 4: Add development-only debug**

Guard the button and panel with `import.meta.env.DEV`. Display IDs, positions, frames, rings, shared edges, transformation and solver candidates.

- [ ] **Step 5: Commit history and debug**

```bash
git add src/main.tsx src/exercises/cubes
git commit -m "feat: add Cubes correction history"
```

### Task 10: Final regression, accessibility and delivery report

**Files:**
- Verify: `src/exercises/cubes/**`
- Verify: `src/core/prefs.ts`
- Verify: `src/app/SessionRunner.tsx`
- Verify: `src/main.tsx`
- Verify: `package.json`

**Interfaces:**
- Produces the final differential report, test count, file list and three real diagnostics.

- [ ] **Step 1: Run the exhaustive differential gate again**

Run: `npm run test:cubes:exhaustive`

Expected: all three divergence counters equal zero.

- [ ] **Step 2: Run all automated checks**

Run: `npm run typecheck && npm test && npm run build`

Expected: PASS.

- [ ] **Step 3: Inspect the production bundle for the debug label**

Run: `rg -n "Debug cube" dist/assets || true`

Expected: no production user-facing debug control.

- [ ] **Step 4: Manually verify UI states**

Check desktop, narrow mobile, keyboard, pointer drag, reduced motion, Coach enabled, Coach disabled, timeout and simulation.

- [ ] **Step 5: Produce three concrete diagnostic examples**

Use deterministic seeds representing opposite-only, two-candidate ring and correct-face/wrong-orientation cases. Report minimal steps, decisive step and emitted error causes.

- [ ] **Step 6: Commit final fixes**

```bash
git add -A
git commit -m "feat: complete Cubes visual coach"
```
