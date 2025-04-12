import React, { useState } from "react";
import { Route, Routes, Link, useLocation } from "react-router-dom";
import ExpenseList from "./components/ExpenseList";
import AddExpense from "./components/AddExpense";
import BalanceSummary from "./components/BalanceSummary";
import UserManagement from "./components/UserManagement";
import { useExpenseStore } from "./stores/expenseStore";
import "./styles/globals.css";

export const App: React.FC = () => {
  const location = useLocation();

  const { balances, users } = useExpenseStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const getTotalOwed = () => {
    const userId = users[0]?.id; // For demo, using first user
    if (!userId || !balances[userId]) return 0;
    return Object.values(balances[userId].owes).reduce((sum, amount) => sum + amount, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-soft sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                  💰 Splitwise Fun
                </h1>
              </div>
              <div className="hidden md:flex ml-10 space-x-4">
                <Link
                  to="/"
                  className={`btn ${isActive('/') ? 'bg-primary-500 text-white' : 'text-gray-700 hover:text-primary-600'}`}
                >
                  📊 Dashboard
                </Link>
                <Link
                  to="/users"
                  className={`btn ${isActive('/users') ? 'bg-accent-500 text-white' : 'text-gray-700 hover:text-accent-600'}`}
                >
                  👥 Friends
                </Link>
                <Link
                  to="/balances"
                  className={`btn ${isActive('/balances') ? 'bg-secondary-500 text-white' : 'text-gray-700 hover:text-secondary-600'}`}
                >
                  💸 Balances
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <div className="text-sm">
                  <span className="text-gray-500">Total owed: </span>
                  <span className="font-semibold text-primary-600">${getTotalOwed().toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden btn"
              >
                ☰
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} animate-slide-in`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`btn block ${isActive('/') ? 'bg-primary-500 text-white' : 'text-gray-700'}`}
            >
              📊 Dashboard
            </Link>
            <Link
              to="/users"
              className={`btn block ${isActive('/users') ? 'bg-accent-500 text-white' : 'text-gray-700'}`}
            >
              👥 Friends
            </Link>
            <Link
              to="/balances"
              className={`btn block ${isActive('/balances') ? 'bg-secondary-500 text-white' : 'text-gray-700'}`}
            >
              💸 Balances
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Routes>
            <Route path="/" element={<ExpenseList />} />
            <Route path="/add" element={<AddExpense />} />
            <Route path="/balances" element={<BalanceSummary />} />
            <Route path="/users" element={<UserManagement />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;
