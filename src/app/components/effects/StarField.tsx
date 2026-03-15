export function StarField({ darkMode = false }: { darkMode?: boolean }) {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0">
        {Array.from({ length: 38 }).map((_, i) => {
          const randomX = Math.random() * 100;
          const randomY = Math.random() * 100;
          const randomSize = Math.random() * 2.5 + 1.5;
          const randomDuration = Math.random() * 4 + 3;
          const randomDelay = Math.random() * 3;

          // Dark mode: mix of gold, silver, pale-gold for a financial night sky feel
          const darkColors = ['bg-amber-300', 'bg-slate-300', 'bg-stone-200'];
          const darkColor = darkColors[i % 3];

          return (
            <div
              key={i}
              className={`absolute rounded-full animate-pulse ${darkMode ? darkColor : 'bg-amber-400'}`}
              style={{
                left: `${randomX}%`,
                top: `${randomY}%`,
                width: `${randomSize}px`,
                height: `${randomSize}px`,
                opacity: darkMode ? Math.random() * 0.38 + 0.13 : Math.random() * 0.2 + 0.07,
                animationDuration: `${randomDuration}s`,
                animationDelay: `${randomDelay}s`,
              }}
            />
          );
        })}
      </div>
      {/* Galactic glow effects */}
      {darkMode ? (
        <>
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]" />
        </>
      ) : (
        <>
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-300/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-300/20 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-300/15 rounded-full blur-[120px]" />
        </>
      )}
    </div>
  );
}