import React, { useState } from 'react';
import { useExpenseStore } from '../stores/expenseStore';

const UserManagement: React.FC = () => {
  const { users, addUser, createGroup } = useExpenseStore();
  const [newUserName, setNewUserName] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserName.trim()) {
      addUser(newUserName.trim());
      setNewUserName('');
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim() && selectedUsers.length > 0) {
      createGroup(newGroupName.trim(), selectedUsers);
      setNewGroupName('');
      setSelectedUsers([]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Add User Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add New User</h3>
        <form onSubmit={handleAddUser} className="flex gap-4">
          <input
            type="text"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            placeholder="Enter user name"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add User
          </button>
        </form>
      </div>

      {/* User List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Users</h3>
        <div className="space-y-4">
          {Object.values(users).map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      {user.name[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">
                    {user.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Karma: {user.karmaScore} | Streak: {user.paymentStreak}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Group Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Group</h3>
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Members
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.values(users).map((user) => (
                <label
                  key={user.id}
                  className={`flex items-center p-2 rounded-md cursor-pointer ${
                    selectedUsers.includes(user.id)
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200'
                  } border`}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers([...selectedUsers, user.id]);
                      } else {
                        setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span>{user.name}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!newGroupName.trim() || selectedUsers.length === 0}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            Create Group
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserManagement;
