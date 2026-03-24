interface Props {
  count: number;
  activeIndex: number;
}

export function ScreenDots({ count, activeIndex }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        paddingTop: 8,
        paddingBottom: 8,
        flexShrink: 0,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 6,
            width: i === activeIndex ? 18 : 6,
            borderRadius: 99,
            background: i === activeIndex
              ? 'rgba(124,58,237,0.9)'
              : 'rgba(255,255,255,0.30)',
            transition: 'width 0.25s ease, background 0.25s ease',
          }}
        />
      ))}
    </div>
  );
}
