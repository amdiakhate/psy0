# Cubes Course Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Cubes module as a ten-chapter visual course, then reconnect real practice, contextual correction, drills, history, and timing without replacing the verified geometry engine.

**Architecture:** `domain/` remains the only source of cube truth. A new `course/` package derives a neutral A–F teaching model, deterministic validations, visual scenes, and versioned progress from that engine. Real attempts continue through the existing exercise module and Coach storage, with hints and response duration passed into a shorter contextual correction.

**Tech Stack:** React 19, React Router 7, TypeScript 6 strict, Tailwind CSS 4, SVG/CSS animation, existing React Three Fiber stack only where direct cube manipulation materially helps.

**Spec:** `docs/superpowers/specs/2026-09-01-cubes-course-rebuild-design.md`

## Global Constraints

- Keep `cubeGeometry.ts`, `cube-model.ts`, and the zero-divergence differential suite as the geometry source of truth.
- Do not merge guided-course attempts with real Cubes performance.
- Chapters 1–7 render neutral A–F faces; real glyphs begin in chapter 8.
- Every relationship shown in prose must also be visible in the adjacent diagram or animation.
- Chapters 5, 6, and 8 receive full replayable visual scenes before chapter 10 work begins.
- All motion respects `prefers-reduced-motion` and remains skippable.
- No new runtime network access or heavy dependency.
- Desktop is primary; course navigation and controls remain usable on mobile and keyboard.

---

### Task 1: Establish a green Cubes baseline and preserve existing fixes

**Files:**
- Modify: `src/exercises/cubes/domain/cubeDrills.ts`
- Modify: `src/exercises/cubes/progress/cubeCoachStorage.ts`
- Modify: `src/exercises/cubes/progress/cubeHistoryGuard.ts`
- Modify: `src/hooks/useDragDrop.ts`
- Test: `src/exercises/cubes/domain/cubeDrills.test.ts`
- Test: `src/exercises/cubes/progress/cubeCoachStorage.test.ts`
- Test: `src/exercises/cubes/progress/cubeHistoryGuard.test.ts`
- Test: `src/hooks/useDragDrop.test.ts`

**Interfaces:**
- Consumes: current generated drills, `CubeAttemptRecord`, and `useDragDrop<T>()`.
- Produces: a passing baseline where drill answers use stable face IDs, malformed attempts are rejected, and drag completion cannot trigger a click rotation.

- [ ] **Step 1: Run focused regression tests**

Run:
```bash
npx vitest run src/exercises/cubes/domain/cubeDrills.test.ts src/exercises/cubes/progress/cubeCoachStorage.test.ts src/exercises/cubes/progress/cubeHistoryGuard.test.ts src/hooks/useDragDrop.test.ts
```
Expected: all tests pass, including mirror face identity, absent orientation, malformed history, and slow drag cases.

- [ ] **Step 2: Run strict typecheck and correct only failures caused by these pending changes**

Run:
```bash
npm run typecheck
```
Expected: exit code 0.

- [ ] **Step 3: Commit the preserved fixes**

```bash
git add src/exercises/cubes src/exercises/sliding-shapes/SlidingShapesExercise.tsx src/hooks/useDragDrop.ts src/hooks/useDragDrop.test.ts
git commit -m "fix: harden cubes drills and drag interactions"
```

### Task 2: Create the neutral A–F course domain

**Files:**
- Create: `src/exercises/cubes/course/courseModel.ts`
- Create: `src/exercises/cubes/course/courseFixtures.ts`
- Create: `src/exercises/cubes/course/courseDrills.ts`
- Create: `src/exercises/cubes/course/courseModel.test.ts`
- Create: `src/exercises/cubes/course/courseFixtures.test.ts`
- Create: `src/exercises/cubes/course/courseDrills.test.ts`

