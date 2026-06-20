type DustProps = { count?: number };

export function Dust({ count = 36 }: DustProps) {
  const particles = Array.from({ length: count }, (_, i) => {
    const left = (i * 97) % 100;
    const delay = (i * 0.37) % 9;
    const size = (i % 2) + 1;
    const duration = 7 + ((i * 13) % 6);
    return { left, delay, size, duration, key: i };
  });

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {particles.map((p) => (
        <span
          key={p.key}
          className="dust-particle"
          style={{
            left: `${p.left}%`,
            bottom: `-8px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
