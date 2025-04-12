import React, { useState, useEffect, useRef } from 'react';
import { useExpenseStore } from '../stores/expenseStore';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

interface DebtGameProps {
  fromId: string;
  toId: string;
  amount: number;
}

const choices = {
  rock: { emoji: '🪨', color: '#ff6b6b', beats: 'scissors', label: 'Rock' },
  paper: { emoji: '📄', color: '#4dabf7', beats: 'rock', label: 'Paper' },
  scissors: { emoji: '✂️', color: '#51cf66', beats: 'paper', label: 'Scissors' }
} as const;

const resultVariants: Record<string, any> = {
  win: {
    scale: [1, 1.2, 1],
    rotate: [0, 10, -10, 0],
    backgroundColor: ['#4c1d95', '#047857', '#059669'] as const,
    boxShadow: ['0 0 20px rgba(0,255,0,0)', '0 0 30px rgba(0,255,0,0.5)', '0 0 20px rgba(0,255,0,0)'] as const,
    transition: { duration: 0.8, ease: 'easeInOut' as const }
  },
  lose: {
    scale: [1, 0.8, 1],
    rotate: [0, -5, 5, 0],
    backgroundColor: ['#4c1d95', '#991b1b', '#7f1d1d'] as const,
    boxShadow: ['0 0 20px rgba(255,0,0,0)', '0 0 30px rgba(255,0,0,0.5)', '0 0 20px rgba(255,0,0,0)'] as const,
    transition: { duration: 0.8, ease: 'easeInOut' as const }
  },
  draw: {
    scale: [1, 1.1, 0.9, 1],
    rotate: [0, 5, -5, 0],
    backgroundColor: ['#4c1d95', '#0f766e', '#0e7490'] as const,
    boxShadow: ['0 0 20px rgba(255,255,0,0)', '0 0 30px rgba(255,255,0,0.5)', '0 0 20px rgba(255,255,0,0)'] as const,
    transition: { duration: 0.8, ease: 'easeInOut' as const }
  }
};

const duelVariants: Record<string, any> = {
  initial: ({ isLeft }: { isLeft: boolean }) => ({
    x: isLeft ? -100 : 100,
    opacity: 0,
    scale: 0.8
  }),
  duel: {
    x: 0,
    opacity: 1,
    scale: 1.2,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  },
  clash: ({ isLeft }: { isLeft: boolean }) => ({
    x: isLeft ? -20 : 20,
    rotate: isLeft ? -15 : 15,
    scale: 1.4,
    transition: {
      duration: 0.3,
      ease: 'easeInOut'
    }
  }),
  result: ({ isWinner }: { isWinner: boolean }) => ({
    scale: isWinner ? 1.5 : 0.8,
    opacity: isWinner ? 1 : 0.6,
    y: isWinner ? -20 : 20,
    rotate: isWinner ? [0, 360] : [0, -180],
    transition: {
      duration: 0.5,
      ease: 'easeInOut'
    }
  })
};

const vsVariants: Record<string, any> = {
  hidden: {
    scale: 0,
    opacity: 0,
    rotate: -180
  },
  visible: {
    scale: [1, 1.2, 1],
    opacity: 1,
    rotate: 0,
    transition: {
      duration: 0.5,
      ease: "backOut"
    }
  },
  pulse: {
    scale: [1, 1.2, 1],
    filter: [
      'brightness(1)',
      'brightness(1.5)',
      'brightness(1)'
    ],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      repeatType: "mirror" as const
    }
  }
};

const buttonVariants: Record<string, any> = {
  idle: { scale: 1, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  hover: { 
    scale: 1.1,
    boxShadow: '0 8px 12px rgba(0,0,0,0.2)',
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.95,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: { duration: 0.1 }
  },
  selected: { 
    scale: 1.15,
    boxShadow: '0 0 20px rgba(255,255,255,0.6), 0 0 30px rgba(255,255,255,0.4), 0 0 40px rgba(255,255,255,0.2)'
  }
};

const getResultEmoji = (result: 'win' | 'lose' | 'draw') => {
  switch (result) {
    case 'win': return '🎉';
    case 'lose': return '💔';
    case 'draw': return '🤝';
    default: return '';
  }
};

const stageVariants: Record<string, any> = {
  initial: { scale: 0, opacity: 0 },
  enter: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  exit: { 
    scale: 0, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

interface DuelSideProps {
  isLeft: boolean;
}

const choiceVariants: Record<string, any> = {
  initial: ({ isLeft }: DuelSideProps) => ({
    x: isLeft ? -200 : 200,
    opacity: 0,
    scale: 0.5
  }),
  animate: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  },
  duel: ({ isLeft }: DuelSideProps) => ({
    x: isLeft ? -50 : 50,
    scale: 1.2,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15
    }
  }),
  clash: ({ isLeft }: DuelSideProps) => ({
    x: isLeft ? 0 : 0,
    y: [0, -20, 0],
    rotate: isLeft ? [-10, 0, 10] : [10, 0, -10],
    transition: {
      duration: 0.5,
      repeat: 2,
      repeatType: "mirror" as const
    }
  })
};

export const DebtGame: React.FC<DebtGameProps> = ({ fromId, toId, amount }) => {
  const [showDuel, setShowDuel] = useState(false);
  const [botChoice, setBotChoice] = useState<keyof typeof choices | null>(null);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    handleResize(); // Call it once to initialize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const duelTimeoutRef = useRef<NodeJS.Timeout>();
  const { gameState, challengeToGame, makeGameChoice } = useExpenseStore();
  const [activeDebtId, setActiveDebtId] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);


  const challenge = activeDebtId ? gameState.challenges[activeDebtId] : null;
  const isPlayer1 = fromId === challenge?.fromId;

  useEffect(() => {
    if (challenge?.status === 'completed') {
      const p1Choice = challenge.player1Choice!;
      const p2Choice = challenge.player2Choice!;
      
      if (p1Choice === p2Choice) setResult('draw');
      else if (
        (p1Choice === 'rock' && p2Choice === 'scissors') ||
        (p1Choice === 'paper' && p2Choice === 'rock') ||
        (p1Choice === 'scissors' && p2Choice === 'paper')
      ) setResult('win');
      else setResult('lose');
      
      setShowResult(true);
      setTimeout(() => setShowResult(false), 3000);
    }
  }, [challenge?.status]);

  const handleChallenge = () => {
    const debtId = challengeToGame(fromId, toId, Math.abs(amount));
    if (debtId) {
      setActiveDebtId(debtId);
    }
  };

  const [stage, setStage] = useState<'selection' | 'duel' | 'result'>('selection');
  const [animationComplete, setAnimationComplete] = useState(false);

  const handleAnimationComplete = () => {
    setAnimationComplete(true);
  };

  const handleChoice = (choice: keyof typeof choices) => {
    if (activeDebtId) {

      setStage('duel');
      setAnimationComplete(false);
      makeGameChoice(activeDebtId, fromId, choice);
      
      // Simulate bot choice after a delay
      setTimeout(() => {
        const botChoices = ['rock', 'paper', 'scissors'] as const;
        const randomChoice = botChoices[Math.floor(Math.random() * botChoices.length)];
        setBotChoice(randomChoice);
        
        // Show clash animation
        setTimeout(() => {
          setShowDuel(true);
          
          // Show result after clash
          setTimeout(() => {
            setStage('result');
            makeGameChoice(activeDebtId, toId, randomChoice);
          }, 2000);
        }, 1000);
      }, 500);
    }
  };

  if (Math.abs(amount) > 5 || amount === 0) {
    return null;
  }

  if (!challenge) {
    return (
      <motion.button
        onClick={handleChallenge}
        className="px-6 py-3 text-lg font-medium bg-gradient-to-r from-purple-500 via-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg"
        whileHover={{ 
          scale: 1.05,
          boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
          backgroundPosition: ['0% 50%', '100% 50%'],
          transition: { 
            duration: 0.3, 
            backgroundPosition: { 
              duration: 0.8, 
              repeat: Infinity, 
              repeatType: 'reverse',
              ease: "linear"
            } 
          }
        }}
        whileTap={{ scale: 0.95, boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        🎮 Play RPS to Cancel Debt
      </motion.button>
    );
  }

  if (challenge.status === 'in_progress' && !showResult && !showDuel) {
    const hasPlayed = isPlayer1 ? challenge.player1Choice : challenge.player2Choice;
    
    if (hasPlayed) {
      // Simulate bot's choice after a delay
      useEffect(() => {
        if (!activeDebtId) return;
        if (hasPlayed && !botChoice) {
          const choices = ['rock', 'paper', 'scissors'] as const;
          const randomChoice = choices[Math.floor(Math.random() * choices.length)];
          
          setTimeout(() => {
            setBotChoice(randomChoice);
            setShowDuel(true);
            
            // Show duel animation for 2 seconds before making the choice
            duelTimeoutRef.current = setTimeout(() => {
              if (activeDebtId) {
                makeGameChoice(activeDebtId, toId, randomChoice);
              }
              setShowDuel(false);
            }, 2000);
          }, 1000);
        }
        
        return () => {
          if (duelTimeoutRef.current) {
            clearTimeout(duelTimeoutRef.current);
          }
        };
      }, [hasPlayed]);
      
      return (
        <motion.div
          className="p-8 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl shadow-2xl text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="text-2xl font-bold mb-6 text-white"
            animate={{ opacity: [0.5, 1], scale: [0.98, 1.02] }}
            transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
          >
            {botChoice ? '⚔️ Duel in progress...' : 'Waiting for bot...'}
          </motion.div>
          {!botChoice ? (
            <motion.div 
              className="text-5xl inline-block"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              🎮
            </motion.div>
          ) : (
            <div className="relative h-48 flex justify-center items-center bg-black/20 rounded-xl overflow-hidden">
              {/* VS Text */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-yellow-400/80 select-none"
                variants={{
                  initial: { opacity: 0, scale: 5 },
                  animate: { 
                    opacity: [0, 1, 0.5],
                    scale: [5, 1, 1.2],
                    filter: [
                      'brightness(2) blur(10px)',
                      'brightness(1) blur(0px)',
                      'brightness(1.5) blur(0px)'
                    ],
                    transition: { 
                      duration: 1,
                      times: [0, 0.3, 1]
                    }
                  }
                }}
                initial="initial"
                animate="animate"
              >
                VS
              </motion.div>
              <motion.div
                className="text-6xl absolute left-1/4 transform -translate-x-1/2 select-none filter drop-shadow-lg"
                custom={{ isLeft: true }}
                variants={duelVariants}
                initial="initial"
                animate={showDuel ? ["duel", "clash"] : "initial"}
                transition={{ duration: 0.5 }}
              >
                {choices[challenge.player1Choice!].emoji}
              </motion.div>
              
              <motion.div
                className="text-4xl font-bold text-yellow-400 absolute left-1/2 transform -translate-x-1/2"
                variants={vsVariants}
                initial="hidden"
                animate={showDuel ? ["visible", "pulse"] : "hidden"}
              >
                ⚔️
              </motion.div>
              
              <motion.div
                className="text-6xl absolute right-1/4 transform translate-x-1/2 select-none filter drop-shadow-lg"
                custom={{ isLeft: false }}
                variants={duelVariants}
                initial="initial"
                animate={showDuel ? ["duel", "clash"] : "initial"}
                transition={{ duration: 0.5 }}
              >
                {choices[botChoice].emoji}
              </motion.div>
            </div>
          )}
        </motion.div>
      );
    }

    return (
      <motion.div 
        className="p-8 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl shadow-2xl max-w-2xl mx-auto overflow-hidden"
        variants={stageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        <motion.div 
          className="text-2xl font-bold mb-6 text-center text-white"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: 0.2,
            type: "spring",
            stiffness: 200,
            damping: 20
          }}
        >
          Choose your move to {amount < 0 ? 'cancel' : 'double'} ${Math.abs(amount)} debt
        </motion.div>
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-4">
          <AnimatePresence>
            {Object.entries(choices).map(([choice, { emoji, color }], index) => (
              <motion.button
                key={choice}
                onClick={() => handleChoice(choice as 'rock' | 'paper' | 'scissors')}
                className={`p-6 text-4xl bg-opacity-90 rounded-2xl shadow-lg relative overflow-hidden aspect-square flex flex-col items-center justify-center gap-2 select-none`}
                style={{ backgroundColor: color }}
                variants={buttonVariants}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover="hover"
                whileTap="tap"
                transition={{ 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 400,
                  damping: 30
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-white"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 0.2 }}
                />
                <motion.div
                  className="relative z-10"
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.2 }}
              >
                  <span className="text-4xl filter drop-shadow-md">{emoji}</span>
                  <span className="text-sm font-medium">{choices[choice as keyof typeof choices].label}</span>
                </motion.div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }

  if (showResult && result) {
    const isWinOrLose = result === 'win' || result === 'lose';
    return (
      <motion.div 
        className="relative p-8 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl shadow-2xl text-center overflow-hidden max-w-2xl mx-auto"
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        variants={resultVariants}
        animate={result}
      >
        {result === 'win' && (
          <div className="absolute inset-0 z-0">
            <Confetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={false}
              numberOfPieces={200}
              gravity={0.3}
              colors={['#FFD700', '#FFA500', '#FF69B4', '#87CEEB', '#98FB98']}
            />
          </div>
        )}
        <motion.div 
          className="relative z-10 text-6xl mb-4"
          animate={{ 
            scale: [1, 1.5, 1],
            rotate: [0, result === 'win' ? 360 : result === 'lose' ? -360 : 0, 0],
            y: isWinOrLose ? [0, -20, 0] : 0
          }}
          transition={{ 
            duration: 0.7,
            y: { repeat: Infinity, repeatType: 'reverse', duration: 1.5 }
          }}
        >
          {getResultEmoji(result)}
        </motion.div>
        <motion.div 
          className="relative z-10 text-2xl font-bold text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {result === 'win' ? '🎉 Debt Cancelled!' : 
           result === 'lose' ? '💔 Debt Doubled!' : 
           '🤝 Draw - Try Again!'}
        </motion.div>
      </motion.div>
    );
  }

  return null;
};
