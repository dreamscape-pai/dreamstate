interface FactionScoreEvent {
  id: number;
  factionId: number;
  points: number;
  description: string;
  createdAt: string;
}

interface Faction {
  id: number;
  name: string;
  displayName: string;
  colorToken: string;
}

interface FactionEventListProps {
  events: FactionScoreEvent[];
  factions?: Faction[]; // Optional - used when showing events from multiple factions
  showFactionName?: boolean; // Whether to show which faction the event belongs to
}

export default function FactionEventList({ events, factions, showFactionName = false }: FactionEventListProps) {
  if (events.length === 0) {
    return (
      <p className="text-center text-dreamstate-periwinkle py-8">
        No events yet
      </p>
    );
  }

  const getFactionForEvent = (factionId: number) => {
    return factions?.find(f => f.id === factionId);
  };

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const faction = showFactionName ? getFactionForEvent(event.factionId) : null;

        return (
          <div
            key={event.id}
            className="bg-dreamstate-midnight/50 rounded-lg p-4 border border-dreamstate-purple/30 hover:border-dreamstate-purple/50 transition-colors"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <p className="text-dreamstate-ice font-body">
                  {event.description}
                </p>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-dreamstate-periwinkle/60">
                  <span>{new Date(event.createdAt).toLocaleString()}</span>
                  {showFactionName && faction && (
                    <span
                      className="font-semibold"
                      style={{ color: `var(--${faction.colorToken})` }}
                    >
                      {faction.displayName}
                    </span>
                  )}
                </div>
              </div>
              <div
                className={`text-2xl font-bold shrink-0 ${
                  event.points >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {event.points >= 0 ? '+' : ''}{event.points}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
