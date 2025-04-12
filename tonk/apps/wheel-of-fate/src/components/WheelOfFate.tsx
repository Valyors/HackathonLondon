import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWheelStore } from '../stores/wheelStore';

interface WheelOfFateProps {
  eventId: string;
  onWinnerSelected?: (userId: string) => void;
  fairMode?: boolean;
  calculateWeight?: (userId: string) => number;
}

interface Participant {
  id: string;
  name: string;
  debt: number;
  color: string;
}

// French-inspired color palette
const COLORS = [
  '#0055A4', // French flag blue
  '#FFFFFF', // French flag white
  '#EF4135', // French flag red
  '#E6BE8A', // Gold accent
  '#7FB3D5', // Light blue
  '#5D8AA8', // French blue (Air Force)
  '#D4AF37', // Metallic gold
  '#B1624E'  // Terracotta
];

export const WheelOfFate: React.FC<WheelOfFateProps> = ({ 
  eventId, 
  onWinnerSelected,
  fairMode = false,
  calculateWeight
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
        debt: calculateWeight ? calculateWeight(id) : 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      }));

    setParticipants(participants);
  }, [eventId, fairMode, users, calculateWeight]);

  const calculateSlices = () => {
    // In fair mode, all participants have equal weight
    const weights = fairMode
      ? participants.map(() => 1)
      : participants.map(p => p.debt);
    
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    let currentAngle = 0;
    
    return participants.map(participant => {
      const weight = fairMode ? 1 : participant.debt;
      const slice = {
        startAngle: currentAngle,
        endAngle: currentAngle + (weight / total) * Math.PI * 2,
        participant
      };
      currentAngle += (weight / total) * Math.PI * 2;
      
      const startAngle = slice.startAngle;
      const endAngle = slice.endAngle;
      const x1 = Math.cos(startAngle);
      const y1 = Math.sin(startAngle);
      const x2 = Math.cos(endAngle);
      const y2 = Math.sin(endAngle);
      
      return {
        participant,
        path: `M 0 0 L ${x1} ${y1} A 1 1 0 ${endAngle - startAngle > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`,
        midAngle: (startAngle + endAngle) / 2
      };
    });
  };

  const spinWheel = async () => {
    if (isSpinning || !participants.length) return;
    
    setIsSpinning(true);
    setWinner(null);
    setShowConfetti(false);

    
    // Random number of full rotations (5-8) plus the winner's position
    const slices = calculateSlices();
    const randomIndex = Math.floor(Math.random() * participants.length);
    const winningParticipant = participants[randomIndex];
    
    // Calculate the angle to the winner slice
    const sliceAngle = 360 / participants.length;
    const winnerAngle = randomIndex * sliceAngle;
    
    // Total rotation: multiple full rotations + winner angle
    const fullRotations = 1800 + Math.floor(Math.random() * 1080); // 5-8 full rotations
    const finalRotation = fullRotations + winnerAngle;
    
    // Create a multi-stage animation for more dynamic effect
    controls.start({
      rotate: [0, 360, finalRotation * 0.5, finalRotation],
      transition: { 
        duration: 4.5, 
        times: [0, 0.2, 0.5, 1],
        ease: ["easeIn", "easeOut", "circOut"],
        type: "spring",
        stiffness: 50,
        damping: 15
      }
    }).then(() => {
      setIsSpinning(false);
      setWinner(winningParticipant);
      setShowConfetti(true);
      
      if (onWinnerSelected) {
        onWinnerSelected(winningParticipant.id);
      }
    });
  };

  const slices = calculateSlices();

  return (
    <div className="relative flex flex-col items-center justify-center p-8">
      <AnimatePresence>
        {showConfetti && (
          <Confetti
            width={typeof window !== 'undefined' ? window.innerWidth : 500}
            height={typeof window !== 'undefined' ? window.innerHeight : 500}
            recycle={false}
            numberOfPieces={300}
            gravity={0.15}
            colors={['#0055A4', '#FFFFFF', '#EF4135', '#E6BE8A', '#7FB3D5']} // French colors
            confettiSource={typeof window !== 'undefined' ? {
              x: window.innerWidth / 2,
              y: window.innerHeight / 3,
              w: 0,
              h: 0
            } : undefined}
          />
        )}
      </AnimatePresence>

      <motion.div
        style={{
          position: 'relative',
          width: '350px',
          height: '350px',
          maxWidth: '100%',
          margin: '0 auto',
          filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.3))'
        }}
        initial={{ scale: 0, opacity: 0, rotate: -180 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
      >
        <motion.svg
          ref={wheelRef}
          viewBox="-1.2 -1.2 2.4 2.4"
          animate={controls}
          style={{
            transformOrigin: "50% 50%",
            width: '100%',
            height: '100%',
            transform: 'rotate(-90deg)',
            filter: 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.2))'
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
                style={{ 
                  filter: `drop-shadow(0 0 2px rgba(0, 0, 0, 0.3))`,
                }}
              />
            ))}
          </g>
          
          {/* Decorative elements - French-inspired */}
          <circle r="0.05" fill="#EF4135" />
          <circle r="0.1" fill="#FFFFFF" stroke="#0055A4" strokeWidth="0.02" />
          <circle r="0.03" fill="#0055A4" />
          
          {/* Names */}
          {slices.map(({ participant, midAngle }, index) => {
            const distance = 0.65;
            const x = Math.cos(midAngle * (Math.PI / 180)) * distance;
            const y = Math.sin(midAngle * (Math.PI / 180)) * distance;
            
            return (
              <g key={participant.id}>
                <motion.text
                  x={x}
                  y={y}
                  fontSize="0.12"
                  fill="white"
                  fontWeight="bold"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  style={{ textShadow: '0 0 3px rgba(0, 0, 0, 0.5)' }}
                  transform={`rotate(${midAngle + 90}, ${x}, ${y})`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  {participant.name}
                </motion.text>
              </g>
            );
          })}
        </motion.svg>

        {/* Pointer - French flag themed */}
        <motion.div 
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            marginLeft: '-1.5rem',
            marginTop: '-0.5rem',
            width: '3rem',
            height: '3rem',
            zIndex: 10
          }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          <svg viewBox="0 0 24 24">
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.3)" />
            </filter>
            <path d="M12 2L4 22h16L12 2z" fill="#0055A4" filter="url(#shadow)" />
            <path d="M12 6L8 18h8L12 6z" fill="#FFFFFF" />
            <path d="M12 10L10 16h4L12 10z" fill="#EF4135" />
          </svg>
        </motion.div>
      </motion.div>

      <motion.div
        style={{
          marginTop: '2rem',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <motion.div
          whileHover={!isSpinning && participants.length ? { scale: 1.05, boxShadow: '0 8px 15px rgba(0, 0, 0, 0.2)' } : {}}
          whileTap={!isSpinning && participants.length ? { scale: 0.95 } : {}}
        >
          <button
            style={{
              padding: '0.75rem 2rem',
              background: isSpinning 
                ? 'linear-gradient(135deg, #0055A4, #7FB3D5)' 
                : 'linear-gradient(135deg, #EF4135, #FF7676)',
              color: 'white',
              borderRadius: '2rem',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
              cursor: (isSpinning || !participants.length) ? 'not-allowed' : 'pointer',
              opacity: (isSpinning || !participants.length) ? 0.8 : 1,
              border: 'none',
              outline: 'none',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              width: '100%'
            }}
            onClick={() => !isSpinning && participants.length && spinWheel()}
            disabled={isSpinning || !participants.length}
          >
          {isSpinning ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                style={{ display: 'inline-block', marginRight: '8px' }}
              >
                🔄
              </motion.span>
              Tournez la roue...
            </>
          ) : (
            <>
              <span style={{ marginRight: '8px' }}>🎯</span>
              Tournez la roue!
            </>
          )}
          
          {/* Decorative French flag gradient overlay */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '5px',
            background: 'linear-gradient(to right, #0055A4, #FFFFFF, #EF4135)',
            opacity: 0.7
          }}></div>
          </button>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {winner && (
          <motion.div
            style={{
              marginTop: '2rem',
              padding: '1rem',
              borderRadius: '1rem',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              maxWidth: '80%',
              margin: '0 auto'
            }}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', bounce: 0.4 }}
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.3, times: [0, 0.6, 1], duration: 0.6 }}
              style={{ 
                fontSize: '3rem', 
                marginBottom: '0.5rem' 
              }}
            >
              🎉
            </motion.div>
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{
                fontSize: '1.75rem',
                fontWeight: 'bold',
                color: winner.color,
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                margin: '0.5rem 0'
              }}
            >
              {winner.name}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.9)',
                margin: '0.5rem 0'
              }}
            >
              a été choisi(e)!
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
