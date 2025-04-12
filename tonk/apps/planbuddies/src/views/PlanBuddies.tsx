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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">PlanBuddies</h1>
          
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
                    className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center"
                  >
                    <span className="font-medium">{user.name}</span>
                    <button
                      onClick={() => handleCreateEvent(user.id)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Create Event
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Events Section */}
          {selectedUserId && (
            <div>
              <EventList currentUserId={selectedUserId} />
            </div>
          )}
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