// components/SearchBar.jsx
import { useState } from 'react';
import { parse, isWithinInterval, format } from 'date-fns';
import { Search, Loader2, Filter, X } from 'lucide-react';
// import { OPTIONS } from "./utils/constants";


const SearchBar = ({ 
  data, 
  setData, 
  originalData, 
  searchFields = ['Nom', 'Prenom', 'N° PIECE ID', 'PARENT_CIN'],
  additionalFilters = {}
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [dateFilters, setDateFilters] = useState({
    'DATE DE CONSULTATION': { start: '', end: '' },
    'DATE DE NAISSANCE': { start: '', end: '' }
  });

  // Helper function to parse and validate date
  const parseDate = (dateString) => {
    if (!dateString) return null;
    try {
      // Try multiple date formats
      const formats = [
        "yyyy-MM-dd",
        "dd/MM/yyyy",
        "MM/dd/yyyy"
      ];

      for (const format of formats) {
        try {
          return parse(dateString, format, new Date());
        } catch {
          continue;
        }
      }
      return new Date(dateString);
    } catch {
      return null;
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      // If no search input and no active filters, reset to original data
      if (!searchInput.trim() && 
          Object.keys(activeFilters).length === 0 && 
          !dateFilters['DATE DE CONSULTATION'].start && 
          !dateFilters['DATE DE NAISSANCE'].start) {
        setData(originalData);
        return;
      }

      const searchTerm = searchInput.toLowerCase().trim();

      const filteredData = originalData.filter(row => {
        // Text search across specified fields
        const textMatch = searchFields.some(field => 
          (row[field]?.toString().toLowerCase() || '').includes(searchTerm)
        );

        // Filter by additional filters
        const filterMatch = Object.entries(activeFilters).every(([field, value]) => 
          row[field] === value
        );

        // Date range filtering
        const dateMatch = ['DATE DE CONSULTATION', 'DATE DE NAISSANCE'].every(dateField => {
          const { start, end } = dateFilters[dateField];
          if (!start && !end) return true; // No date filter applied

          const rowDate = parseDate(row[dateField]);
          const startDate = parseDate(start);
          const endDate = parseDate(end);

          if (!rowDate) return false;

          // If only start date is provided
          if (startDate && !endDate) {
            return rowDate >= startDate;
          }

          // If only end date is provided
          if (!startDate && endDate) {
            return rowDate <= endDate;
          }

          // If both start and end dates are provided
          if (startDate && endDate) {
            return isWithinInterval(rowDate, { start: startDate, end: endDate });
          }

          return true;
        });

        return textMatch && filterMatch && dateMatch;
      });

      await new Promise(resolve => setTimeout(resolve, 500));
      setData(filteredData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSearchInput('');
      setActiveFilters({});
      setDateFilters({
        'DATE DE CONSULTATION': { start: '', end: '' },
        'DATE DE NAISSANCE': { start: '', end: '' }
      });
      setShowFilterDropdown(false);
      setData(originalData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleFilter = (field, value) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (newFilters[field] === value) {
        delete newFilters[field];
      } else {
        newFilters[field] = value;
      }
      return newFilters;
    });
  };

  const handleDateFilterChange = (field, type, value) => {
    setDateFilters(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [type]: value
      }
    }));
  };

  return (
    <div className="mb-8 space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search patients..."
            className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <button
          onClick={() => setShowFilterDropdown(!showFilterDropdown)}
          className={`px-4 py-2 rounded-md transition-colors flex items-center space-x-2 ${
            (Object.keys(activeFilters).length > 0 || 
             dateFilters['DATE DE CONSULTATION'].start || 
             dateFilters['DATE DE NAISSANCE'].start)
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-600 text-white'
          }`}
        >
          <Filter className="h-5 w-5" />
          <span>Filters</span>
        </button>
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
          <span>Search</span>
        </button>
        <button
          onClick={handleReset}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-2"
        >
          {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
          <span>Reset</span>
        </button>
      </div>

      {/* Filter Dropdown */}
      {showFilterDropdown && (
        <div className="bg-white border border-gray-200 rounded-md p-4 grid grid-cols-2 gap-4">
          {/* Categorical Filters */}
          {Object.entries(additionalFilters).map(([field, options]) => (
            <div key={field} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">{field}</h4>
              <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleFilter(field, option.value)}
                    className={`px-3 py-1 rounded-full text-xs transition-colors ${
                      activeFilters[field] === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Date Filters */}
          {['DATE DE CONSULTATION', 'DATE DE NAISSANCE'].map(dateField => (
            <div key={dateField} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">{dateField}</h4>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">From</label>
                  <input
                    type="date"
                    value={dateFilters[dateField].start}
                    onChange={(e) => handleDateFilterChange(dateField, 'start', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">To</label>
                  <input
                    type="date"
                    value={dateFilters[dateField].end}
                    onChange={(e) => handleDateFilterChange(dateField, 'end', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Filters Summary */}
      {(Object.keys(activeFilters).length > 0 || 
        dateFilters['DATE DE CONSULTATION'].start || 
        dateFilters['DATE DE NAISSANCE'].start) && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Active Filters:</span>
          {Object.entries(activeFilters).map(([field, value]) => (
            <span 
              key={field} 
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center space-x-1"
            >
              {field}: {value}
              <button 
                onClick={() => toggleFilter(field, value)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
          {Object.entries(dateFilters).filter(([, filter]) => filter.start || filter.end).map(([field, { start, end }]) => (
            <span 
              key={field} 
              className="bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center space-x-1"
            >
              {field}: {start && `From ${format(parseDate(start), 'dd/MM/yyyy')}`} 
              {end && ` To ${format(parseDate(end), 'dd/MM/yyyy')}`}
              <button 
                onClick={() => handleDateFilterChange(field, 'start', '') && handleDateFilterChange(field, 'end', '')}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;