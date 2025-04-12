import React, { useState } from "react";
import { useEventStore } from "../stores/eventStore";

interface EventCreateProps {
  userId: string;
  onClose: () => void;
}

const EventCreate: React.FC<EventCreateProps> = ({ userId, onClose }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const { createEvent } = useEventStore();

  const handleCreateEvent = () => {
    if (title.trim() && date.trim()) {
      createEvent(title.trim(), date.trim(), userId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Create New Event</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Event Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Pizza night at Theo's house"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Date</label>
          <input
            type="text"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="e.g. Monday 4 April"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateEvent}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCreate;