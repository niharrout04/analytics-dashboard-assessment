import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';  // Import PapaParse for CSV parsing
import './App.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function App() {
  const [evData, setEvData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [states, setStates] = useState([]);
  const [makes, setMakes] = useState([]);
  const [years, setYears] = useState([]);
  const [countyData, setCountyData] = useState([]);
  const [vinData, setVinData] = useState([]);

  // Fetch and parse the CSV file
  useEffect(() => {
    const filePath = '/data/Electric_Vehicle_Population_Data.csv';  // Path to the CSV in public folder
    fetch(filePath)
      .then((response) => response.text()) // Use `.text()` for CSV files
      .then((csvData) => {
        const parsedData = Papa.parse(csvData, { header: true, dynamicTyping: true }).data;

        // Filter out rows with invalid or missing 'Model Year'
        const validData = parsedData.filter((item) => item['Model Year'] && item['Model Year'] !== '');

        setEvData(validData); // Store valid data
        setFilteredData(validData); // Initially, show all data
        setCountyData(parsedData); // Store the data for county analysis
        setVinData(parsedData); // Initially, show all data
        // Extract unique values for filtering
        setStates([...new Set(validData.map((item) => item.State))]);
        setMakes([...new Set(validData.map((item) => item.Make))]);

        // Ensure 'Model Year' values are correctly parsed as strings
        const uniqueYears = [...new Set(validData
          .map((item) => item['Model Year'].toString()) // Ensure the year is a string
          .filter((year) => year !== undefined && year !== ''))]; // Remove undefined or empty years

        setYears(uniqueYears);
      })
      .catch((error) => {
        console.error('Error reading CSV file:', error);
      });
  }, []);

  // Handle filtering
  const handleFilterChange = (filterName, filterValue) => {
    let newData = evData;

    // Apply state filter
    if (filterName === 'state' && filterValue !== 'All') {
      newData = newData.filter((item) => item.State === filterValue);
    }

    // Apply make filter
    if (filterName === 'make' && filterValue !== 'All') {
      newData = newData.filter((item) => item.Make === filterValue);
    }

    // Apply year filter
    if (filterName === 'year' && filterValue !== 'All') {
      newData = newData.filter((item) => item['Model Year']?.toString() === filterValue);
    }

    setFilteredData(newData); // Update the filtered data after applying the filters
  };

  // Helper function to get count of EVs by a given column
  const getEVCountBy = (data, column) => {
    const count = data.reduce((acc, item) => {
      const key = item[column];
      acc[key] = acc[key] ? acc[key] + 1 : 1;
      return acc;
    }, {});

    return Object.entries(count).map(([key, value]) => ({
      name: key,
      value,
    }));
  };

  // Helper function to count EVs by County, based on filtered data
  const getEVCountByCounty = (data) => {
    const count = data.reduce((acc, item) => {
      const county = item.County; // Extract the County value
      acc[county] = acc[county] ? acc[county] + 1 : 1; // Increment the count for each County
      return acc;
    }, {});

    return Object.entries(count).map(([county, value]) => ({
      name: county,
      value,
    }));
  };
  const getEVCountByCity = (data) => {
    const count = data.reduce((acc, item) => {
      const city = item.City; // Extract the City value
      acc[city] = acc[city] ? acc[city] + 1 : 1; // Increment the count for each City
      return acc;
    }, {});

    return Object.entries(count).map(([city, value]) => ({
      name: city,
      value,
    }));
  };

  
    // Get EV count by Postal Code from filtered data
    const COLORS = ['#82ca9d', '#ff7300', '#8884d8', '#ffbb28'];

  // Calculate key metrics
  const totalEVs = filteredData.length;
  const evByState = getEVCountBy(filteredData, 'State');
  const evByMake = getEVCountBy(filteredData, 'Make');
  const evByYear = getEVCountBy(filteredData, 'Model Year');
  const evByCity = getEVCountByCity(filteredData);
  const evByCounty = getEVCountByCounty(filteredData);  // Use filtered data for county chart
  const evByPostalCode = getEVCountBy(filteredData, 'Postal Code');
  const evByCAFVEEligibility = getEVCountBy(filteredData, 'Clean Alternative Fuel Vehicle (CAFV) Eligibility');
  const evByEVType = getEVCountBy(filteredData, 'Electric Vehicle Type');
  const sortedPostalCodes = [...evByPostalCode].sort((a, b) => b.value - a.value);

  const topPostalCodes = sortedPostalCodes.slice(0, 5);  // Get top 5 postal codes
  const otherPostalCodes = sortedPostalCodes.slice(5);  // Remaining postal codes
  return (
    <div className="App">
      <header className="App-header">
        <h1>Electric Vehicle Dashboard</h1>
      </header>

      {/* Filter Section */}
      <div className="filters">
        <select onChange={(e) => handleFilterChange('state', e.target.value)}>
          <option value="All">All States</option>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>

        <select onChange={(e) => handleFilterChange('make', e.target.value)}>
          <option value="All">All Makes</option>
          {makes.map((make) => (
            <option key={make} value={make}>
              {make}
            </option>
          ))}
        </select>

        <select onChange={(e) => handleFilterChange('year', e.target.value)}>
          <option value="All">All Years</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Metrics Section */}
      <div className="metrics">
        <div>
          <h3>Total EVs</h3>
          <p>{totalEVs}</p>
        </div>
      </div>
      {/* Electric Vehicle Type Chart (Pie Chart) */}
      <div className="chart-section" style={{display:"flex",justifyContent:"space-between" }}>
        <div>
        <h2>EVs by Electric Vehicle Type</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={evByEVType}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#82ca9d"
              label
            >
              {evByEVType.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#ff7300' : '#8884d8'} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        </div>

      {/* EVs by CAFV Eligibility Pie Chart */}
 <div>
        <h2>EVs by Clean Alternative Fuel Vehicle (CAFV) Eligibility</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={evByCAFVEEligibility}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#82ca9d"
              label
            >
              {evByCAFVEEligibility.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        </div>
      </div>

      {/* EVs by County Chart (Bar Chart) */}
      <div className="chart-section">
        <h2>EVs by County</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={evByCounty}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
        <PieChart>
            <Pie
              data={evByCounty}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#82ca9d"
              label
            >
              {evByCounty.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8884d8' : '#ff7300'} />
              ))}
            </Pie>
          </PieChart>

      </div>

  {/* EVs by State Bar Chart */}
  <div className="chart-section">
        <h2>EVs by State (Bar Chart)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={evByState}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

        {/* City Bar Chart Section */}
     <div className="chart-section">
        <h2>EVs by City</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={evByCity}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

       {/* Postal Code Bar Chart Section */}
       <div className="chart-section">
        <h2>EVs by Postal Code</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={evByPostalCode}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>


      {/* EVs by Make Chart */}
      <div className="chart-section">
        <h2>EVs by Make</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={evByMake}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* EVs by Year Chart */}
      <div className="chart-section">
        <h2>EVs by Model Year</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={evByYear}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#ff7300" />
          </BarChart>
        </ResponsiveContainer>
      </div>

   

      

 
    </div>
  );
}

export default App;
