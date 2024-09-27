// src/utils/websocket.js
export const connectWebSocket = (symbol, interval, onMessage) => {
    const url = `wss://stream.binance.com:9443/ws/${symbol}@kline_${interval}`;
    const ws = new WebSocket(url);
  
    ws.onopen = () => {
      console.log(`Connected to WebSocket for ${symbol} with interval ${interval}`);
    };
  
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      onMessage(data); // Call the provided callback function
    };
  
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  
    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
  
    return ws; // Return the WebSocket instance
  };
  