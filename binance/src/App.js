import React, { useEffect, useState, useCallback } from 'react';
import ChartComponent from './components/Chart';
import { connectWebSocket } from './utils/websocket'; 
import createDebouncedFunction from './utils/debounce';

//fetch Historical Data
const fetchHistoricalData = async (symbol, interval) => {
  const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}`);
  const data = await response.json();
  return data.map(k => ({
    t: k[0], 
    o: parseFloat(k[1]), 
    h: parseFloat(k[2]), 
    l: parseFloat(k[3]), 
    c: parseFloat(k[4]) 
  }));
};

const COINS = ['ethusdt', 'bnbusdt', 'dotusdt'];
const INTERVALS = ['1m', '3m', '5m'];

const App = () => {
  const [selectedCoin, setSelectedCoin] = useState('ethusdt');
  const [selectedInterval, setSelectedInterval] = useState('1m');
  const [candlestickData, setCandlestickData] = useState([]);
  const [ws, setWs] = useState(null); 

  // Function to fetch historical data and set it
  const fetchAndSetHistoricalData = useCallback(async () => {
    const historicalData = await fetchHistoricalData(selectedCoin.toUpperCase(), selectedInterval);
    setCandlestickData(historicalData); 
  }, [selectedCoin, selectedInterval]);

  // Function to update real-time candlestick data 
  const updateCandlestickData = useCallback((newData) => {
    setCandlestickData((prevData) => {
      const updatedData = [...prevData, newData];
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


  useEffect(() => {
    window.addEventListener('beforeunload', () => {
      localStorage.clear(); 
    });
    if (ws) {
      ws.close(); 
    }
    // Connect to the WebSocket
    const newWs = connectWebSocket(selectedCoin, selectedInterval, (data) => {
      if (data.k.x) {  
      const newData = {
        t: data.k.t, 
        o: parseFloat(data.k.o), 
        h: parseFloat(data.k.h), 
        l: parseFloat(data.k.l), 
        c: parseFloat(data.k.c), 
      };

      const debouncedUpdate = createDebouncedFunction(() => updateCandlestickData(newData), 300);
      debouncedUpdate();
    }
    });
    setWs(newWs);

    return () => {
      if (newWs) {
        newWs.close(); 
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
    <div  className='app'>
      <h1 className='app-header'>Binance Candlestick Chart</h1>
      <div className='select-options'>
      <label className='currency'>
        <b>Select Cryptocurrency: </b>
        <select value={selectedCoin} onChange={handleCoinChange}>
          {COINS.map(coin => (
            <option key={coin} value={coin}>{coin.toUpperCase()}</option>
          ))}
        </select>
      </label>
      <label>
       <b> Select Interval: </b>
        <select value={selectedInterval} onChange={handleIntervalChange}>
          {INTERVALS.map(interval => (
            <option key={interval} value={interval}>{interval}</option>
          ))}
        </select>
      </label>
      </div>
      <div className='chart-component'>
      <ChartComponent chartData={candlestickData} /> {/* Pass the updated data to ChartComponent */}
      </div>
    </div>
  );
};

export default App;
