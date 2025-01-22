import React from 'react';


// Tailwind CSS components
export const Sidebar: React.FC = () => (
  <aside className="w-full md:w-1/4 p-4 border-r border-gray-200">
    <h2 className="text-lg font-bold mb-4">Find Your Tutor</h2>
    <div className="mb-4">
      <label className="block font-semibold">Region</label>
      <select className="w-full p-2 border border-gray-300 rounded">
        <option>North America</option>
        <option>India</option>
        <option>Europe</option>
        <option>China</option>


      </select>
    </div>
    <div className="mb-4">
      <label className="block font-semibold">Country</label>
      <select className="w-full p-2 border border-gray-300 rounded">
        <option>United States</option>
        <option>Mumbai</option>
        <option>Delhi</option>
        <option>Germany</option>
        <option>Hong Kong</option>
        <option>Frankfrut</option>

      </select>
    </div>
    <div className="mb-4">
      <label className="block font-semibold">Language</label>
      <select className="w-full p-2 border border-gray-300 rounded">
        <option>English</option>
      </select>
    </div>
    <div className="mb-4">
      <label className="block font-semibold">Tags</label>
      <input
        type="text"
        placeholder="e.g., Math, Science"
        className="w-full p-2 border border-gray-300 rounded"
      />
    </div>
    <button className="w-full bg-purple-500 text-white py-2 rounded mt-2 hover:bg-purple-600">
      Search
    </button>
  </aside>
);