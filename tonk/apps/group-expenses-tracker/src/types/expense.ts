export interface User {
  id: string;
  name: string;
  avatar?: string;
  karmaScore: number;
  lastPaymentDate?: string;
  paymentStreak: number;
}

export interface Group {
  id: string;
  name: string;
  members: string[]; // user ids
  createdBy: string; // user id
  createdAt: string;
}

export interface Reaction {
  userId: string;
  emoji: string;
  timestamp: string;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string; // user id
  participants: string[]; // user ids
  date: string;
  groupId: string;
  category?: string;
  funLabel?: string;
  reactions: Reaction[];
  comments: Comment[];
}

export interface Balance {
  userId: string;
  owes: { [userId: string]: number };
  isOwed: { [userId: string]: number };
}

export interface Settlement {
  id: string;
  from: string;
  to: string;
  amount: number;
  date: string;
  method: 'normal' | 'game';
  gameResult?: {
    winner: string;
    action: 'cancel' | 'double';
    player1Choice?: 'rock' | 'paper' | 'scissors';
    player2Choice?: 'rock' | 'paper' | 'scissors';
  };
}
