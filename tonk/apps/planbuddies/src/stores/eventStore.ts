import { create } from "zustand";
import { sync } from "@tonk/keepsync";

// Shared User interface with group-expenses-tracker
export interface User {
  id: string;
  name: string;
  avatar?: string;
  karmaScore: number;
  lastPaymentDate?: string;
  paymentStreak: number;
  createdAt: number;
}

export interface EventResponse {
  userId: string;
  response: "going" | "not going";
  respondedAt: number;
}

export interface EventItem {
  id: string;
  name: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  createdBy: string;
  createdAt: number;
  items: EventItem[];
  responses: EventResponse[];
}

export interface EventState {
  users: Record<string, User>;
  events: Record<string, Event>;
  
  // Actions
  addUser: (name: string) => string;
  removeUser: (id: string) => void;
  createEvent: (title: string, description: string, location: string, date: string, items: string[], createdBy: string) => void;
  respondToEvent: (eventId: string, userId: string, response: "going" | "not going") => void;
  removeEvent: (id: string) => void;
}

// Generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15);

export const useEventStore = create<EventState>(
  sync(
    (set) => ({
      // State
      users: {},
      events: {},

      // Actions
      addUser: (name) => {
        const id = generateId();
        
        set((state) => ({
          users: {
            ...state.users,
            [id]: {
              id,
              name,
              avatar: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${name}`,
              karmaScore: 100,
              paymentStreak: 0,
              createdAt: Date.now(),
            },
          },
        }));
        
        return id;
      },

      removeUser: (id) => {
        set((state) => {
          const newUsers = { ...state.users };
          delete newUsers[id];
          return { users: newUsers };
        });
      },

      createEvent: (title, description, location, date, items, createdBy) => {
        set((state) => {
          const id = generateId();
          
          const eventItems: EventItem[] = items.map(item => ({
            id: generateId(),
            name: item
          }));
          
          const event: Event = {
            id,
            title,
            description,
            location,
            date,
            createdBy,
            createdAt: Date.now(),
            items: eventItems,
            responses: [],
          };

          return {
            events: {
              ...state.events,
              [id]: event,
            },
          };
        });
      },

      respondToEvent: (eventId, userId, response) => {
        set((state) => {
          if (!state.events[eventId]) return state;
          
          const event = state.events[eventId];
          
          // Remove any existing response from this user
          const filteredResponses = event.responses.filter(
            (r) => r.userId !== userId
          );
          
          // Add the new response
          const newResponse: EventResponse = {
            userId,
            response,
            respondedAt: Date.now(),
          };
          
          const responses = [...filteredResponses, newResponse];
          
          return {
            events: {
              ...state.events,
              [eventId]: {
                ...event,
                responses,
              },
            },
          };
        });
      },

      removeEvent: (id) => {
        set((state) => {
          const newEvents = { ...state.events };
          delete newEvents[id];
          return { events: newEvents };
        });
      },
    }),
    {
      docId: "planbuddies-test",
      initTimeout: 30000,
      onInitError: (error) =>
        console.error("Event sync initialization error:", error),
    },
  ),
);