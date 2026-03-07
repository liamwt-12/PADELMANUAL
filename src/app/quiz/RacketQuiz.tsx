'use client';

import { useState } from 'react';

const AWIN_ID = "2799632";
const AWIN_MID = "24562";
function pm(path: string) {
  return `https://www.awin1.com/cread.php?awinmid=${AWIN_MID}&awinaffid=${AWIN_ID}&ued=${encodeURIComponent(`https://padelmarket.com/en-gb/${path}`)}`;
}

type Answer = string | null;

interface Question {
  id: string;
  question: string;
  subtitle: string;
  options: { value: string; label: string; icon: string }[];
}

const questions: Question[] = [
  {
    id: 'level',
    question: 'What\'s your level?',
    subtitle: 'Be honest — we\'ll find you the right racket, not the most expensive one.',
    options: [
      { value: 'beginner', label: 'Just starting', icon: '🌱' },
      { value: 'intermediate', label: 'Play weekly', icon: '🎾' },
      { value: 'advanced', label: 'Competitive', icon: '🏆' },
    ],
  },
  {
    id: 'style',
    question: 'How do you play?',
    subtitle: 'Think about your natural instinct on court.',
    options: [
      { value: 'control', label: 'Patient & precise', icon: '🎯' },
      { value: 'power', label: 'Attack & smash', icon: '💥' },
      { value: 'allround', label: 'Bit of both', icon: '⚖️' },
    ],
  },
  {
    id: 'budget',
    question: 'What\'s your budget?',
    subtitle: 'There are great rackets at every price point.',
    options: [
      { value: 'low', label: 'Under £100', icon: '💰' },
      { value: 'mid', label: '£100–£200', icon: '💳' },
      { value: 'high', label: '£200+', icon: '👑' },
    ],
  },
  {
    id: 'weight',
    question: 'Weight preference?',
    subtitle: 'Lighter = easier to manoeuvre. Heavier = more power.',
    options: [
      { value: 'light', label: 'Light (under 360g)', icon: '🪶' },
      { value: 'medium', label: 'Medium (360-375g)', icon: '⚡' },
      { value: 'heavy', label: 'Heavy (375g+)', icon: '🔨' },
    ],
  },
  {
    id: 'frequency',
    question: 'How often do you play?',
    subtitle: 'This affects how durable your racket needs to be.',
    options: [
      { value: 'casual', label: 'Once or twice a month', icon: '📅' },
      { value: 'regular', label: '1-2 times a week', icon: '🔄' },
      { value: 'obsessed', label: '3+ times a week', icon: '🔥' },
    ],
  },
];

interface Recommendation {
  name: string;
  brand: string;
  price: string;
  shape: string;
  why: string;
  url: string;
  image?: string;
}

