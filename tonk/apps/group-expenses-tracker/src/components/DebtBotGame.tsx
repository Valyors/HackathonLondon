import React, { useState } from 'react';
import { useExpenseStore } from '../stores/expenseStore';

interface DebtBotGameProps {
  fromId: string;
  toId: string;
  amount: number;
}

type Choice = 'rock' | 'paper' | 'scissors';

export const DebtBotGame: React.FC<DebtBotGameProps> = ({ fromId, toId, amount }) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'result'>('idle');
  const [userChoice, setUserChoice] = useState<Choice | null>(null);
  const [botChoice, setBotChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const { addSettlement } = useExpenseStore();

  if (Math.abs(amount) > 5) {
    return null;
  }

  const choices: Choice[] = ['rock', 'paper', 'scissors'];
  const emojis: Record<Choice, string> = {
    rock: '🪨',
    paper: '📄',
    scissors: '✂️'
  };

  const determineWinner = (player: Choice, bot: Choice): 'win' | 'lose' => {
    if (player === bot) return Math.random() < 0.5 ? 'win' : 'lose';
    if (
      (player === 'rock' && bot === 'scissors') ||
      (player === 'paper' && bot === 'rock') ||
      (player === 'scissors' && bot === 'paper')
    ) return 'win';
    return 'lose';
  };

  const handleChoice = async (choice: Choice) => {
    setUserChoice(choice);
    setGameState('playing');

    // Animated delay before bot choice
    await new Promise(resolve => setTimeout(resolve, 1000));
    const botChoice = choices[Math.floor(Math.random() * choices.length)];
    setBotChoice(botChoice);

    // Animated delay before showing result
    await new Promise(resolve => setTimeout(resolve, 1000));
    const gameResult = determineWinner(choice, botChoice);
    setResult(gameResult);

    // Create settlement
    addSettlement({
      from: fromId,
      to: toId,
      amount: gameResult === 'win' ? 0 : amount * 2,
      date: new Date().toISOString(),
      method: 'game',
      gameResult: {
        winner: gameResult === 'win' ? fromId : toId,
        action: gameResult === 'win' ? 'cancel' : 'double',
        player1Choice: choice,
        player2Choice: botChoice
      }
    });

    // Reset game after delay
    setTimeout(() => {
      setGameState('idle');
      setUserChoice(null);
      setBotChoice(null);
      setResult(null);
    }, 3000);
  };

  if (gameState === 'idle') {
    return (
      <button
        onClick={() => setGameState('playing')}
        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 transform"
      >
        🎮 Play RPS Bot
      </button>
    );
  }

  return (
    <div className="relative">
        <style>{`
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideFromLeft {
            from { opacity: 0; transform: translateX(-50px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideFromRight {
            from { opacity: 0; transform: translateX(50px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes popIn {
            from { opacity: 0; transform: scale(2); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes scaleIn {
            from { transform: scale(0); }
            to { transform: scale(1); }
          }
          .slide-in { animation: slideIn 0.3s ease-out; }
          .slide-left { animation: slideFromLeft 0.3s ease-out; }
          .slide-right { animation: slideFromRight 0.3s ease-out; }
          .pop-in { animation: popIn 0.3s ease-out; }
          .scale-in { animation: scaleIn 0.3s ease-out; }
        `}</style>
        
        {gameState === 'playing' && !userChoice && (
          <div className="flex gap-2 slide-in">
            {choices.map((choice) => (
              <button
                key={choice}
                onClick={() => handleChoice(choice)}
                className="w-12 h-12 flex items-center justify-center text-2xl bg-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 hover:rotate-3 active:scale-90"
              >
                {emojis[choice]}
              </button>
            ))}
          </div>
        )}

        {userChoice && (
          <div className="flex items-center gap-8">
            <div className="text-4xl slide-left">
              {emojis[userChoice]}
            </div>

            {botChoice && (
              <>
                <div className="text-2xl font-bold pop-in">
                  VS
                </div>
                <div className="text-4xl slide-right">
                  {emojis[botChoice]}
                </div>
              </>
            )}
          </div>
        )}

        {result && (
          <div
            className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-4 px-4 py-2 rounded-full font-bold scale-in ${
              result === 'win'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {result === 'win' ? '🎉 Debt Canceled!' : '💀 Debt Doubled!'}
          </div>
        )}
    </div>
  );
};
