import { ScrollText } from "lucide-react";

type Props = {
  events: string[];
};

export function EventLog({ events }: Props) {
  const orderedEvents = [...events].reverse();

  return (
    <aside className="event-log">
      <div className="event-heading">
        <div>
          <span>Game feed</span>
          <h2>Event Log</h2>
        </div>
        <ScrollText size={22} />
      </div>
      <div className="events">
        {orderedEvents.map((event, index) => (
          <p className={index === 0 ? "latest-event" : ""} key={`${event}-${index}`}>
            <span>{orderedEvents.length - index}</span>
            {event}
          </p>
        ))}
      </div>
    </aside>
  );
}
