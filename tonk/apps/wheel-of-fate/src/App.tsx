import React, { useState, useCallback } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { WheelOfFate } from "./components/WheelOfFate";
import { SpinHistory } from "./components/SpinHistory";
import { useWheelStore, Event } from "./stores/wheelStore";

const WheelPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [fairMode, setFairMode] = useState(false);
  
  // Use separate hooks for each piece of state to avoid unnecessary rerenders
  const users = useWheelStore(state => state.users);
  const events = useWheelStore(state => state.events);
  
  // Early return if no eventId
  if (!eventId) {
    return (
      <div style={{ padding: '2rem', backgroundColor: '#111827', color: 'white', minHeight: '100vh' }}>
        <h1>No event ID provided</h1>
      </div>
    );
  }

  // Get event data
  const event = events[eventId];
  
  // Early return if event not found
  if (!event) {
    return (
      <div style={{ padding: '2rem', backgroundColor: '#111827', color: 'white', minHeight: '100vh' }}>
        <h1>Event not found</h1>
      </div>
    );
  }

  const hasUsers = Object.keys(users).length > 0;

  // French-inspired color palette
  const colors = {
    blue: '#0055A4',  // French flag blue
    white: '#FFFFFF', // French flag white
    red: '#EF4135',   // French flag red
    gold: '#E6BE8A',  // Gold accent
    navy: '#001F3F',  // Dark navy background
    lightBlue: '#7FB3D5', // Light blue accent
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ 
        background: `linear-gradient(135deg, ${colors.navy} 0%, #0A1128 100%)`,
        color: 'white', 
        minHeight: '100vh',
        padding: '2rem',
        fontFamily: '"Montserrat", sans-serif'
      }}
    >
      {/* Header with The Frenchies branding */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        marginBottom: '2rem',
        position: 'relative'
      }}>
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
          style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold',
            margin: 0,
            color: colors.white,
            textShadow: `2px 2px 4px ${colors.blue}`,
            letterSpacing: '1px'
          }}>
            <span style={{ color: colors.blue }}>The</span> 
            <span style={{ color: colors.white }}>Fren</span>
            <span style={{ color: colors.red }}>chies</span>
          </h1>
          <div style={{ 
            height: '4px', 
            width: '80px', 
            background: `linear-gradient(to right, ${colors.blue}, ${colors.white}, ${colors.red})`,
            margin: '0.5rem 0 1rem 0',
            borderRadius: '2px'
          }}></div>
        </motion.div>
      </div>

      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        border: `1px solid rgba(255, 255, 255, 0.1)`
      }}>
        <motion.h1 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ 
            fontSize: '2rem', 
            marginBottom: '1rem',
            color: colors.gold,
            borderBottom: `2px solid ${colors.gold}`,
            paddingBottom: '0.5rem'
          }}
        >
          {event.title}
        </motion.h1>
        <motion.p 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ 
            marginBottom: '2rem',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.8)'
          }}
        >
          {event.description}
        </motion.p>
        
        <motion.h2 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ 
            fontSize: '1.5rem', 
            marginBottom: '1.5rem',
            color: colors.lightBlue,
            display: 'inline-block',
            position: 'relative'
          }}
        >
          <span style={{ position: 'relative', zIndex: 1 }}>Participants</span>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.7, duration: 0.5 }}
            style={{ 
              position: 'absolute', 
              height: '8px', 
              background: `linear-gradient(to right, ${colors.blue}, ${colors.red})`,
              bottom: '-4px',
              left: 0,
              borderRadius: '4px',
              opacity: 0.6,
              zIndex: 0
            }}
          />
        </motion.h2>
        
        {!hasUsers ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            No participants found
          </motion.p>
        ) : (
          <>
            <motion.div 
              style={{ 
                display: 'grid', 
                gap: '1rem', 
                marginBottom: '2rem',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))'
              }}
            >
              {Object.values(users).map((user, index) => (
                <motion.div 
                  key={user.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ 
                    delay: 0.6 + (index * 0.1),
                    type: 'spring',
                    stiffness: 100
                  }}
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
                    transition: { duration: 0.2 }
                  }}
                  style={{
                    padding: '1.25rem',
                    background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)`,
                    borderRadius: '0.75rem',
                    border: `1px solid rgba(255,255,255,0.1)`,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    borderRadius: '50%', 
                    background: `linear-gradient(135deg, ${colors.blue} 0%, ${colors.red} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: colors.white
                  }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 style={{ 
                    marginBottom: '0.5rem', 
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: colors.white
                  }}>
                    {user.name}
                  </h3>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: colors.gold,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <span style={{ fontSize: '1rem' }}>⭐</span> 
                    Karma: {user.karmaScore}
                  </p>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              style={{ 
                marginTop: '3rem', 
                textAlign: 'center',
                padding: '2rem',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '1rem',
                boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              <motion.h2 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.9 }}
                style={{ 
                  fontSize: '1.75rem', 
                  marginBottom: '1.5rem',
                  color: colors.gold,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  fontWeight: 'bold'
                }}
              >
                <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>🎡</span>
                Spin the Wheel of Fate
              </motion.h2>
              
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(230, 190, 138, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFairMode(!fairMode)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: fairMode 
                    ? `linear-gradient(135deg, ${colors.blue} 0%, ${colors.lightBlue} 100%)` 
                    : `linear-gradient(135deg, ${colors.red} 0%, #FF7676 100%)`,
                  border: 'none',
                  borderRadius: '2rem',
                  color: 'white',
                  cursor: 'pointer',
                  marginBottom: '2rem',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s ease'
                }}
              >
                {fairMode ? '✨ Mode Équitable' : '⚖️ Mode Pondéré'}
              </motion.button>
              
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1, type: 'spring', stiffness: 100 }}
                style={{ 
                  marginTop: '1rem',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <WheelOfFate 
                  eventId={eventId} 
                  fairMode={fairMode}
                  onWinnerSelected={(userId) => {
                    // Instead of an alert, we could show a more stylish notification
                    // But for now, we'll keep it simple
                    alert(`${users[userId]?.name || 'Someone'} was selected!`);
                  }}
                />
              </motion.div>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
};

const HomePage: React.FC = () => {
  const { events } = useWheelStore();
  const navigate = useNavigate();
  
  // French-inspired color palette
  const colors = {
    blue: '#0055A4',  // French flag blue
    white: '#FFFFFF', // French flag white
    red: '#EF4135',   // French flag red
    gold: '#E6BE8A',  // Gold accent
    navy: '#001F3F',  // Dark navy background
    lightBlue: '#7FB3D5', // Light blue accent
  };
  
  return (
    <motion.div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${colors.navy} 0%, #0A1128 100%)`,
        color: 'white',
        padding: '2rem',
        fontFamily: '"Montserrat", sans-serif'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header with The Frenchies branding */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        marginBottom: '3rem',
        position: 'relative'
      }}>
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
          style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold',
            margin: 0,
            color: colors.white,
            textShadow: `2px 2px 4px ${colors.blue}`,
            letterSpacing: '1px'
          }}>
            <span style={{ color: colors.blue }}>The</span> 
            <span style={{ color: colors.white }}>Fren</span>
            <span style={{ color: colors.red }}>chies</span>
          </h1>
          <div style={{ 
            height: '6px', 
            width: '120px', 
            background: `linear-gradient(to right, ${colors.blue}, ${colors.white}, ${colors.red})`,
            margin: '0.75rem 0 1.5rem 0',
            borderRadius: '3px'
          }}></div>
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ 
              fontSize: '1.5rem', 
              color: colors.gold,
              fontWeight: 'normal',
              margin: 0
            }}
          >
            Wheel of Fate
          </motion.h2>
        </motion.div>
      </div>
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ 
          marginBottom: '2.5rem',
          textAlign: 'center'
        }}
      >
        <h1 style={{ 
          fontSize: '2.25rem', 
          marginBottom: '1rem',
          color: colors.white,
          fontWeight: 'bold'
        }}>
          Choose an Event
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          color: 'rgba(255, 255, 255, 0.7)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Select an event to spin the wheel and decide who brings what!
        </p>
      </motion.div>
      
      <div style={{ 
        display: 'grid', 
        gap: '1.5rem',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {events && Object.values(events).map((event: any, index) => event && (
          <motion.div
            key={event.id}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              delay: 0.6 + (index * 0.1),
              type: 'spring',
              stiffness: 100
            }}
            whileHover={{ 
              scale: 1.03, 
              boxShadow: `0 10px 25px rgba(0, 0, 0, 0.2), 0 0 15px rgba(${colors.red.replace('#', '').match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(', ')}, 0.3)`
            }}
            whileTap={{ scale: 0.98 }}
            style={{
              overflow: 'hidden',
              borderRadius: '1rem',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease'
            }}
          >
            <button
              onClick={() => {
                navigate(`/event/${event.id}`);
              }}
              style={{
                padding: '1.5rem',
                background: 'transparent',
                border: 'none',
                color: 'white',
                textAlign: 'left',
                cursor: 'pointer',
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}
            >
              {/* Decorative French flag stripe */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '8px',
                height: '100%',
                background: `linear-gradient(to bottom, ${colors.blue}, ${colors.white}, ${colors.red})`,
              }}></div>
              
              <div style={{ marginLeft: '20px' }}>
                <h2 style={{ 
                  fontSize: '1.5rem', 
                  marginBottom: '0.75rem',
                  fontWeight: 'bold',
                  color: colors.gold
                }}>
                  {event.title || 'Unnamed Event'}
                </h2>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  fontSize: '0.95rem', 
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                  <span style={{ marginRight: '0.5rem' }}>📅</span>
                  {event.date || 'No date specified'}
                </div>
                
                {event.location && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    fontSize: '0.95rem', 
                    color: 'rgba(255, 255, 255, 0.8)',
                    marginTop: '0.5rem'
                  }}>
                    <span style={{ marginRight: '0.5rem' }}>📍</span>
                    {event.location}
                  </div>
                )}
                
                <div style={{ 
                  marginTop: '1rem',
                  fontSize: '0.9rem',
                  color: colors.lightBlue
                }}>
                  {event.items && event.items.length ? `${event.items.length} items to bring` : 'No items yet'}
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      {Object.keys(events).length === 0 && (
        <div style={{ textAlign: 'center', color: '#9ca3af' }}>
          No events found. Create an event in PlanBuddies first.
        </div>
      )}
    </motion.div>
  );
};

const App: React.FC = () => {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/event/:eventId" element={<WheelPage />} />
      </Routes>
    </AnimatePresence>
  );
};

export default App;
