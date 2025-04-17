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
  leadLabels?: string[];
  visibleLeads?: number[];
}

const ECGChartDisplay: React.FC<ECGChartDisplayProps> = ({
  ecgData = [],
  sampleRate = 100,
  leadLabels = [
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
  ],
  visibleLeads = Array.from({ length: 12 }, (_, i) => i), // Default to showing all leads
}) => {
  const chartRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const charts = useRef<(Chart<"line", number[], string> | null)[]>([]);

  useEffect(() => {
    // Check if ecgData is defined and has data
    if (!ecgData || ecgData.length === 0 || !ecgData[0]) return;

    // Create time axis based on sample rate
    const duration = ecgData[0].length / sampleRate;
    const timeAxis = Array.from({ length: ecgData[0].length }, (_, i) =>
      (i / sampleRate).toFixed(2)
    );

    // Initialize charts for visible leads only
    visibleLeads.forEach((leadIndex, displayIndex) => {
      const canvas = chartRefs.current[displayIndex];
      if (!canvas) return;

      // Destroy previous chart if it exists
      if (charts.current[displayIndex]) {
        charts.current[displayIndex]?.destroy();
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      charts.current[displayIndex] = new Chart<"line", number[], string>(ctx, {
        type: "line",
        data: {
          labels: timeAxis,
          datasets: [
            {
              label: leadLabels[leadIndex],
              data: ecgData[leadIndex] || [], // Use the data from the correct lead
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
  }, [ecgData, sampleRate, visibleLeads, leadLabels]);

  // Early return if no data
  if (!ecgData || ecgData.length === 0) {
    return <div>No ECG data available</div>;
  }

  return (
    <div className="space-y-8 justify-self-center w-[95%]">
      {visibleLeads.map((leadIndex, displayIndex) => (
        <div key={leadIndex} className="bg-card rounded-lg p-4 border">
          <h3 className="text-lg font-medium mb-2">{leadLabels[leadIndex]}</h3>
          <div className="h-64">
            <canvas
              ref={(el) => {
                if (el) {
                  chartRefs.current[displayIndex] = el;
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
