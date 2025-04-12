import React, { useState } from "react";
import { useEventStore } from "../stores/eventStore";

const UserAdd: React.FC = () => {
  const [userName, setUserName] = useState("");
  const { addUser } = useEventStore();

  const handleAddUser = () => {
    if (userName.trim()) {
      addUser(userName.trim());
      setUserName("");
    }
  };

  return (
    <div className="flex items-center gap-2 mb-6">
      <input
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="Enter user name"
        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleAddUser}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
      >
        <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add
      </button>
    </div>
  );
};

export default UserAdd;