**Interfaces:**
- Consumes: `FacePosition`, `FaceEdge`, `getOppositePosition`, `getClockwiseNeighbors`, `getSharedEdge`, `ALL_ROTATIONS`, and `applyGeometryRotation`.
- Produces:
```ts
export type CourseFaceId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
export type CubeCourseSkill = 'identity' | 'opposites' | 'adjacency' | 'belt' | 'recenter' | 'ring' | 'mirror' | 'orientation' | 'full' | 'timing';
export interface CubeCourseChapter { id: string; order: number; title: string; skills: CubeCourseSkill[]; threshold: number; exerciseCount: number; }
export interface CourseExercise { id: string; chapterId: string; skill: CubeCourseSkill; prompt: string; choices: CourseChoice[]; answerId: string; explanation: string; }
export const COURSE_FACE_TO_POSITION: Readonly<Record<CourseFaceId, FacePosition>>;
export const COURSE_CHAPTERS: readonly CubeCourseChapter[];
export function getCourseOpposite(faceId: CourseFaceId): CourseFaceId;
export function getCourseRing(faceId: CourseFaceId): readonly CourseFaceId[];
export function buildCourseExercises(chapterId: string): readonly CourseExercise[];
```

- [ ] **Step 1: Write failing mapping and chapter tests**

Assert exact mapping `A→L`, `B→F`, `C→R`, `D→B`, `E→U`, `F→D`, opposites `A↔C`, `B↔D`, `E↔F`, ten sequential chapters, and exercise counts `[3,5,4,3,3,4,4,5,5,3]` totaling 39.

- [ ] **Step 2: Run the new tests to verify failure**

```bash
npx vitest run src/exercises/cubes/course/courseModel.test.ts src/exercises/cubes/course/courseFixtures.test.ts src/exercises/cubes/course/courseDrills.test.ts
```
Expected: FAIL because the course files do not exist.

- [ ] **Step 3: Implement the typed model and engine-derived fixtures**

Declare course colors and face mappings once. Reverse-map geometry positions to letters, and derive every opposite, neighbor, shared edge, and ring through domain functions rather than handwritten relationship tables.

- [ ] **Step 4: Implement all 39 deterministic validation items**

Each exercise carries one visible rule and one precise explanation. Chapter 9 items include three intermediate decisions and two generated full puzzles; chapter 10 includes timing-order, next-action, and guided simulation items.

- [ ] **Step 5: Run tests and differential geometry suite**

```bash
npx vitest run src/exercises/cubes/course src/exercises/cubes/domain/cubeGeometry.test.ts src/exercises/cubes/domain/cubeGeometry.differential.test.ts
npm run test:cubes:exhaustive
```
Expected: all course tests pass and differential report shows zero identity, orientation, and global-verdict divergence.

- [ ] **Step 6: Commit the course domain**

```bash
git add src/exercises/cubes/course
git commit -m "feat: add cubes visual course domain"
```

### Task 3: Add versioned course progress independent of real attempts

**Files:**
- Create: `src/exercises/cubes/course/courseProgress.ts`
- Create: `src/exercises/cubes/course/courseProgress.test.ts`

**Interfaces:**
- Consumes: `COURSE_CHAPTERS`, course exercise IDs and skills.
- Produces:
```ts
export interface CubeCourseAttempt { exerciseId: string; chapterId: string; skill: CubeCourseSkill; correct: boolean; answeredAt: string; }
export interface CubeCourseProgress { schemaVersion: 1; currentChapterId: string; completedScreens: string[]; attempts: CubeCourseAttempt[]; }
export function loadCubeCourseProgress(): CubeCourseProgress;
export function recordCubeCourseAttempt(attempt: CubeCourseAttempt): CubeCourseProgress;
export function markCubeCourseScreenComplete(chapterId: string, screenId: string): CubeCourseProgress;
export function getChapterStatus(progress: CubeCourseProgress, chapterId: string): 'locked' | 'available' | 'complete';
export function getCourseEvaluation(progress: CubeCourseProgress): CourseEvaluation;
```

- [ ] **Step 1: Write failing storage, migration, and unlock tests**

Cover a fresh browser, corrupt JSON, unknown fields, strict chapter ordering, recent-series thresholds, and complete-course thresholds by skill.

- [ ] **Step 2: Run the tests to verify failure**

