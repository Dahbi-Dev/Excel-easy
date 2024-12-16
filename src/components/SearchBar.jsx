/* eslint-disable react/prop-types */
// components/SearchBar.jsx
import  { useState } from 'react';

const SearchBar = ({ data, setData }) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = () => {
    if (!searchInput.trim()) return;

    const filteredData = data.filter(row => 
      row['Nom']?.toLowerCase().includes(searchInput.toLowerCase()) ||
      row['Prenom']?.toLowerCase().includes(searchInput.toLowerCase()) ||
      row['N° PIECE ID']?.toString().includes(searchInput) ||
      row['PARENT_CIN']?.toString().includes(searchInput)
    );

    setData(filteredData);
  };

  const handleReset = () => {
    setSearchInput('');
    setData(data);
  };

  return (
    <div className="mb-8 flex gap-4">
      <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Search by Nom, Prenom, or CIN"
        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
      <button
        onClick={handleSearch}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Search
      </button>
      <button
        onClick={handleReset}
        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
      >
        Reset
      </button>
    </div>
  );
};

export default SearchBar;