type TopStrategyHubInfoBlockProps = {
  title: string;
  items?: string[];
  icon: string;
  toneClassName: string;
  accentColor: string;
};

export function TopStrategyHubInfoBlock({
  title,
  items,
  icon,
  toneClassName,
  accentColor,
}: TopStrategyHubInfoBlockProps) {
  if (!items || items.length === 0) return null;

  return (
    <div 
      className={`rounded-2xl p-4 border-2 relative overflow-hidden ${toneClassName}`}
      style={{
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      }}
    >
      <div className="absolute top-0 left-0 w-1.5 h-full" style={{ background: accentColor }} />
      <div className="flex items-center gap-2 mb-3 pl-2">
        <div 
          className="w-7 h-7 rounded-lg flex items-center justify-center border"
          style={{
            background: accentColor,
            borderColor: accentColor,
          }}
        >
          <span className="text-base">{icon}</span>
        </div>
        <p className="text-sm font-bold">{title}</p>
      </div>
      <div className="space-y-2 pl-2">
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="flex items-start gap-2">
            <div 
              className="w-5 h-5 rounded-md flex items-center justify-center border mt-0.5 shrink-0"
              style={{
                background: `${accentColor}40`,
                borderColor: accentColor,
              }}
            >
              <span className="text-[10px] font-bold">{index + 1}</span>
            </div>
            <p className="text-xs leading-relaxed flex-1">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
