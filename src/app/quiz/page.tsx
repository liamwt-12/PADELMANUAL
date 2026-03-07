import RacketQuiz from './RacketQuiz';

export const metadata = {
  title: 'What Padel Racket Should I Buy? — Quiz',
  description: 'Answer 5 quick questions and we\'ll recommend the perfect padel racket for your level, style, and budget.',
};

export default function QuizPage() {
  return (
    <main className="py-12 pb-20">
      <div className="text-center mb-12">
        <div className="label-caps">Interactive quiz</div>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight md:text-5xl">
          What racket should<br />you buy?
        </h1>
        <p className="mt-4 max-w-md mx-auto text-base text-pm-muted leading-relaxed">
          Five questions. Thirty seconds. We'll match you with the rackets 
          that actually suit your game — not the most expensive ones.
        </p>
      </div>
      <RacketQuiz />
    </main>
  );
}
