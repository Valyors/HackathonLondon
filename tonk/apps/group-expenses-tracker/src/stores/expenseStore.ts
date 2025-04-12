import { create } from 'zustand';
import { sync } from '@tonk/keepsync';
import { User, Expense, Balance, Settlement, Group, Reaction, Comment } from '../types/expense';

// Helper function to get emoji for category
const getFunEmoji = (category: string): string => {
  const emojiMap: { [key: string]: string } = {
    'Food': '🍽️',
    'Transport': '🚗',
    'Entertainment': '🎉',
    'Shopping': '🛍️',
    'Utilities': '💡',
    'Rent': '🏠',
    'Other': '💰'
  };
  return emojiMap[category] || '💸';
};

const funLabels = [
  '🍟 Fry tax',
  '💸 RIP wallet',
  '🍻 Too many beers',
  '🍕 Pizza party',
  '🎮 Game night',
  '🚕 Taxi trauma',
  '🏠 Home sweet home',
  '🛒 Shopping spree',
  '☕️ Coffee addiction'
];

interface ExpenseStore {
  users: Record<string, User>;
  groups: Group[];
  expenses: Expense[];
  settlements: Settlement[];
  balances: { [userId: string]: Balance };
  
  // User Actions
  addUser: (name: string) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  updateKarmaScore: (userId: string) => void;
  updatePaymentStreak: (userId: string) => void;
  
  // Group Actions
  createGroup: (name: string, members: string[]) => void;
  addUserToGroup: (groupId: string, userId: string) => void;
  removeUserFromGroup: (groupId: string, userId: string) => void;
  
  // Expense Actions
  addExpense: (data: Omit<Expense, 'id' | 'reactions' | 'comments' | 'funLabel'>) => void;
  addReaction: (expenseId: string, userId: string, emoji: string) => void;
  addComment: (expenseId: string, userId: string, text: string) => void;
  
  // Settlement Actions
  addSettlement: (data: Omit<Settlement, 'id'>) => void;
  // Game methods
  gameState: {
    challenges: { [debtId: string]: {
      fromId: string,
      toId: string,
      amount: number,
      isBot: boolean,
      status: 'pending' | 'in_progress' | 'completed',
      player1Choice?: 'rock' | 'paper' | 'scissors',
      player2Choice?: 'rock' | 'paper' | 'scissors'
    }}
  };
  challengeToGame: (fromId: string, toId: string, amount: number, isBot?: boolean) => string | false;
  acceptChallenge: (debtId: string) => void;
  makeGameChoice: (debtId: string, playerId: string, choice: 'rock' | 'paper' | 'scissors') => void;
  resolveGame: (debtId: string) => void;
  
  // Calculation Actions
  checkOverdueDebts: () => void;
  calculateBalances: () => void;
  getGroupExpenses: (groupId: string) => Expense[];
  getGroupBalance: (groupId: string) => { [userId: string]: Balance };
  generateExpenseSummary: (groupId: string) => string;
}

