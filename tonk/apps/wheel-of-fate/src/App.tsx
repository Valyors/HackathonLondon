import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { motion } from "framer-motion";
import { WheelOfFate } from "./components/WheelOfFate";
import { SpinHistory } from "./components/SpinHistory";
import { useWheelStore } from "./stores/wheelStore";

const WheelPage: React.FC<{ eventId: string }> = ({ eventId }) => {
  const [fairMode, setFairMode] = useState(false);
  const { addSpinToHistory, users } = useWheelStore(state => ({
    addSpinToHistory: state.addSpinToHistory,
    users: state.users
  }));

  const handleWinnerSelected = (winnerId: string) => {
    if (users[winnerId]) {
      addSpinToHistory({
        eventId,
        winnerId,
        wasInFairMode: fairMode
      });
    }
  };

  if (Object.keys(users).length === 0) {
    return (
      <motion.div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#111827',
          color: 'white'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: '1.25rem' }}>No participants found</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      style={{
        minHeight: '100vh',
        backgroundColor: '#111827',
        color: 'white',
        padding: '2rem 1rem'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
        <motion.div
          style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Event: {eventId}
          </h1>
          <p style={{ color: '#9CA3AF' }}>
            {Object.keys(users).length} participants
          </p>
        </motion.div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontWeight: 500,
                backgroundColor: fairMode ? '#3B82F6' : '#374151',
                color: fairMode ? 'white' : '#D1D5DB',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => setFairMode(!fairMode)}
            >
              {fairMode ? '✨ Fair Mode' : '⚖️ Weighted Mode'}
            </button>
          </motion.div>
        </div>

        <WheelOfFate
          eventId={eventId}
          fairMode={fairMode}
          onWinnerSelected={handleWinnerSelected}
        />

        <SpinHistory eventId={eventId} />
      </div>
    </motion.div>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/event/:eventId" element={<WheelPage eventId={window.location.pathname.split('/')[2]} />} />
      <Route path="/" element={
        <motion.div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#111827',
            color: 'white'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ fontSize: '1.25rem' }}>Please select an event</div>
        </motion.div>
      } />
    </Routes>
  );
};

export default App;
