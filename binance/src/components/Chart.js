import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns'; // For date handling
import '../App.css'

// Register necessary components for Chart.js including the financial chart types
Chart.register(...registerables, CandlestickController, CandlestickElement);

const ChartComponent = ({ chartData }) => {
  console.log(chartData)
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current && chartData.length > 0) {
      // Destroy previous chart instance to avoid canvas reuse issues
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: 'candlestick',
        data: {
          datasets: [{
            label: 'Candlestick Data',
            data: chartData.map((candle) => ({
              x: candle.t, // Timestamp
              o: candle.o, // Open price
              h: candle.h, // High price
              l: candle.l, // Low price
              c: candle.c  // Close price
            })),
            borderColor: '#3e95cd',
            color: {
              up: '#00ff00', // Color for upward candles
              down: '#ff0000', // Color for downward candles
              unchanged: '#999999' // Color for unchanged candles
            }
          }]
        },
        options: {
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'minute', // Display time in minutes
                tooltipFormat: 'MMM d, h:mm a' // Custom tooltip format for better readability
              },
              title: {
                display: true,
                text: 'Time'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Price'
              }
            }
          }
        }
      });
    }
  }, [chartData]);

  return (
    <div className='chart-canva'>
      <canvas ref={chartRef} />
    </div>
  );
};

export default ChartComponent;
