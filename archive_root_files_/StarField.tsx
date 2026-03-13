export function StarField({ darkMode = false }: { darkMode?: boolean }) {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => {
          const randomX = Math.random() * 100;
          const randomY = Math.random() * 100;
          const randomSize = Math.random() * 3 + 1;
          const randomDuration = Math.random() * 3 + 2;
          const randomDelay = Math.random() * 2;

          return (
            <div
              key={i}
              className={`absolute rounded-full animate-pulse ${darkMode ? 'bg-white' : 'bg-violet-400'}`}
              style={{
                left: `${randomX}%`,
                top: `${randomY}%`,
                width: `${randomSize}px`,
                height: `${randomSize}px`,
                opacity: darkMode ? Math.random() * 0.5 + 0.2 : Math.random() * 0.3 + 0.1,
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