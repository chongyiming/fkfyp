
import { CSSProperties } from "react";
import { scaleTime, scaleLinear, max, line as d3_line, curveNatural as d3_curveNatural } from "d3";

interface SalesData {
  date: Date;
  value: number;
}

interface LineChartPulseProps {
  data: SalesData[];
  height?: string;
}

export function LineChartPulse({ data, height = "h-72" }: LineChartPulseProps) {
  let xScale = scaleTime()
  .domain([data[0]?.date ?? new Date(), data[data.length - 1]?.date ?? new Date()])
  .range([0, 100]);
  let yScale = scaleLinear()
    .domain([0, max(data.map((d) => d.value)) ?? 0])
    .range([100, 0]);

  let line = d3_line<SalesData>()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.value))
    .curve(d3_curveNatural);

  let d = line(data);

  if (!d) {
    return null;
  }

  return (
    <div
      className={`relative ${height} w-full`}
      style={
        {
          "--marginTop": "0px",
          "--marginRight": "8px",
          "--marginBottom": "25px",
          "--marginLeft": "25px",
        } as CSSProperties
      }
    >
      {/* Y axis */}
      <div
        className="absolute inset-0
          h-[calc(100%-var(--marginTop)-var(--marginBottom))]
          w-[var(--marginLeft)]
          translate-y-[var(--marginTop)]
          overflow-visible
        "
      >
        {yScale
          .ticks(5)
          .map(yScale.tickFormat(5, "d"))
          .map((value, i) => (
            <div
              key={i}
              style={{
                top: `${yScale(+value)}%`,
                left: "0%",
              }}
              className="absolute text-xs tabular-nums -translate-y-1/2 text-gray-400 w-full text-right pr-2"
            >
              {value}
            </div>
          ))}
      </div>

      {/* Chart area */}
      <div
        className="absolute inset-0
          h-[calc(100%-var(--marginTop)-var(--marginBottom))]
          w-[calc(100%-var(--marginLeft)-var(--marginRight))]
          translate-x-[var(--marginLeft)]
          translate-y-[var(--marginTop)]
          overflow-visible
        "
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent rounded-lg"></div>
        
        {/* Pulsating dot */}
        <div
          className="absolute size-3"
          style={{
            left: `${xScale(data[data.length - 1]?.date ?? new Date())}%`,
            top: `${yScale(data[data.length - 1]?.value ?? 0)}%`,
            transform: "translate(-50%, -50%)",
          }}
          
        >
          <div className="absolute inset-0 animate-ping rounded-full bg-blue-400/30"></div>
          <div className="absolute inset-0 rounded-full bg-blue-400 border-2 border-blue-500"></div>
        </div>
        
        <svg
          viewBox="0 0 100 100"
          className="overflow-visible w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Area under the curve */}
          <defs>
            <linearGradient id="area-gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
            </linearGradient>
            <clipPath id="area-clip">
              <path 
                d={`${d} L 100,100 L 0,100 Z`} 
                fill="url(#area-gradient)"
              />
            </clipPath>
          </defs>
          
          <path 
            d={`${d} L 100,100 L 0,100 Z`} 
            fill="url(#area-gradient)"
            opacity="0.2"
          />
          
          {/* Grid lines */}
          {yScale
            .ticks(5)
            .map(yScale.tickFormat(5, "d"))
            .map((active, i) => (
              <g
                transform={`translate(0,${yScale(+active)})`}
                className="text-slate-700"
                key={i}
              >
                <line
                  x1={0}
                  x2={100}
                  stroke="currentColor"
                  strokeDasharray="3,3"
                  strokeWidth={0.5}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            ))}
          
          {/* Line */}
          <path
            d={d}
            fill="none"
            stroke="url(#linePulse-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          
          <defs>
            <linearGradient id="linePulse-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
          </defs>
        </svg>

        <div className="translate-y-2">
          {/* X Axis */}
          {data.map((day, i) => {
            // Show first, middle, and last month
            const isFirst = i === 0;
            const isLast = i === data.length - 1;
            const isMiddle = i === Math.floor(data.length / 2);
            const isQuarterMonth = i % 3 === 0;
            
            if (!isFirst && !isLast && !isMiddle && !isQuarterMonth) return null;
            
            return (
              <div key={i} className="overflow-visible text-gray-400">
                <div
                  style={{
                    left: `${xScale(day.date)}%`,
                    top: "100%",
                    transform: `translateX(${i === 0 ? "0%" : i === data.length - 1 ? "-100%" : "-50%"})`,
                  }}
                  className="text-xs absolute"
                >
                  {day.date.toLocaleDateString("en-US", {
                    month: "short",
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}