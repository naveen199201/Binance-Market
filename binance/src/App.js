import React, { useEffect, useState, useCallback } from 'react';
import ChartComponent from './components/Chart';
import { connectWebSocket } from './utils/websocket'; // Ensure this utility is correctly implemented
import createDebouncedFunction from './utils/debounce';

// Utility to fetch historical candlestick data from Binance REST API
const fetchHistoricalData = async (symbol, interval) => {
  const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=20`);
  const data = await response.json();
  return data.map(k => ({
    t: k[0], // Open time (timestamp)
    o: parseFloat(k[1]), // Open price
    h: parseFloat(k[2]), // High price
    l: parseFloat(k[3]), // Low price
    c: parseFloat(k[4]) // Close price
  }));
};

const COINS = ['ethusdt', 'bnbusdt', 'dotusdt'];
const INTERVALS = ['1m', '3m', '5m'];

const App = () => {
  const [selectedCoin, setSelectedCoin] = useState('ethusdt');
  const [selectedInterval, setSelectedInterval] = useState('1m');
  const [candlestickData, setCandlestickData] = useState([]);
  const [ws, setWs] = useState(null); // State to store WebSocket instance

  // Function to fetch historical data and set it
  const fetchAndSetHistoricalData = useCallback(async () => {
    const historicalData = await fetchHistoricalData(selectedCoin.toUpperCase(), selectedInterval);
    setCandlestickData(historicalData); // Set the fetched historical data
  }, [selectedCoin, selectedInterval]);

  // Function to handle real-time candlestick data updates
  const updateCandlestickData = useCallback((newData) => {
    setCandlestickData((prevData) => {
      const updatedData = [...prevData, newData];
      // Save updated data to local storage (optional)
      localStorage.setItem(`${selectedCoin}-${selectedInterval}`, JSON.stringify(updatedData));
      return updatedData;
    });
  }, [selectedCoin, selectedInterval]);

  // Fetch historical data when coin or interval changes
  useEffect(() => {
    if(localStorage.getItem(`${selectedCoin}-${selectedInterval}`)){
      setCandlestickData(JSON.parse(localStorage.getItem(`${selectedCoin}-${selectedInterval}`)));
    }else {
      fetchAndSetHistoricalData();
    }
  }, [fetchAndSetHistoricalData, selectedCoin, selectedInterval]);

  // Connect to WebSocket for real-time updates
  useEffect(() => {

    window.addEventListener('beforeunload', () => {
      localStorage.clear(); // Clear the entire localStorage on reload
    });
    if (ws) {
      ws.close(); // Close previous WebSocket if any
    }

    // Connect to the WebSocket
    const newWs = connectWebSocket(selectedCoin, selectedInterval, (data) => {
      const newData = {
        t: data.k.t, // Timestamp from Kline data
        o: parseFloat(data.k.o), // Open
        h: parseFloat(data.k.h), // High
        l: parseFloat(data.k.l), // Low
        c: parseFloat(data.k.c), // Close
      };

      // Use the debounced function to update the candlestick data
      const debouncedUpdate = createDebouncedFunction(() => updateCandlestickData(newData), 300);
      debouncedUpdate();
    });

    setWs(newWs); // Store the WebSocket instance in state

    return () => {
      if (newWs) {
        newWs.close(); // Close the WebSocket connection on component unmount or re-connect
      }
    };
  }, [selectedCoin, selectedInterval, updateCandlestickData]);

  const handleCoinChange = (event) => {
    setSelectedCoin(event.target.value);
  };

  const handleIntervalChange = (event) => {
    setSelectedInterval(event.target.value);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Binance Candlestick Chart</h1>
      <label>
        Select Cryptocurrency:
        <select value={selectedCoin} onChange={handleCoinChange}>
          {COINS.map(coin => (
            <option key={coin} value={coin}>{coin.toUpperCase()}</option>
          ))}
        </select>
      </label>
      <label>
        Select Interval:
        <select value={selectedInterval} onChange={handleIntervalChange}>
          {INTERVALS.map(interval => (
            <option key={interval} value={interval}>{interval}</option>
          ))}
        </select>
      </label>
      <ChartComponent chartData={candlestickData} /> {/* Pass the updated data to ChartComponent */}
    </div>
  );
};

export default App;
