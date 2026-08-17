import { useState } from 'react';
import { useKeys } from '../hooks/useKeys';

/** Saisie numérique 100 % clavier : chiffres, signe moins, retour arrière, Entrée pour valider. */
export function NumberInput({
  onSubmit,
  allowNegative = false,
  placeholder = '?',
}: {
  onSubmit: (value: string) => void;
  allowNegative?: boolean;
  placeholder?: string;
}) {
  const [value, setValue] = useState('');

  useKeys((e) => {
    if (/^[0-9]$/.test(e.key)) setValue((v) => (v.length < 9 ? v + e.key : v));
    else if (e.key === '-' && allowNegative) setValue((v) => (v === '' ? '-' : v));
    else if (e.key === 'Backspace') setValue((v) => v.slice(0, -1));
    else if (e.key === 'Enter' && value !== '' && value !== '-') {
      onSubmit(value);
      setValue('');
    }
  });

  return (
    <div className="flex items-center gap-3">
      <div className="min-w-32 rounded-lg border-2 border-sky-700 bg-zinc-900 px-4 py-2 text-center font-mono text-3xl">
        {value === '' ? <span className="text-zinc-600">{placeholder}</span> : value}
      </div>
      <span className="text-sm text-zinc-500">Entrée ⏎</span>
    </div>
  );
}
