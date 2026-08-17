import type { ExerciseComponentProps } from '../../core/types';
import type { EnglishAnswer, EnglishQuestion } from './generator';
import { Choices } from '../../components/Choices';

export function EnglishExercise({ item, onAnswer }: ExerciseComponentProps<EnglishQuestion, EnglishAnswer>) {
  const q = item.question;
  const columns = q.options.every((o) => o.length <= 16) ? 2 : 1;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-10">
      <p
        className={`max-w-2xl whitespace-pre-line text-center font-semibold text-zinc-100 ${
          q.bank === 'comprehension' ? 'text-2xl leading-relaxed' : 'text-3xl'
        }`}
      >
        {q.prompt}
      </p>
      <div className="w-full max-w-xl">
        <Choices options={q.options} onPick={(i) => onAnswer(i)} columns={columns} />
      </div>
    </div>
  );
}
