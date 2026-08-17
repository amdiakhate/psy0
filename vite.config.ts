/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    // Les tests d'invariants balayent 150 seeds × 5 niveaux avec des recherches
    // exhaustives (BFS, rotations, XOR) : 5 s ne suffisent pas sur machine chargée.
    testTimeout: 60_000,
  },
})