```bash
npx vitest run src/exercises/cubes/course/courseProgress.test.ts
```
Expected: FAIL because progress functions are absent.

- [ ] **Step 3: Implement storage under the project storage wrapper**

Use the logical key `cubes-course-v1`, which resolves to the project’s `psy0.` namespace. Parse `unknown`, narrow every field, cap attempts, and fall back to a neutral chapter-1 state.

- [ ] **Step 4: Run course progress and existing Coach-storage tests**

```bash
npx vitest run src/exercises/cubes/course/courseProgress.test.ts src/exercises/cubes/progress/cubeCoachStorage.test.ts
```
Expected: course progress is isolated from `cubes-coach` attempts.

- [ ] **Step 5: Commit**

```bash
git add src/exercises/cubes/course/courseProgress.ts src/exercises/cubes/course/courseProgress.test.ts
git commit -m "feat: persist cubes course progression"
```

### Task 4: Build shared visual primitives and chapters 1–4

**Files:**
- Create: `src/exercises/cubes/course/visuals/CourseFace.tsx`
- Create: `src/exercises/cubes/course/visuals/CourseNet.tsx`
- Create: `src/exercises/cubes/course/visuals/FoldWorkshop.tsx`
- Create: `src/exercises/cubes/course/visuals/SharedEdgeScene.tsx`
- Create: `src/exercises/cubes/course/visuals/BeltScene.tsx`
- Create: `src/exercises/cubes/course/visuals/MotionControls.tsx`
- Create: `src/exercises/cubes/course/CourseExerciseCard.tsx`
- Create: `src/exercises/cubes/course/chapters/ChaptersOneToFour.tsx`
- Create: `src/exercises/cubes/course/chapters/chaptersOneToFour.test.tsx`

**Interfaces:**
- Consumes: neutral fixtures, `foldedFaces(t)`, chapter exercises, and progress recording.
- Produces reusable scene props:
```ts
export interface CourseSceneProps { reducedMotion?: boolean; onComplete?: () => void; }
export function CourseNet(props: { center?: CourseFaceId; highlights?: CourseHighlight[]; holes?: CourseFaceId[] }): React.ReactElement;
export function FoldWorkshop(props: CourseSceneProps & { focusPair?: readonly [CourseFaceId, CourseFaceId] }): React.ReactElement;
```

- [ ] **Step 1: Write failing semantic-render tests**

Assert that chapter scenes expose labels A–F, replay/pause controls, all three opposite pairs, shared-edge explanation, and hidden D–A belt closure in accessible text.

- [ ] **Step 2: Run tests to verify failure**

```bash
npx vitest run src/exercises/cubes/course/chapters/chaptersOneToFour.test.tsx
```
Expected: FAIL because scene components are absent.

- [ ] **Step 3: Implement the visual workshop**

Render a restrained dark technical board with fixed face colors, visible hinge lines, numbered fold order, a scrubber, pause/replay, and a manipulable closed cube. Use the existing fold model; do not hand-author final 3D positions.

- [ ] **Step 4: Implement chapters 1–4 and their mini-exercises**

Every text statement is paired with a highlighted face, edge, or motion. Validation feedback keeps the diagram visible and points at the exact relation involved.

- [ ] **Step 5: Run tests and typecheck**

