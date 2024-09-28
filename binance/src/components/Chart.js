import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns'; 
import '../App.css';
import zoomPlugin from 'chartjs-plugin-zoom'; 

Chart.register(...registerables, CandlestickController, CandlestickElement, zoomPlugin);

const ChartComponent = ({ chartData }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    // Check if chartData is an array and has elements
    if (Array.isArray(chartData) && chartData.length > 0) {
      // Initialize the chart if it doesn't exist
      if (!chartInstance.current) {
        chartInstance.current = new Chart(ctx, {
          type: 'candlestick',
          data: {
            datasets: [{
              label: 'Candlestick Data',
              data: chartData.map((candle) => ({
                x: candle.t, 
                o: candle.o, 
                h: candle.h, 
                l: candle.l, 
                c: candle.c  
              })),
              color: {
                up: '#00ff00',
                down: '#ff0000', 
                unchanged: '#999999' 
              }
            }]
          },
          options: {
            scales: {
              x: {
                type: 'time',
                min: chartData[chartData.length - 1].t - 1000 * 60 * 60, 
                max: chartData[chartData.length - 1].t, 
                time: {
                  unit: 'minute',
                  stepSize: 1 
                },
                title: {
                  display: false,
                  text: 'Time',
                  color: 'black'
                },
                ticks: {
                  color: 'white' 
                }
              },
              y: {
                title: {
                  display: false,
                  text: 'Price'
                },
                ticks: {
                  color: 'white' 
                }
              }
            },
            plugins: {
              legend: {
                display: false 
              },
              zoom: {
                pan: {
                  enabled: true, 
                  mode: 'x'
                },
                zoom: {
                  wheel: {
                    enabled: true,
                    mode: 'x'
                  },
                  drag: {
                    enabled: false 
                  },
                  pinch: {
                    enabled: true 
                  },
                  mode: 'x', 
                  speed: 0.2,
                  limits: {
                    x: { 
                      minRange: 1000 * 60
                    }
                  }
                }
              }
            }
          }
        });
      } else {
        // Update chart data without destroying the instance
        chartInstance.current.data.datasets[0].data = chartData.map((candle) => ({
          x: candle.t, 
          o: candle.o, 
          h: candle.h, 
          l: candle.l, 
          c: candle.c  
        }));

        // Update the chart
        chartInstance.current.update(); 
      }
    }
  }, [chartData]);

  return (
    <div className='chart-canva'>
      {chartData ? <canvas ref={chartRef} className='canva' /> : null}
    </div>
  );
};

export default ChartComponent;