export const useExpenseStore = create<ExpenseStore>(
  sync(
    (set, get) => ({
      users: {},
      groups: [],
      expenses: [],
      settlements: [],
      balances: {},

  addUser: (name) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      karmaScore: 100,
      paymentStreak: 0,
      avatar: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${name}` // Using DiceBear for fun avatars
    };

    set((state) => ({
      users: { ...state.users, [newUser.id]: newUser },
      balances: {
        ...state.balances,
        [newUser.id]: { userId: newUser.id, owes: {}, isOwed: {} }
      }
    }));
  },

  updateUser: (userId, updates) => {
    set((state) => ({
      users: {
        ...state.users,
        [userId]: { ...state.users[userId], ...updates }
      }
    }));
  },

  updateKarmaScore: (userId) => {
    set((state) => {
      const user = state.users[userId];
      if (!user) return state;
      return {
        users: {
          ...state.users,
          [userId]: { ...user, karmaScore: Math.min(user.karmaScore + 5, 100) }
        }
      };
    });
  },

  updatePaymentStreak: (userId) => {
    const now = new Date();
    set((state) => {
      const user = state.users[userId];
      if (!user) return state;

      // Check if streak should be reset (7 days without payment)
      const lastPayment = user.lastPaymentDate ? new Date(user.lastPaymentDate) : null;
      const daysSinceLastPayment = lastPayment
        ? Math.floor((now.getTime() - lastPayment.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      const shouldResetStreak = daysSinceLastPayment >= 7;
      
      return {
        users: {
          ...state.users,
          [userId]: {
            ...user,
            lastPaymentDate: now.toISOString(),
            paymentStreak: shouldResetStreak ? 1 : user.paymentStreak + 1,
            karmaScore: shouldResetStreak
              ? Math.max(user.karmaScore - 10, 0) // Lose karma when streak resets
              : user.karmaScore
          }
        }
      };
    });
  },

  createGroup: (name, members) => {
    const newGroup: Group = {
      id: Date.now().toString(),
      name,
      members,
      createdBy: get().users[0]?.id, // Assuming first user is current user
      createdAt: new Date().toISOString()
    };

    set((state) => ({ groups: [...state.groups, newGroup] }));
  },

  addUserToGroup: (groupId, userId) => {
    set((state) => ({
      groups: state.groups.map(group =>
        group.id === groupId
          ? { ...group, members: [...group.members, userId] }
          : group
      )
    }));
  },

  removeUserFromGroup: (groupId, userId) => {
    set((state) => ({
      groups: state.groups.map(group =>
        group.id === groupId
          ? { ...group, members: group.members.filter(id => id !== userId) }
          : group
      )
    }));
  },

  addExpense: (data) => {
    const newExpense: Expense = {
      ...data,
      id: Date.now().toString(),
      reactions: [],
      comments: [],
      funLabel: funLabels[Math.floor(Math.random() * funLabels.length)]
    };

    set((state) => ({ expenses: [...state.expenses, newExpense] }));
    get().calculateBalances();
    get().updatePaymentStreak(data.paidBy);
  },

  addReaction: (expenseId, userId, emoji) => {
    const reaction: Reaction = {
      userId,
      emoji,
      timestamp: new Date().toISOString()
    };

    set((state) => ({
      expenses: state.expenses.map(expense =>
        expense.id === expenseId
          ? { ...expense, reactions: [...expense.reactions, reaction] }
          : expense
      )
    }));
  },

  addComment: (expenseId, userId, text) => {
    const comment: Comment = {
      id: Date.now().toString(),
      userId,
      text,
      timestamp: new Date().toISOString()
    };

    set((state) => ({
      expenses: state.expenses.map(expense =>
        expense.id === expenseId
          ? { ...expense, comments: [...expense.comments, comment] }
          : expense
      )
    }));
  },

  addSettlement: (data) => {
    const settlement: Settlement = {
      ...data,
      id: Date.now().toString()
    };

    set((state) => ({ settlements: [...state.settlements, settlement] }));
    get().calculateBalances();
    get().updateKarmaScore(data.from);
  },

  // Game state
  gameState: {
    challenges: {} as { [debtId: string]: { 
      fromId: string,
      isBot: boolean,
      toId: string, 
      amount: number,
      status: 'pending' | 'in_progress' | 'completed',
      player1Choice?: 'rock' | 'paper' | 'scissors',
      player2Choice?: 'rock' | 'paper' | 'scissors'
    }},
  },

  challengeToGame: (fromId: string, toId: string, amount: number, isBot = true) => {
    if (amount > 5) return false; // Only for small debts
    
    const debtId = `${fromId}-${toId}-${Date.now()}`;
    set((state) => ({
      gameState: {
        ...state.gameState,
        challenges: {
          ...state.gameState.challenges,
          [debtId]: {
            fromId,
            toId,
            amount,
            isBot,
            status: isBot ? 'in_progress' : 'pending' // Bot games start immediately
          }
        }
      }
    }));
    return debtId;
  },

  acceptChallenge: (debtId: string) => {
    set((state) => ({
      gameState: {
        ...state.gameState,
        challenges: {
          ...state.gameState.challenges,
          [debtId]: {
            ...state.gameState.challenges[debtId],
            status: 'in_progress'
          }
        }
      }
    }));
  },

  makeGameChoice: (debtId: string, playerId: string, choice: 'rock' | 'paper' | 'scissors') => {
    const { gameState } = get();
    const challenge = gameState.challenges[debtId];
    if (!challenge || challenge.status !== 'in_progress') return;

    const isPlayer1 = playerId === challenge.fromId;
    
    // For bot games, automatically make the bot's choice
    if (challenge.isBot && isPlayer1) {
      const botChoice = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)] as 'rock' | 'paper' | 'scissors';
      set((state) => ({
        gameState: {
          ...state.gameState,
          challenges: {
            ...state.gameState.challenges,
            [debtId]: {
              ...challenge,
              player1Choice: choice,
              player2Choice: botChoice,
              status: 'completed'
            }
          }
        }
      }));
      get().resolveGame(debtId);
      return;
    }

    // Normal multiplayer logic
    set((state) => ({
      gameState: {
        ...state.gameState,
        challenges: {
          ...state.gameState.challenges,
          [debtId]: {
            ...challenge,
            player1Choice: isPlayer1 ? choice : challenge.player1Choice,
            player2Choice: !isPlayer1 ? choice : challenge.player2Choice
          }
        }
      }
    }));

    // Check if both players have made their choices
    const updatedChallenge = get().gameState.challenges[debtId];
    if (updatedChallenge.player1Choice && updatedChallenge.player2Choice) {
      get().resolveGame(debtId);
    }
  },

  resolveGame: (debtId: string) => {
    const challenge = get().gameState.challenges[debtId];
    if (!challenge || !challenge.player1Choice || !challenge.player2Choice) return;

    const getWinner = (c1: string, c2: string) => {
      if (c1 === c2) return null;
      if (
        (c1 === 'rock' && c2 === 'scissors') ||
        (c1 === 'paper' && c2 === 'rock') ||
        (c1 === 'scissors' && c2 === 'paper')
      ) return challenge.fromId;
      return challenge.toId;
    };

    const winner = getWinner(challenge.player1Choice, challenge.player2Choice);
    if (!winner) {
      // Draw - reset choices to play again
      set((state) => ({
        gameState: {
          ...state.gameState,
          challenges: {
            ...state.gameState.challenges,
            [debtId]: {
              ...challenge,
              player1Choice: undefined,
              player2Choice: undefined
            }
          }
        }
      }));
      return;
    }

    // Game completed - update balances based on result
    const { fromId, toId, amount } = challenge;
    const store = get();
    
    // If player1 (fromId) wins, cancel the debt
    if (winner === fromId) {
      store.addSettlement({
        from: fromId,
        to: toId,
        amount: amount,
        date: new Date().toISOString(),
        method: 'game',
        gameResult: {
          winner: fromId,
          action: 'cancel',
          player1Choice: challenge.player1Choice,
          player2Choice: challenge.player2Choice
        }
      });
    } 
    // If player2 (toId/bot) wins, double the debt
    else {
      store.addSettlement({
        from: fromId,
        to: toId,
        amount: amount, // Add positive settlement equal to original amount to double the debt
        date: new Date().toISOString(),
        method: 'game',
        gameResult: {
          winner: toId,
          action: 'double',
          player1Choice: challenge.player1Choice,
          player2Choice: challenge.player2Choice
        }
      });
    }

    // Update game state to completed
    const settlement: Settlement = {
      id: Date.now().toString(),
      from: challenge.fromId,
      to: challenge.toId,
      amount: winner === challenge.fromId ? 0 : challenge.amount * 2, // Cancel or double the debt
      date: new Date().toISOString(),
      method: 'game',
      gameResult: {
        winner,
        action: winner === challenge.fromId ? 'cancel' : 'double',
        player1Choice: challenge.player1Choice,
        player2Choice: challenge.player2Choice
      }
    };

    set((state) => ({ 
      settlements: [...state.settlements, settlement],
      gameState: {
        ...state.gameState,
        challenges: {
          ...state.gameState.challenges,
          [debtId]: {
            ...challenge,
            status: 'completed'
          }
        }
      }
    }));
    get().calculateBalances();
  },

  checkOverdueDebts: () => {
    const { users, expenses } = get();
    const now = new Date();
    
    // Track oldest unpaid debt for each user
    const oldestDebts: { [userId: string]: Date } = {};
    
    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);
      expense.participants.forEach((participantId) => {
        if (participantId !== expense.paidBy) {
          if (!oldestDebts[participantId] || expenseDate < oldestDebts[participantId]) {
            oldestDebts[participantId] = expenseDate;
          }
        }
      });
    });
    
    // Check each user's oldest debt
    Object.values(users).forEach((user) => {
      const oldestDebt = oldestDebts[user.id];
      if (oldestDebt) {
        const daysSinceDebt = Math.floor((now.getTime() - oldestDebt.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceDebt >= 7) {
          // Reduce karma by 5 points for each week overdue, minimum 0
          const karmaLoss = Math.floor(daysSinceDebt / 7) * 5;
          set((state) => ({
            users: {
              ...state.users,
              [user.id]: { ...state.users[user.id], karmaScore: Math.max(0, user.karmaScore - karmaLoss) }
            }
          }));
        }
      }
    });
  },

  calculateBalances: () => {
    const { users, expenses, settlements } = get();
    const balances: { [userId: string]: Balance } = {};

    // Initialize balances
    users.forEach((user) => {
      balances[user.id] = { userId: user.id, owes: {}, isOwed: {} };
    });

    // Calculate from expenses
    expenses.forEach((expense) => {
      const perPersonAmount = expense.amount / expense.participants.length;
      
      expense.participants.forEach((participantId) => {
        if (participantId !== expense.paidBy) {
          // Participant owes to payer
          balances[participantId].owes[expense.paidBy] = 
            (balances[participantId].owes[expense.paidBy] || 0) + perPersonAmount;
          
          // Payer is owed by participant
          balances[expense.paidBy].isOwed[participantId] = 
            (balances[expense.paidBy].isOwed[participantId] || 0) + perPersonAmount;
        }
      });
    });

    // Apply settlements
    settlements.forEach((settlement) => {
      balances[settlement.from].owes[settlement.to] = 
        (balances[settlement.from].owes[settlement.to] || 0) - settlement.amount;
      
      balances[settlement.to].isOwed[settlement.from] = 
        (balances[settlement.to].isOwed[settlement.from] || 0) - settlement.amount;
    });

    set({ balances });
    
    // Check for overdue debts after calculating balances
    get().checkOverdueDebts();
  },

  getGroupExpenses: (groupId) => {
    return get().expenses.filter(expense => expense.groupId === groupId);
  },

  getGroupBalance: (groupId) => {
    const groupExpenses = get().getGroupExpenses(groupId);
    const balances: { [userId: string]: Balance } = {};
    const { users, settlements } = get();

    // Initialize balances for group members
    users.forEach((user) => {
      balances[user.id] = { userId: user.id, owes: {}, isOwed: {} };
    });

    // Calculate from group expenses
    groupExpenses.forEach((expense) => {
      const perPersonAmount = expense.amount / expense.participants.length;
      
      expense.participants.forEach((participantId) => {
        if (participantId !== expense.paidBy) {
          balances[participantId].owes[expense.paidBy] = 
            (balances[participantId].owes[expense.paidBy] || 0) + perPersonAmount;
          
          balances[expense.paidBy].isOwed[participantId] = 
            (balances[expense.paidBy].isOwed[participantId] || 0) + perPersonAmount;
        }
      });
    });

    // Apply relevant settlements
    settlements
      .filter(s => groupExpenses.some(e => 
        e.participants.includes(s.from) && e.participants.includes(s.to)
      ))
      .forEach((settlement) => {
        balances[settlement.from].owes[settlement.to] = 
          (balances[settlement.from].owes[settlement.to] || 0) - settlement.amount;
        
        balances[settlement.to].isOwed[settlement.from] = 
          (balances[settlement.to].isOwed[settlement.from] || 0) - settlement.amount;
      });

    return balances;
  },

  generateExpenseSummary: (groupId) => {
    const expenses = get().getGroupExpenses(groupId);
    if (expenses.length === 0) return 'No expenses yet!';

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const categories = expenses.reduce((acc, e) => {
      const cat = e.category || 'Other';
      acc[cat] = (acc[cat] || 0) + e.amount;
      return acc;
    }, {} as { [key: string]: number });

    const topCategory = Object.entries(categories)
      .sort(([,a], [,b]) => b - a)[0];

    const percentage = Math.round((topCategory[1] / total) * 100);

    return `You spent ${percentage}% of the budget on ${topCategory[0]} ${getFunEmoji(topCategory[0])}!`;
  }
    }),
    {
      docId: "planbuddies-test",
      initTimeout: 30000,
      onInitError: (error) =>
        console.error("Expense sync initialization error:", error),
    }
  )
);