```bash
npx vitest run src/exercises/cubes/course/chapters/chaptersOneToFour.test.tsx src/exercises/cubes/fold-model.test.ts
npm run typecheck
```
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/exercises/cubes/course
git commit -m "feat: teach cube folding opposites and adjacency"
```

### Task 5: Build the priority visual scenes for chapters 5, 6, and 8

**Files:**
- Create: `src/exercises/cubes/course/visuals/RecenterWorkshop.tsx`
- Create: `src/exercises/cubes/course/visuals/RingWorkshop.tsx`
- Create: `src/exercises/cubes/course/visuals/PhysicalEdgeRotation.tsx`
- Create: `src/exercises/cubes/course/chapters/ChapterFive.tsx`
- Create: `src/exercises/cubes/course/chapters/ChapterSix.tsx`
- Create: `src/exercises/cubes/course/chapters/ChapterEight.tsx`
- Create: `src/exercises/cubes/course/visuals/priorityScenes.test.tsx`

**Interfaces:**
- Consumes: `getCourseRing`, all 24 geometry rotations, `getSharedEdge`, `rotateEdge`, real `Glyph` rendering only in chapter 8.
- Produces:
```ts
export function RecenterWorkshop(props: { center: CourseFaceId; onCenterChange(face: CourseFaceId): void }): React.ReactElement;
export function RingWorkshop(props: { center: CourseFaceId; offset?: 0 | 1 | 2 | 3; reversed?: boolean }): React.ReactElement;
export function PhysicalEdgeRotation(props: { face: CourseFaceId; anchor: CourseFaceId; fromEdge: FaceEdge; toEdge: FaceEdge; symbol: number; }): React.ReactElement;
```

- [ ] **Step 1: Write failing geometry-to-visual tests**

For all six centers, assert that the visual labels exactly the engine-derived ring. For every physical-edge animation, assert the same anchor remains attached and the final edge equals `rotateEdge(fromEdge, turn)`. Assert replay and reduced-motion states.

- [ ] **Step 2: Run the tests to verify failure**

```bash
npx vitest run src/exercises/cubes/course/visuals/priorityScenes.test.tsx
```
Expected: FAIL because the workshops are absent.

- [ ] **Step 3: Implement chapter 5 — change the central face**

Show a closed cube between the source and destination nets. Selecting A–F moves that physical color to the center, animates adjacent faces into their new screen positions, and preserves identity throughout. Provide manual step, autoplay, replay, and reduced-motion final state.

- [ ] **Step 4: Implement chapter 6 — neighbor ring**

Render top/right/bottom/left as four numbered stations connected by a directional track. Allow cyclic offsets with a rotation control; render reversed order alongside only when requested. Display the engine-derived sequence below the scene as a secondary check.

- [ ] **Step 5: Implement chapter 8 — physical edge and symbol rotation**

Isolate one face, color one physical edge red, attach a labeled neighbor anchor, then animate the entire square and glyph together through 0/90/180/270 until that same red edge reaches the target side. Provide direct replay and step buttons.

- [ ] **Step 6: Implement chapter content and all 13 validations for chapters 5, 6, and 8**

Feedback opens on the scene state that proves the answer. Chapter 8 distinguishes invariant shapes from directional symbols and never treats the glyph as face identity.

- [ ] **Step 7: Run focused tests and typecheck**

```bash
npx vitest run src/exercises/cubes/course/visuals/priorityScenes.test.tsx src/exercises/cubes/course/courseFixtures.test.ts src/exercises/cubes/domain/cubeGeometry.test.ts
npm run typecheck
```
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/exercises/cubes/course
git commit -m "feat: add cube recenter ring and edge workshops"
```

### Task 6: Build chapter 7 mirror exploration and chapter 9 real untimed boards

**Files:**
- Create: `src/exercises/cubes/course/visuals/RotationOrbitExplorer.tsx`
- Create: `src/exercises/cubes/course/visuals/MirrorComparison.tsx`
- Create: `src/exercises/cubes/course/visuals/ProgressiveSolution.tsx`
- Create: `src/exercises/cubes/course/chapters/ChapterSeven.tsx`
- Create: `src/exercises/cubes/course/chapters/ChapterNine.tsx`
- Create: `src/exercises/cubes/course/chapters/chapterSevenNine.test.tsx`
- Modify: `src/exercises/cubes/CubesExercise.tsx`

**Interfaces:**
- Consumes: `ALL_ROTATIONS`, `generate`, `solutionAnswer`, `analyzeCubeAttempt`, and the normal Cubes board.
- Produces an untimed course wrapper:
```ts
export interface CubesExerciseAssistProps { hintsEnabled?: boolean; onHintUsed?: (level: 1 | 2 | 3 | 4) => void; }
export function UntimedCoursePuzzle(props: { seed: number; level: number; onResult(correct: boolean): void }): React.ReactElement;
```

