// src/components/Filter.js
import React from 'react';

const Filter = ({ onFilterChange, availableStates, availableYears }) => {
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  return (
    <div className="filter">
      <label>State:</label>
      <select name="state" onChange={handleFilterChange}>
        <option value="All">All</option>
        {availableStates.map((state) => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </select>

      <label>Year:</label>
      <select name="year" onChange={handleFilterChange}>
        <option value="All">All</option>
        {availableYears.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Filter;
