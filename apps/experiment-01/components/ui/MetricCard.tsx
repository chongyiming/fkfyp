import { StarBorder } from "./star-border";
import { StarIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  ratings?: number[];
  isPinned: boolean;
  onPin: () => void;
  isDarkMode: boolean;
}

export function MetricCard({
  title,
  value,
  change,
  ratings,
  isPinned,
  onPin,
  isDarkMode,
}: MetricCardProps) {
  const bgColor = isDarkMode ? "bg-[#121212]" : "bg-white";
  const borderColor = isDarkMode ? "border-gray-800" : "border-gray-200";

  return (
    <div className={`${bgColor} rounded-xl border ${borderColor} p-6 relative`}>
      <StarBorder className="absolute top-2 right-2 p-0" onClick={onPin}>
        <StarIcon
          className={`h-5 w-5 ${isPinned ? "text-[#11f7b1]" : "text-gray-400"}`}
        />
      </StarBorder>
      <h3 className="font-semibold mb-2">{title}</h3>
      {title === "Client Satisfaction" ? (
        <div className="flex items-center gap-4">
          <div className="space-y-1 flex-1">
            {ratings?.map((rating, i) => (
              <div
                key={i}
                className="h-1 bg-[#11f7b1] rounded"
                style={{ width: `${rating * 20}%` }}
              />
            ))}
          </div>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      ) : title === "Conversion Rate" ? (
        <div className="flex items-center gap-2">
          <div className="h-12 w-12 rounded-full border-4 border-[#11f7b1] flex items-center justify-center">
            <span className="text-lg font-bold">{value}</span>
          </div>
          <p className="text-[#11f7b1] text-sm">{change}</p>
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-[#11f7b1] text-sm">{change}</p>
        </>
      )}
    </div>
  );
}
