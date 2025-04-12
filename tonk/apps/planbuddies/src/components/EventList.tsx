import React, { useState, useEffect } from "react";
import { useEventStore, Event } from "../stores/eventStore";

interface EventListProps {
  currentUserId: string;
}

const EventList: React.FC<EventListProps> = ({ currentUserId }) => {
  const { events, users, respondToEvent } = useEventStore();
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUserId);

  // This useEffect should only run on initial mount and when users change
  // It should not reset selectedUserId when the user manually changes it
  useEffect(() => {
    // Only set the selectedUserId from currentUserId on initial render
    // or when there are no users yet
    if (Object.keys(users).length > 0 && !selectedUserId) {
      // If no user is selected but users exist, select the first one
      setSelectedUserId(Object.keys(users)[0]);
    } else if (currentUserId && selectedUserId === "") {
      // Only update if we don't have a selection yet
      setSelectedUserId(currentUserId);
    }
  }, [currentUserId, users]);

  const handleResponse = (eventId: string, response: "going" | "not going") => {
    if (selectedUserId) {
      respondToEvent(eventId, selectedUserId, response);
    }
  };

  const getResponseCount = (event: Event, response: "going" | "not going") => {
    return event.responses.filter(r => r.response === response).length;
  };

  const getResponseUsers = (event: Event, response: "going" | "not going") => {
    return event.responses
      .filter(r => r.response === response)
      .map(r => users[r.userId]?.name || "Unknown")
      .join(", ");
  };

  const getUserResponse = (event: Event, userId: string = selectedUserId) => {
    if (!userId) return undefined;
    const userResponse = event.responses.find(r => r.userId === userId);
    return userResponse?.response;
  };

  const getCreatorName = (event: Event) => {
    const creator = users[event.createdBy];
    return creator ? creator.name : "Unknown";
  };

  if (Object.keys(users).length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Events</h2>
        <p className="text-gray-500">Add a user first to view and respond to events.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Events</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Respond as:</label>
        <select 
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {Object.values(users).map(user => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
      </div>
      
      {Object.values(events).length === 0 ? (
        <p className="text-gray-500">No events yet. Create one!</p>
      ) : (
        <div className="space-y-6">
          {Object.values(events).map((event) => (
            <div 
              key={event.id} 
              className="bg-white rounded-lg shadow-md p-5 border border-gray-200 transition-all duration-300 hover:shadow-lg relative overflow-hidden"
            >
              {/* French flag decoration */}
              <div className="absolute top-0 left-0 bottom-0 w-1 flex flex-col">
                <div className="flex-1 bg-blue-700"></div>
                <div className="flex-1 bg-white"></div>
                <div className="flex-1 bg-red-600"></div>
              </div>
              
              <div className="ml-3">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">{event.title}</h3>
                  
                  {event.description && (
                    <p className="mt-2 text-gray-600">{event.description}</p>
                  )}
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-sm">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {event.date}
                    </div>
                    
                    {event.location && (
                      <div className="inline-flex items-center px-3 py-1 bg-green-50 text-green-800 rounded-full text-sm">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-2">
                    Created by {getCreatorName(event)}
                  </p>
                </div>
                
                {event.items && event.items.length > 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 rounded-md border border-yellow-100">
                    <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Items to bring:
                    </h4>
                    <ul className="list-disc pl-5 text-yellow-700 space-y-1">
                      {event.items.map(item => (
                        <li key={item.id}>{item.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex flex-col space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md space-y-3">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-800 rounded-full mr-2">
                        {getResponseCount(event, "going")}
                      </div>
                      <div>
                        <span className="text-gray-700 font-medium">Attending</span>
                        {getResponseCount(event, "going") > 0 && (
                          <p className="text-sm text-gray-600 mt-1">{getResponseUsers(event, "going")}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-800 rounded-full mr-2">
                        {getResponseCount(event, "not going")}
                      </div>
                      <div>
                        <span className="text-gray-700 font-medium">Not attending</span>
                        {getResponseCount(event, "not going") > 0 && (
                          <p className="text-sm text-gray-600 mt-1">{getResponseUsers(event, "not going")}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleResponse(event.id, "going")}
                      className={`flex-1 px-4 py-2 rounded-md transition-all duration-200 ${
                        getUserResponse(event) === "going"
                          ? "bg-green-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <span className="flex items-center justify-center">
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Yes, sure!
                      </span>
                    </button>
                    <button
                      onClick={() => handleResponse(event.id, "not going")}
                      className={`flex-1 px-4 py-2 rounded-md transition-all duration-200 ${
                        getUserResponse(event) === "not going"
                          ? "bg-red-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <span className="flex items-center justify-center">
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        No, not this time
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;