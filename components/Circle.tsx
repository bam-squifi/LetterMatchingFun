
import React, { useState, useMemo } from 'react';

// Letter Component (defined inside Circle.tsx as it is only used here)
interface LetterProps {
  letter: string;
  onLetterClick: (letter: string) => boolean;
}

const Letter: React.FC<LetterProps> = ({ letter, onLetterClick }) => {
  const [isShaking, setIsShaking] = useState(false);

  const randomStyle = useMemo(() => {
    const rotation = Math.floor(Math.random() * 40) - 20; // -20 to 20 degrees
    const fontSize = `${(Math.random() * 1.5 + 2.5).toFixed(1)}rem`; // 2.5rem to 4rem for larger letters
    const colors = ['text-red-500', 'text-blue-600', 'text-green-500', 'text-purple-600', 'text-orange-500', 'text-pink-500'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    return {
      transform: `rotate(${rotation}deg)`,
      fontSize,
      colorClass: color,
    };
  }, []);

  const handleClick = () => {
    if (isShaking) return;
    const isCorrect = onLetterClick(letter);
    if (!isCorrect) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };
  
  return (
    <div
      onClick={handleClick}
      className={`font-extrabold cursor-pointer transition-transform duration-200 hover:scale-125 p-1 m-1 sm:m-2 ${randomStyle.colorClass} ${isShaking ? 'animate-shake' : ''}`}
      style={{ fontSize: randomStyle.fontSize, transform: randomStyle.transform, textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}
    >
      {letter}
    </div>
  );
};


// Circle Component
interface CircleProps {
  letters: string[];
  onLetterClick: (letter: string) => boolean;
}

const Circle: React.FC<CircleProps> = ({ letters, onLetterClick }) => {
  return (
    <div className="bg-white/70 backdrop-blur-sm shadow-xl rounded-full w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 flex justify-center items-center flex-wrap p-4 animate-pop-in">
      {letters.map((letter) => (
        <Letter key={letter} letter={letter} onLetterClick={onLetterClick} />
      ))}
    </div>
  );
};

export default Circle;
