import SocialIcon from "./SocialIcon";

export default function StreamScheduleBlock({
  day,
  start,
  end,
  tz,
}: {
  day: string;
  start: string;
  end: string;
  tz: string;
}) {
  return (
    <div className="bg-bg-card border border-purple-core/30 rounded-xl p-5 lift hover:border-electric-blue hover:shadow-glow-blue">
      <div className="flex items-center justify-between">
        <h4 className="heading text-2xl text-white">{day}</h4>
        <SocialIcon k="twitch" className="w-5 h-5 text-purple-light" />
      </div>
      <p className="text-text-primary mt-2 font-mono">
        {start} <span className="text-text-muted">→</span> {end}
      </p>
      <p className="text-text-muted text-xs mt-1">{tz}</p>
    </div>
  );
}
