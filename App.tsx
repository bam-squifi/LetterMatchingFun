
import React, { useState, useCallback } from 'react';
import Circle from './components/Circle';

// --- Game Logic Types and Constants ---
type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_SETTINGS = {
  easy: { lettersPerCircle: 4, useLowercase: false },
  medium: { lettersPerCircle: 6, useLowercase: false },
  hard: { lettersPerCircle: 8, useLowercase: true },
};

const ALPHABET_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const ALPHABET_LOWER = 'abcdefghijklmnopqrstuvwxyz'.split('');

// --- Game Logic Helpers ---
const shuffleArray = <T,>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const generateRound = (difficulty: Difficulty) => {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  
  const fullLetterPool = settings.useLowercase
    ? [...ALPHABET_UPPER, ...ALPHABET_LOWER]
    : [...ALPHABET_UPPER];
  
  // 1. Pick a "concept" letter (e.g., 'A')
  const matchingLetterConcept = ALPHABET_UPPER[Math.floor(Math.random() * ALPHABET_UPPER.length)];

  // 2. Create a pool of unique "filler" letters, ensuring no conceptual duplicates (e.g., no 'b' if 'B' is already used).
  const fillerPool: string[] = [];
  const usedConcepts = new Set<string>([matchingLetterConcept]);
  const shuffledFullPool = shuffleArray([...fullLetterPool]);

  for (const letter of shuffledFullPool) {
    const concept = letter.toUpperCase();
    if (!usedConcepts.has(concept)) {
      fillerPool.push(letter);
      usedConcepts.add(concept);
    }
  }

  // 3. Pick the required number of unique filler letters for each circle from the pool.
  const lettersForCircle1 = new Set<string>();
  const lettersForCircle2 = new Set<string>();
  
  let fillerIndex = 0;
  while(lettersForCircle1.size < settings.lettersPerCircle - 1 && fillerIndex < fillerPool.length) {
    lettersForCircle1.add(fillerPool[fillerIndex++]);
  }
  while(lettersForCircle2.size < settings.lettersPerCircle - 1 && fillerIndex < fillerPool.length) {
    lettersForCircle2.add(fillerPool[fillerIndex++]);
  }

  // 4. For hard mode, randomize the case of the matching letter for each circle.
  const getMatchingLetterWithCase = () => {
    if (settings.useLowercase) {
      return Math.random() > 0.5 ? matchingLetterConcept.toUpperCase() : matchingLetterConcept.toLowerCase();
    }
    return matchingLetterConcept;
  };
  
  // 5. Combine fillers with the (potentially case-randomized) matching letter and shuffle.
  const letters1 = shuffleArray([...Array.from(lettersForCircle1), getMatchingLetterWithCase()]);
  const letters2 = shuffleArray([...Array.from(lettersForCircle2), getMatchingLetterWithCase()]);
  
  return { letters1, letters2, matchingLetter: matchingLetterConcept };
};


// --- Helper UI Components ---
const StarIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = '', style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.006z" clipRule="evenodd" />
    </svg>
);

const WrongIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


interface RoundData {
  letters1: string[];
  letters2: string[];
  matchingLetter: string; // This will always be the uppercase "concept" letter
}

