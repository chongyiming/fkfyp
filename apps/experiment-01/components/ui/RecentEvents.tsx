import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface RecentEvent {
  agent: string;
  action: "SOLD" | "RENT";
  property: string;
  price: string;
  timestamp: string;
  avatar: string;
}

interface RecentEventsProps {
  events: RecentEvent[];
  isDarkMode: boolean;
}

export function RecentEvents({ events, isDarkMode }: RecentEventsProps) {
  const textColor = isDarkMode ? "text-white" : "text-gray-900";
  const subTextColor = isDarkMode ? "text-gray-400" : "text-gray-500";

  return (
    <div className="space-y-1">
      {events.map((event, index) => (
        <div key={index} className="flex items-center gap-2 py-1.5">
          <Avatar className="h-5 w-5">
            <AvatarImage src={event.avatar} alt={event.agent} />
            <AvatarFallback>
              {event.agent
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className={`${textColor} text-xs font-medium truncate`}>
                {event.agent}
              </span>
              <span className="text-[#11f7b1] text-xs">{event.price}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span
                className={`${event.action === "SOLD" ? "text-[#11f7b1]" : "text-blue-400"}`}
              >
                {event.action}
              </span>
              <span className={subTextColor}>•</span>
              <span className={subTextColor}>{event.timestamp}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