- [ ] **Step 1: Write failing orbit and chapter-board tests**

Assert 24 unique proper rotations, no mirrored ring in that orbit, three progressive examples, and two full chapter-9 boards with no active timer.

- [ ] **Step 2: Run tests to verify failure**

```bash
npx vitest run src/exercises/cubes/course/chapters/chapterSevenNine.test.tsx
```
Expected: FAIL.

- [ ] **Step 3: Implement the 24-rotation explorer and mirror comparison**

The user can step through every proper rotation while the clockwise ring remains cyclic. The mirrored comparison reverses arrow order and receives a red “miroir” verdict only after the visual proof.

- [ ] **Step 4: Implement the three progressive chapter-9 examples**

Example 1 stops after two opposite deductions. Example 2 reveals the exact transition to two candidates and uses one ring comparison. Example 3 adds only the necessary physical-edge rotations. Default text describes the minimal path; “Comprendre en détail” expands full geometry.

- [ ] **Step 5: Reuse the real board for two untimed puzzles**

Add optional assist props without changing default gameplay. Course answers update course progress only; they never call `recordCubeFullAttempt`.

- [ ] **Step 6: Run focused tests and exhaustive differential**

```bash
npx vitest run src/exercises/cubes/course/chapters/chapterSevenNine.test.tsx src/exercises/cubes/domain src/exercises/cubes/generator.test.ts
npm run test:cubes:exhaustive
```
Expected: zero divergence and passing real-board validation.

- [ ] **Step 7: Commit**

```bash
git add src/exercises/cubes/course src/exercises/cubes/CubesExercise.tsx
git commit -m "feat: teach cube mirrors on untimed real boards"
```

### Task 7: Assemble course shell, hub, routing, drills, history, and progress

**Files:**
- Create: `src/exercises/cubes/course/CubesCoursePage.tsx`
- Create: `src/exercises/cubes/course/ChapterRenderer.tsx`
- Create: `src/exercises/cubes/pages/CubesHubPage.tsx`
- Create: `src/exercises/cubes/pages/CubesTrainPage.tsx`
- Create: `src/exercises/cubes/pages/CubesDrillsPage.tsx`
- Create: `src/exercises/cubes/pages/CubesProgressPage.tsx`
- Create: `src/exercises/cubes/pages/CubesRoutes.test.tsx`
- Modify: `src/exercises/cubes/pages/CubesHistoryPage.tsx`
- Modify: `src/exercises/cubes/pages/CubesDrillPlayer.tsx`
- Modify: `src/main.tsx`
- Modify: `src/pages/Learn.tsx`
- Modify: `src/pages/Tips.tsx`
- Modify: `src/pages/Train.tsx`

**Interfaces:**
- Consumes: course progress, Coach stats, existing drill generation/player and `useSession().start`.
- Produces the final route surface in the spec plus compatibility redirects.

- [ ] **Step 1: Write failing route and navigation tests**

Assert hub actions `Apprendre`, `S’entraîner`, `Drills`, `Mes erreurs`, `Progression`; chapter lock redirects; error-history filtering; and compatibility redirects from `/learn/cubes`, `/cubes/drill/:type`, and `/cubes/guided`.

- [ ] **Step 2: Run tests to verify failure**

```bash
npx vitest run src/exercises/cubes/pages/CubesRoutes.test.tsx
```
Expected: FAIL because final routes and pages are absent.

- [ ] **Step 3: Implement the hub and course shell**

The hub leads with “reprendre le cours” for incomplete users, separates guided progress from real accuracy, and presents no fake score on a fresh browser. The course shell has a compact chapter rail, progress marker, previous/next controls, and a resume state.

- [ ] **Step 4: Implement train, drill catalogue, progress, and error history pages**

Train offers 5 or 10 boards. Progress has two explicit panels: `Cours guidé` and `Entraînement réel`. Drills retain all current subskills. History filters errors from the same stored attempt list.

- [ ] **Step 5: Replace routes and preserve compatibility**

Use React Router `Navigate` for old entry points. Update generic Learn/Tips/Train links so Cubes always enters the new hub or course.