function getRecommendations(answers: Record<string, string>): Recommendation[] {
  const { level, style, budget } = answers;
  
  // Beginner recommendations
  if (level === 'beginner') {
    if (budget === 'low') {
      return [
        { name: 'Head Evo Speed 2025', brand: 'Head', price: '~£62', shape: 'Round', why: 'Lightweight, forgiving sweet spot, perfect first racket from a premium brand.', url: pm('collections/rackets-head') },
        { name: 'Wilson Optix V2 Lite 2026', brand: 'Wilson', price: '~£70', shape: 'Round', why: 'Larger head for easy hitting. Fibreglass face forgives off-centre shots.', url: pm('collections/rackets-wilson') },
        { name: 'Bullpadel Vertex Advance', brand: 'Bullpadel', price: '~£80', shape: 'Round', why: 'Soft EVA core absorbs vibration. Great control for learning technique.', url: pm('collections/rackets-bullpadel') },
      ];
    }
    return [
      { name: 'Head Zephyr UL 2025', brand: 'Head', price: '~£95', shape: 'Round', why: 'Graphene frame with power foam. An advanced racket that\'s still beginner-friendly.', url: pm('collections/rackets-head') },
      { name: 'Babolat Reveal 2025', brand: 'Babolat', price: '~£120', shape: 'Round', why: 'Soft touch face with excellent vibration dampening. Grows with you as you improve.', url: pm('collections/rackets-babolat') },
      { name: 'Nox ML10 Pro Cup 2026', brand: 'Nox', price: '~£130', shape: 'Round', why: 'Miguel Lamperti\'s signature. The most popular control racket in the world.', url: pm('collections/rackets-nox') },
    ];
  }

  // Intermediate recommendations
  if (level === 'intermediate') {
    if (style === 'control') {
      return [
        { name: 'Bullpadel Vertex 05 HYB 2026', brand: 'Bullpadel', price: '~£200', shape: 'Round', why: 'Juan Tello\'s hybrid version. Incredible feel and precision at the net.', url: pm('collections/rackets-bullpadel') },
        { name: 'Nox AT10 Pro Cup Soft 2026', brand: 'Nox', price: '~£150', shape: 'Teardrop', why: 'Soft face for comfort, teardrop for versatility. Best of both worlds.', url: pm('collections/rackets-nox') },
        { name: 'Head Coello Motion 2025', brand: 'Head', price: '~£180', shape: 'Teardrop', why: 'Arturo Coello\'s lighter version. Attack-oriented but very manageable weight.', url: pm('collections/rackets-head') },
      ];
    }
    if (style === 'power') {
      return [
        { name: 'Bullpadel Hack 04 CMF 2026', brand: 'Bullpadel', price: '~£219', shape: 'Diamond', why: 'Paquito Navarro\'s mid-range version. Explosive power without breaking the bank.', url: pm('collections/rackets-bullpadel') },
        { name: 'Adidas Metalbone Team 3.4', brand: 'Adidas', price: '~£170', shape: 'Diamond', why: 'Same mould as the pro Metalbone at half the price. Devastating overheads.', url: pm('collections/rackets-adidas') },
        { name: 'Wilson Bela Pro V3 2025', brand: 'Wilson', price: '~£206', shape: 'Teardrop', why: 'Belasteguín\'s signature. Power with a teardrop shape for forgiveness.', url: pm('collections/rackets-wilson') },
      ];
    }
    return [
      { name: 'Nox AT10 Genius 12K 2026', brand: 'Nox', price: '~£200', shape: 'Teardrop', why: 'Agustín Tapia\'s versatile option. Works in defence and attack equally well.', url: pm('collections/rackets-nox') },
      { name: 'Siux Diablo Pro 2026', brand: 'Siux', price: '~£250', shape: 'Teardrop', why: 'Valentino Libaak\'s racket. Medium balance, large sweet spot, does everything well.', url: pm('collections/rackets-siux') },
      { name: 'Head Speed Motion 2025', brand: 'Head', price: '~£180', shape: 'Teardrop', why: 'Lightweight teardrop with excellent manoeuvrability. Great transition racket.', url: pm('collections/rackets-head') },
    ];
  }

  // Advanced recommendations
  if (style === 'control') {
    return [
      { name: 'Bullpadel Vertex 05 2026', brand: 'Bullpadel', price: '~£298', shape: 'Round', why: 'Juan Tello\'s pro model. The best control racket money can buy in 2026.', url: pm('collections/rackets-bullpadel') },
      { name: 'Adidas Metalbone CTRL 3.4 2025', brand: 'Adidas', price: '~£270', shape: 'Round', why: 'Carbon exoskeleton for rigidity. Weight & Balance system for customisation.', url: pm('collections/rackets-adidas') },
      { name: 'Nox ML10 Ventus Control 3K 2026', brand: 'Nox', price: '~£268', shape: 'Round', why: 'Lamperti\'s 2026 flagship. 3K carbon face for surgical precision.', url: pm('collections/rackets-nox') },
    ];
  }
  if (style === 'power') {
    return [
      { name: 'Bullpadel Hack 04 2026', brand: 'Bullpadel', price: '~£280', shape: 'Diamond', why: 'Paquito Navarro\'s weapon. MultiEVA core for maximum power transfer.', url: pm('collections/rackets-bullpadel') },
      { name: 'Nox AT10 Genius Attack 18K 2026', brand: 'Nox', price: '~£284', shape: 'Diamond', why: 'Tapia\'s attack variant. 18K carbon for brutal stiffness and power.', url: pm('collections/rackets-nox') },
      { name: 'Adidas Metalbone HRD+ 3.4 2025', brand: 'Adidas', price: '~£300', shape: 'Diamond', why: 'Ale Galán\'s pro model. The hardest-hitting racket in the adidas range.', url: pm('collections/rackets-adidas') },
    ];
  }
  return [
    { name: 'Bullpadel Xplo 2026', brand: 'Bullpadel', price: '~£280', shape: 'Teardrop', why: 'Di Nenno\'s signature. Explosive power in a versatile teardrop shape.', url: pm('collections/rackets-bullpadel') },
    { name: 'Nox AT10 Genius 18K Alum 2026', brand: 'Nox', price: '~£306', shape: 'Teardrop', why: 'Tapia\'s flagship. 18K carbon with aluminium reinforcement. The complete racket.', url: pm('collections/rackets-nox') },
    { name: 'Head Coello Pro 2025', brand: 'Head', price: '~£280', shape: 'Teardrop', why: 'Arturo Coello\'s match racket. Stiff, fast, rewards clean technique.', url: pm('collections/rackets-head') },
  ];
}

