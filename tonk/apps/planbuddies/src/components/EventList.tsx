import React, { useState } from "react";
import { useEventStore, Event } from "../stores/eventStore";

interface EventListProps {
  currentUserId: string;
}

const EventList: React.FC<EventListProps> = ({ currentUserId }) => {
  const { events, users, respondToEvent } = useEventStore();
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUserId);

  const handleResponse = (eventId: string, response: "going" | "not going") => {
    respondToEvent(eventId, selectedUserId, response);
  };

  const getResponseCount = (event: Event, response: "going" | "not going") => {
    return event.responses.filter(r => r.response === response).length;
  };

  const getUserResponse = (event: Event, userId: string = selectedUserId) => {
    const userResponse = event.responses.find(r => r.userId === userId);
    return userResponse?.response;
  };

  const getCreatorName = (event: Event) => {
    const creator = users[event.createdBy];
    return creator ? creator.name : "Unknown";
  };

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
              className="bg-white rounded-lg shadow-md p-5 border border-gray-200 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
            >
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-800">{event.title}</h3>
                
                <div className="mt-2 p-3 bg-blue-50 rounded-md border-l-4 border-blue-500">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-blue-800 font-medium">{event.date}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 mt-2">
                  Created by {getCreatorName(event)}
                </p>
              </div>
              
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <div className="flex space-x-4">
                    <div className="flex items-center">
                      <span className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-800 rounded-full mr-2">
                        {getResponseCount(event, "going")}
                      </span>
                      <span className="text-gray-700">going</span>
                    </div>
                    <div className="flex items-center">
                      <span className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-800 rounded-full mr-2">
                        {getResponseCount(event, "not going")}
                      </span>
                      <span className="text-gray-700">not going</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => handleResponse(event.id, "going")}
                    className={`flex-1 px-4 py-2 rounded-md transition-all duration-200 transform hover:scale-105 ${
                      getUserResponse(event) === "going"
                        ? "bg-green-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <span className="flex items-center justify-center">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Yes sure!
                    </span>
                  </button>
                  <button
                    onClick={() => handleResponse(event.id, "not going")}
                    className={`flex-1 px-4 py-2 rounded-md transition-all duration-200 transform hover:scale-105 ${
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
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
