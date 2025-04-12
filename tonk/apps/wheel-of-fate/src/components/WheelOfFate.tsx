import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWheelStore } from '../stores/wheelStore';

interface WheelOfFateProps {
  eventId: string;
  onWinnerSelected?: (userId: string) => void;
  fairMode?: boolean;
}

interface Participant {
  id: string;
  name: string;
  debt: number;
  color: string;
}

const COLORS = [
  '#FF6B6B', '#4DABF7', '#51CF66', '#FAB005', 
  '#BE4BDB', '#228BE6', '#40C057', '#FD7E14'
];

export const WheelOfFate: React.FC<WheelOfFateProps> = ({ 
  eventId, 
  onWinnerSelected,
  fairMode = false 
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const wheelRef = useRef<SVGSVGElement>(null);
  const controls = useAnimation();
  const users = useWheelStore((state) => state.users);

  useEffect(() => {
    const participants = Object.entries(users)
      .map(([id, user]) => ({
        id,
        name: user.name,
        debt: user.karmaScore,  // Use karma score as weight
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      }))
      .filter((p) => p.debt >= 0);  

    setParticipants(participants);
  }, [eventId, fairMode, users]);

  const calculateSlices = () => {
    const total = participants.reduce((sum, p) => sum + p.debt, 0);
    let currentAngle = 0;
    
    return participants.map(participant => {
      const sliceAngle = (participant.debt / total) * 360;
      const startAngle = currentAngle;
      currentAngle += sliceAngle;
      
      const x1 = Math.cos((startAngle * Math.PI) / 180);
      const y1 = Math.sin((startAngle * Math.PI) / 180);
      const x2 = Math.cos(((startAngle + sliceAngle) * Math.PI) / 180);
      const y2 = Math.sin(((startAngle + sliceAngle) * Math.PI) / 180);
      
      return {
        participant,
        path: `M 0 0 L ${x1} ${y1} A 1 1 0 ${sliceAngle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`,
        midAngle: startAngle + sliceAngle / 2
      };
    });
  };

  const spinWheel = async () => {
    if (isSpinning || !participants.length) return;
    
    setIsSpinning(true);
    setWinner(null);
    setShowConfetti(false);

    // Calculate weighted random winner
    const total = participants.reduce((sum, p) => sum + p.debt, 0);
    let random = Math.random() * total;
    let selectedParticipant = participants[0];
    
    for (const participant of participants) {
      if (random <= participant.debt) {
        selectedParticipant = participant;
        break;
      }
      random -= participant.debt;
    }

    // Calculate final rotation to winner's slice
    const slices = calculateSlices();
    const winnerSlice = slices.find(s => s.participant.id === selectedParticipant.id);
    if (!winnerSlice) return;

    const baseSpins = 5; // Minimum number of full rotations
    const targetAngle = -winnerSlice.midAngle;
    const totalRotation = baseSpins * 360 + targetAngle;

    // Animate the wheel
    await controls.start({
      rotate: [0, totalRotation],
      transition: {
        duration: 4,
        ease: [0.32, 0.72, 0.35, 0.98],
      }
    });

    // Show winner celebration
    setWinner(selectedParticipant);
    setShowConfetti(true);
    setIsSpinning(false);
    onWinnerSelected?.(selectedParticipant.id);
  };

  const slices = calculateSlices();

  return (
    <div className="relative flex flex-col items-center justify-center p-8">
      <AnimatePresence>
        {showConfetti && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={200}
            gravity={0.2}
          />
        )}
      </AnimatePresence>

      <motion.div
        style={{
          position: 'relative',
          width: '16rem',
          height: '16rem',
          margin: '0 auto'
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <motion.svg
          ref={wheelRef}
          viewBox="-1.2 -1.2 2.4 2.4"
          animate={controls}
          style={{
            transformOrigin: "50% 50%",
            width: '100%',
            height: '100%',
            transform: 'rotate(-90deg)'
          }}
        >
          <g transform="scale(0.9)">
            {slices.map(({ participant, path }, index) => (
              <motion.path
                key={participant.id}
                d={path}
                fill={participant.color}
                stroke="white"
                strokeWidth="0.02"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={!isSpinning ? { scale: 1.02 } : undefined}
              />
            ))}
          </g>
          
          {/* Center dot */}
          <circle r="0.1" fill="#2D3748" />
          
          {/* Names */}
          {slices.map(({ participant, midAngle }) => (
            <text
              key={participant.id}
              x={Math.cos((midAngle * Math.PI) / 180) * 0.6}
              y={Math.sin((midAngle * Math.PI) / 180) * 0.6}
              fontSize="0.12"
              fill="white"
              textAnchor="middle"
              transform={`rotate(${midAngle + 90})`}
            >
              {participant.name}
            </text>
          ))}
        </motion.svg>

        {/* Pointer */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          marginLeft: '-1rem',
          marginTop: '-0.25rem',
          width: '2rem',
          height: '2rem'
        }}>
          <svg viewBox="0 0 24 24" fill="#2D3748">
            <path d="M12 2L4 22h16L12 2z" />
          </svg>
        </div>
      </motion.div>

      <motion.div
        style={{
          marginTop: '2rem',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <button
          type="button"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#4F46E5',
            color: 'white',
            borderRadius: '0.5rem',
            fontWeight: 600,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            cursor: (isSpinning || !participants.length) ? 'not-allowed' : 'pointer',
            opacity: (isSpinning || !participants.length) ? 0.7 : 1,
            border: 'none',
            outline: 'none'
          }}
          onClick={() => !isSpinning && participants.length && spinWheel()}
          disabled={isSpinning || !participants.length}
        >
          {isSpinning ? "Spinning..." : "Spin the Wheel"}
        </button>
      </motion.div>

      <AnimatePresence>
        {winner && (
          <motion.div
            style={{
              marginTop: '1.5rem',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              textAlign: 'center'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            🎉 {winner.name} was chosen! 🎉
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