export default function RacketQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const currentQ = questions[step];
  const progress = ((step) / questions.length) * 100;

  function handleAnswer(value: string) {
    const next = { ...answers, [currentQ.id]: value };
    setAnswers(next);
    
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setShowResults(true);
    }
  }

  function reset() {
    setStep(0);
    setAnswers({});
    setShowResults(false);
  }

  if (showResults) {
    const recs = getRecommendations(answers);
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="label-caps">Your results</div>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight md:text-4xl">
            Your perfect rackets
          </h2>
          <p className="mt-3 text-sm text-pm-muted max-w-md mx-auto">
            Based on your answers, here are the three rackets we'd recommend. 
            Any of these will serve you well.
          </p>
        </div>

        <div className="space-y-4">
          {recs.map((rec, i) => (
            <div key={i} className="rounded-2xl border border-pm-border/60 bg-pm-bg-card p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pm-accent">
                      {i === 0 ? 'Top pick' : i === 1 ? 'Runner up' : 'Also great'}
                    </span>
                    <span className="text-[10px] text-pm-faint">·</span>
                    <span className="text-[10px] text-pm-faint">{rec.shape} shape</span>
                  </div>
                  <h3 className="mt-2 font-serif text-xl font-semibold tracking-tight">{rec.name}</h3>
                  <p className="mt-1 text-xs text-pm-faint">{rec.brand}</p>
                  <p className="mt-3 text-sm text-pm-muted leading-relaxed">{rec.why}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-semibold text-pm-accent">{rec.price}</div>
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <a
                  href={rec.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="btn-primary text-sm"
                >
                  View on Padel Market →
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center space-y-3">
          <button onClick={reset} className="btn-secondary text-sm">
            Retake quiz
          </button>
          <p className="text-[11px] text-pm-faint">
            Links go to Padel Market, our recommended UK padel retailer
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="h-1 bg-pm-border/40 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-pm-accent rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="text-center">
        <span className="text-[11px] text-pm-faint">
          Question {step + 1} of {questions.length}
        </span>
        <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight md:text-3xl">
          {currentQ.question}
        </h2>
        <p className="mt-2 text-sm text-pm-muted">{currentQ.subtitle}</p>
      </div>

      <div className="mt-8 space-y-3">
        {currentQ.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleAnswer(opt.value)}
            className="w-full flex items-center gap-4 rounded-xl border border-pm-border/60 bg-pm-bg-card px-6 py-5 text-left hover:border-pm-accent/40 hover:bg-pm-bg-hover transition-all group active:scale-[0.98]"
          >
            <span className="text-2xl">{opt.icon}</span>
            <span className="text-sm font-medium text-pm-text group-hover:text-pm-accent transition-colors">
              {opt.label}
            </span>
          </button>
        ))}
      </div>

      {step > 0 && (
        <button
          onClick={() => setStep(step - 1)}
          className="mt-4 text-xs text-pm-faint hover:text-pm-text transition-colors mx-auto block"
        >
          ← Back
        </button>
      )}
    </div>
  );
}
