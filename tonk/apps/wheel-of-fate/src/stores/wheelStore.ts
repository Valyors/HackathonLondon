import { create } from 'zustand';
import { sync } from '@tonk/keepsync';

// Shared User interface with group-expenses-tracker and planbuddies
export interface User {
  id: string;
  name: string;
  avatar?: string;
  karmaScore: number;
  lastPaymentDate?: string;
  paymentStreak: number;
  createdAt: number;
}

interface Balance {
  userId: string;
  owes: Record<string, number>;
  isOwed: Record<string, number>;
}

interface SpinHistory {
  eventId: string;
  winnerId: string;
  timestamp: number;
  wasInFairMode: boolean;
  winnerKarmaBonus?: number;
  itemId: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  createdBy: string;
  createdAt: number;
  items: Array<{ id: string; name: string }>;
}

interface WheelStore {
  // State
  users: Record<string, User>;
  events: Record<string, Event>;
  spinHistory: SpinHistory[];
  balances: Record<string, Balance>;

  // User actions
  addUser: (name: string) => string;
  updateUser: (userId: string, updates: Partial<User>) => void;
  removeUser: (id: string) => void;

  // Spin history actions
  addSpinToHistory: (spin: Omit<SpinHistory, 'timestamp'>) => void;
  getSpinHistoryForEvent: (eventId: string) => SpinHistory[];
  clearHistoryForEvent: (eventId: string) => void;
}

// Generate a random ID (shared with eventStore)
const generateId = () => Math.random().toString(36).substring(2, 15);

export const useWheelStore = create<WheelStore>(
  sync(
    (set, get) => ({
      // State
      users: {},
      events: {},
      spinHistory: [],
      balances: {},

      // User actions
      addUser: (name) => {
        const id = generateId();
        set((state) => ({
          users: {
            ...state.users,
            [id]: {
              id,
              name,
              karmaScore: 0,
              paymentStreak: 0,
              createdAt: Date.now()
            }
          }
        }));
        return id;
      },

      updateUser: (userId, updates) => {
        set((state) => ({
          users: {
            ...state.users,
            [userId]: {
              ...state.users[userId],
              ...updates
            }
          }
        }));
      },

      removeUser: (id) => {
        set((state) => {
          const { [id]: removed, ...remainingUsers } = state.users;
          return { users: remainingUsers };
        });
      },

      // Spin history actions
      addSpinToHistory: (spin) => {
        const winner = get().users[spin.winnerId];
        if (winner) {
          // Add karma bonus for winning
          const karmaBonus = spin.wasInFairMode ? 2 : 1;
          get().updateUser(winner.id, {
            karmaScore: winner.karmaScore + karmaBonus
          });

          set((state) => ({
            spinHistory: [
              ...state.spinHistory,
              { ...spin, timestamp: Date.now(), winnerKarmaBonus: karmaBonus }
            ]
          }));
        }
      },

      getSpinHistoryForEvent: (eventId) => {
        return get().spinHistory.filter(spin => spin.eventId === eventId);
      },

      clearHistoryForEvent: (eventId) => {
        set((state) => ({
          spinHistory: state.spinHistory.filter(spin => spin.eventId !== eventId)
        }));
      }
    }),
    {
      docId: "testn1",
      initTimeout: 30000,
      onInitError: (error) =>
        console.error("Wheel sync initialization error:", error),
    }
  )
);
