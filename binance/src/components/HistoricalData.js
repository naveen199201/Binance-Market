const fetchHistoricalData = async (symbol, interval) => {
    const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}`);
    const data = await response.json();
    return data.map(k => ({
      t: k[0], // Open time (timestamp)
      o: parseFloat(k[1]), // Open price
      h: parseFloat(k[2]), // High price
      l: parseFloat(k[3]), // Low price
      c: parseFloat(k[4]) // Close price
    }));
  };
export default fetchHistoricalData