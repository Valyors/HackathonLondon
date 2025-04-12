import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenseStore } from '../stores/expenseStore';
import { DebtGame } from './DebtGame';

const BalanceSummary: React.FC = () => {
  const navigate = useNavigate();
  const { users, balances, addSettlement } = useExpenseStore();

  const getUserName = (userId: string) => {
    return users[userId]?.name || 'Unknown';
  };

  const handleSettle = (fromId: string, toId: string, amount: number) => {
    addSettlement({
      from: fromId,
      to: toId,
      amount,
      date: new Date().toISOString(),
      method: 'normal'
    });
  };

  const getTotalBalances = (userId: string) => {
    const balance = balances[userId];
    if (!balance) return { totalOwed: 0, totalOwes: 0 };

    const totalOwes = Object.values(balance.owes).reduce((sum, amount) => sum + amount, 0);
    const totalOwed = Object.values(balance.isOwed).reduce((sum, amount) => sum + amount, 0);

    return { totalOwed, totalOwes };
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-gray-800">💳 Balance Summary</h2>
        <button
          onClick={() => navigate('/')}
          className="btn-secondary"
        >
          ← Back
        </button>
      </div>

      <div className="grid gap-6">
        {Object.values(users).map((user) => {
          const balance = balances[user.id];
          if (!balance) return null;

          const owes = Object.entries(balance.owes);
          const isOwed = Object.entries(balance.isOwed);
          const { totalOwed, totalOwes } = getTotalBalances(user.id);

          return (
            <div key={user.id} className="card bg-white overflow-hidden">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-2xl">
                      {user.name.charAt(0)}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Owed</p>
                      <p className="text-lg font-bold text-green-600">+${totalOwed.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Owes</p>
                      <p className="text-lg font-bold text-red-600">-${totalOwes.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {(owes.length > 0 || isOwed.length > 0) && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {owes.length > 0 && (
                      <div>
                        <h4 className="text-lg font-medium text-gray-800 mb-4">💸 Owes</h4>
                        <ul className="space-y-3">
                          {owes.map(([userId, amount]) => (
                            <li key={userId} className="flex items-center justify-between p-3 rounded-xl border-2 border-gray-100 hover:border-gray-200 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center text-white font-medium">
                                  {getUserName(userId).charAt(0)}
                                </div>
                                <span className="font-medium text-gray-700">{getUserName(userId)}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-red-600 font-bold">
                                  -${amount.toFixed(2)}
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleSettle(user.id, userId, amount)}
                                    className="btn-success text-sm"
                                  >
                                    ✔️ Settle
                                  </button>
                                  <DebtGame
                                    fromId={user.id}
                                    toId={userId}
                                    amount={amount}
                                  />
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {isOwed.length > 0 && (
                      <div>
                        <h4 className="text-lg font-medium text-gray-800 mb-4">💰 Is Owed</h4>
                        <ul className="space-y-3">
                          {isOwed.map(([userId, amount]) => (
                            <li key={userId} className="flex items-center justify-between p-3 rounded-xl border-2 border-gray-100">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center text-white font-medium">
                                  {getUserName(userId).charAt(0)}
                                </div>
                                <span className="font-medium text-gray-700">{getUserName(userId)}</span>
                              </div>
                              <span className="text-green-600 font-bold">
                                +${amount.toFixed(2)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {owes.length === 0 && isOwed.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">🎉 No outstanding balances!</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BalanceSummary;
