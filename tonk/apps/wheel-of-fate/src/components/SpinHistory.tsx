import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWheelStore } from '../stores/wheelStore';

interface SpinHistoryProps {
  eventId: string;
}

export const SpinHistory: React.FC<SpinHistoryProps> = ({ eventId }) => {
  const getSpinHistoryForEvent = useWheelStore(state => state.getSpinHistoryForEvent);
  const clearHistoryForEvent = useWheelStore(state => state.clearHistoryForEvent);
  
  const history = getSpinHistoryForEvent(eventId);

  if (!history.length) return null;

  return (
    <div className="mt-8 p-4 bg-gray-800 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">Spin History</h3>
        <motion.button
          className="px-3 py-1 text-sm text-red-400 hover:text-red-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => clearHistoryForEvent(eventId)}
        >
          Clear History
        </motion.button>
      </div>
      
      <div className="space-y-2">
        <AnimatePresence>
          {history.map((spin, index) => (
            <motion.div
              key={spin.timestamp}
              className="flex justify-between items-center p-2 bg-gray-700 rounded"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center space-x-2">
                <span className="text-white">{spin.winnerId}</span>
                {spin.wasInFairMode && (
                  <span className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                    Fair Mode
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-400">
                {new Date(spin.timestamp).toLocaleTimeString()}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