- [ ] **Step 6: Run route tests, typecheck, and build**

```bash
npx vitest run src/exercises/cubes/pages/CubesRoutes.test.tsx src/exercises/cubes/pages/CubesHistoryPage.test.ts
npm run typecheck
npm run build
```
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/main.tsx src/pages src/exercises/cubes/course src/exercises/cubes/pages
git commit -m "feat: ship cubes learning hub and routes"
```

### Task 8: Add four-level hints and contextual real-attempt corrections

**Files:**
- Create: `src/exercises/cubes/coach/cubeHintRuntime.ts`
- Create: `src/exercises/cubes/coach/cubeHints.ts`
- Create: `src/exercises/cubes/coach/cubeHints.test.ts`
- Modify: `src/core/types.ts`
- Modify: `src/app/SessionRunner.tsx`
- Modify: `src/exercises/cubes/CubesExercise.tsx`
- Modify: `src/exercises/cubes/coach/CubeCoachCorrection.tsx`
- Modify: `src/exercises/cubes/coach/CubeRotationExplanation.tsx`
- Modify: `src/exercises/cubes/progress/cubeCoachStorage.ts`
- Modify: `src/exercises/cubes/progress/cubeHistoryGuard.ts`
- Modify: `src/exercises/cubes/pages/CubesHistoryPage.tsx`

**Interfaces:**
- Extends optional contracts without affecting other exercises:
```ts
export interface ExplainProps<Q, A> { item: Item<Q>; answer: A; correct?: boolean; rtMs?: number; }
export interface CubeAttemptRecord { hintsUsed?: number; }
export function getCubeHint(question: CubesQuestion, level: 1 | 2 | 3 | 4): CubeHint;
export function consumeCubeHints(seed: number, sessionId: string): number;
```

- [ ] **Step 1: Write failing hint-safety and correction-priority tests**

Assert levels 1–3 do not expose a piece ID or final face, level 4 highlights only one correct placement, hint counts persist, correct attempts use the short correction, and orientation errors expose “Pourquoi cette face tourne ?” directly.

- [ ] **Step 2: Run tests to verify failure**

```bash
npx vitest run src/exercises/cubes/coach/cubeHints.test.ts src/exercises/cubes/progress/cubeCoachStorage.test.ts
```
Expected: FAIL.

- [ ] **Step 3: Pass response metadata into explanations**

Add optional `correct` and `rtMs` to `ExplainProps`; update `SessionRunner` to pass its existing verdict and duration. Existing explanation components need no change because fields are optional.

- [ ] **Step 4: Implement progressive hints and persistence**

Render a single “Besoin d’un indice” control on real training only. Store counts by session and seed, consume them in `onAttemptResult`, and clear stale entries after the attempt.

- [ ] **Step 5: Simplify and correct contextual Coach rendering**

Correct: show time plus minimal path. Incorrect: show one primary identity/adjacency/ring/orientation cause and one proving visual. For orientation, render explicit reference rotation, attempted rotation, expected rotation, physical edge, and anchor; do not reuse `givenRot` as the reference state.

- [ ] **Step 6: Run Coach, session, typecheck, and build tests**

```bash
npx vitest run src/exercises/cubes/coach src/exercises/cubes/progress src/app/SessionRunner.test.tsx
npm run typecheck
npm run build
```
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/core/types.ts src/app/SessionRunner.tsx src/exercises/cubes
git commit -m "feat: add contextual hints and cube corrections"
```

### Task 9: Implement chapter 10 timing only after chapters 1–9 are complete

**Files:**
- Create: `src/exercises/cubes/course/visuals/TimingRoutine.tsx`
- Create: `src/exercises/cubes/course/chapters/ChapterTen.tsx`
- Create: `src/exercises/cubes/course/chapters/chapterTen.test.tsx`
- Modify: `src/exercises/cubes/course/ChapterRenderer.tsx`

**Interfaces:**
- Consumes: completed chapter-9 status and the real board in guided simulation mode.
- Produces a five-stage 60-second routine and three chapter-10 validations.