const App: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [roundData, setRoundData] = useState<RoundData | null>(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'idle' | 'correct'>('idle');
  const [wrongGuess, setWrongGuess] = useState(false);
  const [wrongGuessesInRound, setWrongGuessesInRound] = useState(0);
  
  const startNewRound = useCallback(() => {
    if (!difficulty) return;
    setFeedback('idle');
    setWrongGuessesInRound(0);
    setRoundData(null); // Clear old data to ensure components re-mount with new keys
    setTimeout(() => {
      setRoundData(generateRound(difficulty));
    }, 100); 
  }, [difficulty]);

  const handleSelectDifficulty = (level: Difficulty) => {
    setDifficulty(level);
    setScore(0);
    setFeedback('idle');
    setWrongGuessesInRound(0);
    setRoundData(null); // To show loading spinner
    // Generate the first round for the new difficulty
    setTimeout(() => {
      setRoundData(generateRound(level));
    }, 100);
  };

  const handleBackToMenu = () => {
    setDifficulty(null);
    setRoundData(null);
    setScore(0);
    setWrongGuessesInRound(0);
  };
  
  const handleLetterClick = (clickedLetter: string): boolean => {
    if (feedback !== 'idle' || !roundData) return false;

    // Case-insensitive check for the matching letter
    if (clickedLetter.toUpperCase() === roundData.matchingLetter.toUpperCase()) {
      setScore(prev => prev + 1);
      setFeedback('correct');
      setTimeout(() => {
        startNewRound();
      }, 1200);
      return true;
    } else {
      setWrongGuess(true);
      setWrongGuessesInRound(prev => prev + 1);
      setTimeout(() => setWrongGuess(false), 500); // Show 'X' for 500ms
      return false;
    }
  };

  // Render difficulty selection screen if no difficulty is set
  if (!difficulty) {
    return (
        <main className="min-h-screen bg-gradient-to-br from-sky-200 via-blue-200 to-indigo-300 flex flex-col items-center justify-center p-4 font-sans antialiased">
            <div className="text-center bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 sm:p-12 animate-pop-in">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-800 mb-2" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.1)'}}>Letter Match Fun</h1>
                <p className="text-slate-600 text-lg sm:text-xl mb-8">Choose a difficulty to start!</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => handleSelectDifficulty('easy')} className="w-full sm:w-auto text-xl font-bold bg-green-400 hover:bg-green-500 text-white rounded-full px-8 py-4 shadow-lg transition-transform transform hover:scale-105">Easy</button>
                    <button onClick={() => handleSelectDifficulty('medium')} className="w-full sm:w-auto text-xl font-bold bg-yellow-400 hover:bg-yellow-500 text-white rounded-full px-8 py-4 shadow-lg transition-transform transform hover:scale-105">Medium</button>
                    <button onClick={() => handleSelectDifficulty('hard')} className="w-full sm:w-auto text-xl font-bold bg-red-500 hover:bg-red-600 text-white rounded-full px-8 py-4 shadow-lg transition-transform transform hover:scale-105">Hard</button>
                </div>
            </div>
        </main>
    );
  }

  // Render the main game screen
  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-200 via-blue-200 to-indigo-300 text-slate-800 flex flex-col items-center justify-center p-4 font-sans antialiased relative overflow-hidden">
      
      <header className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-10">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
            <div className="flex items-center gap-3 sm:gap-4">
                <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-wider" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.2)'}}>Letter Match Fun</h1>
                <span className={`hidden sm:inline-block text-sm font-bold capitalize px-3 py-1 rounded-full text-white ${difficulty === 'easy' ? 'bg-green-500' : difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'}`}>{difficulty}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
                <button onClick={handleBackToMenu} className="text-xs sm:text-sm font-bold bg-white/50 hover:bg-white/80 text-slate-700 rounded-full px-3 sm:px-4 py-2 shadow-lg transition-colors">
                    Menu
                </button>
                <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                    <StarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400"/>
                    <span className="text-xl sm:text-2xl font-bold text-slate-700">{score}</span>
                </div>
            </div>
        </div>
      </header>
      
      {roundData ? (
          <div key={score} className="flex flex-col lg:flex-row items-center justify-center gap-8 sm:gap-12 md:gap-16 mt-24 lg:mt-0">
              <Circle letters={roundData.letters1} onLetterClick={handleLetterClick} />
              <Circle letters={roundData.letters2} onLetterClick={handleLetterClick} />
          </div>
      ) : (
          <div className="text-2xl font-bold text-white">Loading...</div>
      )}

      {wrongGuess && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <WrongIcon className="w-32 h-32 text-red-500 animate-pop-in drop-shadow-lg" />
        </div>
      )}

      {feedback === 'correct' && (() => {
        const starsToShow = Math.max(1, 5 - wrongGuessesInRound);
        const rotationOffset = (starsToShow - 1) / 2;
        return (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
            <div className="text-center">
                <div className="flex justify-center">
                    {[...Array(starsToShow)].map((_, i) => (
                        <StarIcon 
                            key={i} 
                            className="w-16 h-16 sm:w-24 sm:h-24 text-yellow-300 animate-pop-in drop-shadow-lg" 
                            style={{ 
                                animationDelay: `${i * 100}ms`, 
                                transform: `rotate(${(i - rotationOffset) * 15}deg) translateY(${i % 2 === 0 ? '0' : '-20px'})` 
                            }}
                        />
                    ))}
                </div>
                <p className="text-4xl sm:text-5xl font-extrabold text-white mt-4 animate-pop-in drop-shadow-lg" style={{animationDelay: '100ms', textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>Correct!</p>
            </div>
            </div>
        );
      })()}

    </main>
  );
};

export default App;
