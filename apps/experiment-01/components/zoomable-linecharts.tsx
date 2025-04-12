"use client";
import React, { useEffect, useRef } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";

// Register all required Chart.js components
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin
);

interface ECGChartDisplayProps {
  ecgData: number[][];
  sampleRate?: number;
}

const ECGChartDisplay: React.FC<ECGChartDisplayProps> = ({
  ecgData = [],
  sampleRate = 100,
}) => {
  const chartRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const charts = useRef<(Chart<"line", number[], string> | null)[]>([]);

  const leadNames = [
    "Lead I",
    "Lead II",
    "Lead III",
    "aVR",
    "aVL",
    "aVF",
    "V1",
    "V2",
    "V3",
    "V4",
    "V5",
    "V6",
  ];

  useEffect(() => {
    // Check if ecgData is defined and has data
    if (!ecgData || ecgData.length === 0 || !ecgData[0]) return;

    // Create time axis based on sample rate
    const duration = ecgData[0].length / sampleRate;
    const timeAxis = Array.from({ length: ecgData[0].length }, (_, i) =>
      (i / sampleRate).toFixed(2)
    );

    // Initialize all charts
    chartRefs.current.forEach((canvas, index) => {
      if (!canvas) return;

      // Destroy previous chart if it exists
      if (charts.current[index]) {
        charts.current[index]?.destroy();
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      charts.current[index] = new Chart<"line", number[], string>(ctx, {
        type: "line",
        data: {
          labels: timeAxis,
          datasets: [
            {
              label: leadNames[index],
              data: ecgData[index] || [], // Add fallback to empty array
              borderColor: "#3b82f6",
              borderWidth: 1,
              pointRadius: 0,
              tension: 0,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 0,
          },
          plugins: {
            zoom: {
              pan: {
                enabled: true,
                mode: "x",
              },
              zoom: {
                wheel: {
                  enabled: true,
                },
                pinch: {
                  enabled: true,
                },
                mode: "x",
              },
            },
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Time (s)",
              },
              ticks: {
                maxTicksLimit: 10,
              },
            },
            y: {
              title: {
                display: true,
                text: "Amplitude (mV)",
              },
            },
          },
        },
      });
    });

    // Cleanup function
    return () => {
      charts.current.forEach((chart) => {
        if (chart) {
          chart.destroy();
        }
      });
    };
  }, [ecgData, sampleRate]);

  // Early return if no data
  if (!ecgData || ecgData.length === 0) {
    return <div>No ECG data available</div>;
  }

  return (
    <div className="space-y-8 justify-self-center w-[95%]">
      {ecgData.map((_, index) => (
        <div key={index} className="bg-card rounded-lg p-4 border">
          <h3 className="text-lg font-medium mb-2">{leadNames[index]}</h3>
          <div className="h-64">
            <canvas
              ref={(el) => {
                if (el) {
                  chartRefs.current[index] = el;
                }
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ECGChartDisplay;