- [ ] **Step 1: Write failing timing-placement tests**

Assert no “60 s”, countdown, or timing target appears in chapters 1–9; chapter 10 alone exposes the five windows and simulation timer.

- [ ] **Step 2: Run tests to verify failure**

```bash
npx vitest run src/exercises/cubes/course/chapters/chapterTen.test.tsx
```
Expected: FAIL.

- [ ] **Step 3: Implement the timing routine and guided simulation**

Render one horizontal instrument-style timeline with the active phase highlighted. The timer can pause and restart; the final result names the phase where time was lost without altering real performance stats.

- [ ] **Step 4: Run course tests and typecheck**

```bash
npx vitest run src/exercises/cubes/course
npm run typecheck
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/exercises/cubes/course
git commit -m "feat: add final cubes timing chapter"
```

### Task 10: Remove superseded teaching UI and perform complete verification

**Files:**
- Delete: `src/exercises/cubes/lesson.tsx`
- Delete: `src/exercises/cubes/CubeLessonVisuals.tsx`
- Delete: `src/exercises/cubes/lesson.visuals.test.ts`
- Delete: `src/exercises/cubes/pages/CubesCoachPage.tsx`
- Delete: `src/exercises/cubes/pages/CubesGuidedSolve.tsx`
- Modify: `src/exercises/cubes/index.ts`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: completed routes/course/Coach.
- Produces no duplicate teaching route or stale old lesson; generic exercise metadata points users to `/cubes/learn`.

- [ ] **Step 1: Remove old lesson exports and obsolete pages**

Delete files only after `rg` confirms no remaining import. Keep geometry, generator, validator, drill engine, Coach visuals that are still used, and history storage.

- [ ] **Step 2: Consolidate Cubes motion styles**

Keep named course animations in `src/index.css`, all guarded by `@media (prefers-reduced-motion: reduce)`. Remove only class names whose old components were deleted and have no remaining reference.

- [ ] **Step 3: Run duplicate/stale-reference checks**

```bash
rg -n "CubeLessonVisuals|CubesCoachPage|CubesGuidedSolve|lesson from './lesson'" src
```
Expected: no matches.

- [ ] **Step 4: Run all automated verification**

```bash
npm run test:cubes:exhaustive
npm run typecheck
npm run test
npm run build
```
Expected: zero differential divergence and all commands exit 0.

- [ ] **Step 5: Commit**

```bash
git add -A src/exercises/cubes src/index.css
git commit -m "refactor: retire the previous cubes lesson"
```

### Task 11: Browser verification and priority captures

**Files:**
- Create: `artifacts/cubes-course/chapter-05-recenter.png`
- Create: `artifacts/cubes-course/chapter-06-ring.png`
- Create: `artifacts/cubes-course/chapter-08-physical-edge.png`
- Create: `artifacts/cubes-course/chapter-09-real-board.png`

**Interfaces:**
- Consumes: production build served locally.
- Produces the visual approval evidence required before the course is considered usable.

- [ ] **Step 1: Start the production preview**

```bash
npm run preview -- --host 127.0.0.1
```
Expected: Vite reports a local URL and serves the built SPA.

- [ ] **Step 2: Verify a fresh-profile course journey**

Open the hub with course-storage cleared, complete enough validations to unlock chapters, then verify direct locked-route protection, resume behavior, keyboard controls, replay, pause, and reduced-motion final states.

- [ ] **Step 3: Capture the three priority scenes**

Capture chapter 5 with a non-B face centered, chapter 6 with a non-zero cyclic ring offset, and chapter 8 midway through a 90° physical-edge rotation. The diagram alone must identify every A–F relation used by nearby text.

- [ ] **Step 4: Capture chapter 9 and mobile checks**

Capture one real untimed board with the minimal reasoning drawer open. Check chapters 1, 5, 8, and 9 at a mobile viewport without horizontal clipping of primary controls.

- [ ] **Step 5: Inspect console and final status**

Expected: no runtime exception, React warning, missing route, or non-finite SVG coordinate. Re-run `git status --short` and report all created/modified files, test counts, command results, and capture links.

