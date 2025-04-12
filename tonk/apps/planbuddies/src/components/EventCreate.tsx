import React, { useState } from "react";
import { useEventStore } from "../stores/eventStore";

interface EventCreateProps {
  userId: string;
  onClose: () => void;
}

const EventCreate: React.FC<EventCreateProps> = ({ userId, onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [items, setItems] = useState<string[]>(["", ""]);
  const { createEvent } = useEventStore();

  const handleCreateEvent = () => {
    if (title.trim() && date.trim()) {
      const filteredItems = items.filter(item => item.trim() !== "");
      createEvent(
        title.trim(), 
        description.trim(), 
        location.trim(), 
        date.trim(), 
        filteredItems,
        userId
      );
      onClose();
    }
  };

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, ""]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        {/* French flag decoration at the top */}
        <div className="absolute top-0 left-0 right-0 flex h-2">
          <div className="flex-1 bg-blue-700"></div>
          <div className="flex-1 bg-white"></div>
          <div className="flex-1 bg-red-600"></div>
        </div>
        
        <h2 className="text-2xl font-bold mb-4 mt-3 text-center">New Event</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g.: Pizza night"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g.: We love pizza"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g.: At Theo's house"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Date</label>
          <input
            type="text"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="e.g.: April 12, 2025"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Items to bring</label>
          {items.map((item, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={item}
                onChange={(e) => handleItemChange(index, e.target.value)}
                placeholder={`Item ${index + 1} (e.g.: beer, pizza)`}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            + Add an item
          </button>
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