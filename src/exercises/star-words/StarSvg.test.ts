import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { StarSvg } from './StarSvg';

describe('StarSvg', () => {
  it('indique le sens de lecture au début de chacune des six lignes', () => {
    const markup = renderToStaticMarkup(
      createElement(StarSvg, { placement: [null, null, null, null, null, null] }),
    );
    expect(markup.match(/data-direction-arrow="true"/g)).toHaveLength(6);
  });

  it('regroupe les départs en haut, en bas et à gauche comme Pilotest', () => {
    const markup = renderToStaticMarkup(
      createElement(StarSvg, { placement: [null, null, null, null, null, null] }),
    );
    expect(markup).not.toContain('<polygon');
  });

  it('garde les six flèches et ajoute une poubelle quand une ligne est remplie', () => {
    const markup = renderToStaticMarkup(
      createElement(StarSvg, {
        placement: ['CYCLONE', null, null, null, null, null],
        onSlotClick: () => {},
      }),
    );
    expect(markup.match(/data-direction-arrow="true"/g)).toHaveLength(6);
    expect(markup).not.toContain('data-placement-arrow');
    expect(markup.match(/data-slot-trash="true"/g)).toHaveLength(1);
  });

  it('rend toute la longueur des six lignes explicitement cliquable', () => {
    const markup = renderToStaticMarkup(
      createElement(StarSvg, {
        placement: [null, null, null, null, null, null],
        onSlotClick: () => {},
      }),
    );
    expect(markup.match(/data-slot-hit="true"/g)).toHaveLength(6);
    expect(markup.match(/pointer-events="stroke"/g)).toHaveLength(6);
    expect(markup.match(/data-slot-hit="true"[^>]+stroke-linecap="round"/g)).toHaveLength(6);
  });
});
