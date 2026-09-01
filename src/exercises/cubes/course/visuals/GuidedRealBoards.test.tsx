import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { GuidedRealBoards } from './GuidedRealBoards';

describe('GuidedRealBoards', () => {
  it('renders three generated learning scenarios without a timer', () => {
    const html = renderToStaticMarkup(<GuidedRealBoards />);
    expect(html).toContain('A · Opposées');
    expect(html).toContain('B · Deux candidats');
    expect(html).toContain('C · Orientations');
    expect(html).toContain('Résoudre avec moi');
    expect(html).not.toContain('60 s');
  });
});

