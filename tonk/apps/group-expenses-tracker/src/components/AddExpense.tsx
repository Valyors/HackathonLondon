import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenseStore } from '../stores/expenseStore';

const AddExpense: React.FC = () => {
  const navigate = useNavigate();
  const { users, addExpense } = useExpenseStore();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || !amount || !paidBy || participants.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    addExpense({
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount),
      paidBy,
      participants,
      date: new Date().toISOString()
    });

    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-gray-800">🧾 Add New Expense</h2>
        <button
          onClick={() => navigate('/')}
          className="btn-secondary"
        >
          ← Back
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card bg-white">
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-2">
                📝 Description
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2 block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-700 focus:border-primary-400 focus:ring-primary-400 transition-colors"
                  placeholder="What's this expense for?"
                  required
                />
              </label>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-800 mb-2">
                💰 Amount
                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full rounded-xl border-2 border-gray-200 pl-10 pr-4 py-3 text-gray-700 focus:border-primary-400 focus:ring-primary-400 transition-colors"
                    placeholder="0.00"
                    required
                  />
                </div>
              </label>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-800 mb-2">
                👤 Paid By
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="mt-2 block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-700 focus:border-primary-400 focus:ring-primary-400 transition-colors"
                  required
                >
                  <option value="">Select who paid</option>
                  {Object.values(users).map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-800 mb-4">
                👥 Split With
              </label>
              <div className="grid grid-cols-2 gap-4">
                {Object.values(users).map((user) => (
                  <label
                    key={user.id}
                    className={`flex items-center p-4 rounded-xl border-2 transition-colors cursor-pointer
                      ${participants.includes(user.id)
                        ? 'border-primary-400 bg-primary-50 text-primary-900'
                        : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <input
                      type="checkbox"
                      checked={participants.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setParticipants([...participants, user.id]);
                        } else {
                          setParticipants(participants.filter(id => id !== user.id));
                        }
                      }}
                      className="sr-only"
                  />
                  <div className="ml-3">
                    <span className="font-medium">{user.name}</span>
                  </div>
                </label>
              ))}
            </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            className="btn-primary text-lg px-8 py-3"
          >
            💾 Save Expense
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddExpense;
