import React, { useState } from "react";
import { useEventStore } from "../stores/eventStore";
import UserAdd from "../components/UserAdd";
import EventCreate from "../components/EventCreate";
import EventList from "../components/EventList";

const PlanBuddies: React.FC = () => {
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { users } = useEventStore();

  const handleCreateEvent = (userId: string) => {
    setSelectedUserId(userId);
    setShowCreateEvent(true);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <section className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 relative">
          {/* French flag decoration at the top */}
          <div className="absolute top-0 left-0 right-0 flex h-3">
            <div className="flex-1 bg-blue-700"></div>
            <div className="flex-1 bg-white"></div>
            <div className="flex-1 bg-red-600"></div>
          </div>
          
          <div className="mt-4 mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">The Frenchies</h1>
            <div className="flex justify-center mt-2">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Flag_of_France.svg/320px-Flag_of_France.svg.png" 
                alt="French Flag" 
                className="h-8 mx-1"
              />
            </div>
          </div>
          
          {/* Add User Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add User</h2>
            <UserAdd />
          </div>
          
          {/* User List Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Users</h2>
            {Object.values(users).length === 0 ? (
              <p className="text-gray-500">No users yet. Add one above!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.values(users).map((user) => (
                  <div 
                    key={user.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition-shadow"
                  >
                    <span className="font-medium">{user.name}</span>
                    <button
                      onClick={() => handleCreateEvent(user.id)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Event
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Events Section */}
          <div className="mb-8">
            <EventList currentUserId={selectedUserId || Object.keys(users)[0] || ""} />
          </div>
        </div>
      </section>
      
      {/* Event Creation Modal */}
      {showCreateEvent && selectedUserId && (
        <EventCreate 
          userId={selectedUserId} 
          onClose={() => setShowCreateEvent(false)} 
        />
      )}
    </main>
  );
};

export default PlanBuddies;