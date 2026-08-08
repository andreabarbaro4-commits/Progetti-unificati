import './AnimatedBackground.css';

interface AnimatedBackgroundProps {
  /** Controls visibility without unmounting. Defaults to true. */
  visible?: boolean;
}

export function AnimatedBackground({ visible = true }: AnimatedBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        overflow: 'hidden',
        visibility: visible ? 'visible' : 'hidden',
      }}
    >
      {/* Blob 1 */}
      <div
        className="blob blob-1"
        style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          width: '80%',
          height: '60%',
          borderRadius: '45% 55% 60% 40% / 50% 45% 55% 50%',
          background: 'radial-gradient(circle, rgba(200,65,85,0.50), rgba(170,45,95,0.25))',
          filter: 'blur(55px)',
          willChange: 'transform',
          animation: 'blob-drift-1 10s ease-in-out infinite 0s',
        }}
      />

      {/* Blob 2 */}
      <div
        className="blob blob-2"
        style={{
          position: 'absolute',
          top: 0,
          left: '-15%',
          width: '50%',
          height: '70%',
          borderRadius: '55% 45% 50% 50% / 45% 55% 45% 55%',
          background: 'radial-gradient(circle, rgba(110,55,175,0.40), transparent)',
          filter: 'blur(65px)',
          willChange: 'transform',
          animation: 'blob-drift-2 8s ease-in-out infinite -3s',
        }}
      />

      {/* Blob 3 */}
      <div
        className="blob blob-3"
        style={{
          position: 'absolute',
          bottom: '5%',
          right: '3%',
          width: '11.25rem',
          height: '11.25rem',
          borderRadius: '50% 45% 55% 50% / 55% 50% 45% 50%',
          background: 'radial-gradient(circle, rgba(210,50,50,0.55), transparent)',
          filter: 'blur(28px)',
          willChange: 'transform',
          animation: 'blob-drift-3 7s ease-in-out infinite -6s',
        }}
      />

      {/* Blob 4 */}
      <div
        className="blob blob-4"
        style={{
          position: 'absolute',
          bottom: '-8%',
          left: '15%',
          width: '70%',
          height: '50%',
          borderRadius: '50% 55% 45% 50% / 45% 50% 55% 50%',
          background: 'radial-gradient(circle, rgba(80,160,230,0.50), rgba(120,70,210,0.30))',
          filter: 'blur(60px)',
          willChange: 'transform',
          animation: 'blob-drift-4 9s ease-in-out infinite -5s',
        }}
      />

      {/* Blob 5 */}
      <div
        className="blob blob-5"
        style={{
          position: 'absolute',
          top: '25%',
          right: '10%',
          width: '7rem',
          height: '9rem',
          borderRadius: '50% 45% 55% 45% / 55% 50% 45% 55%',
          background: 'radial-gradient(circle, rgba(255,230,100,0.35), transparent)',
          filter: 'blur(35px)',
          willChange: 'transform',
          animation: 'blob-drift-5 8s ease-in-out infinite -2s',
        }}
      />

      {/* Blob 6 */}
      <div
        className="blob blob-6"
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '5%',
          width: '8rem',
          height: '6rem',
          borderRadius: '45% 55% 50% 50% / 50% 45% 55% 50%',
          background: 'radial-gradient(circle, rgba(240,200,80,0.30), transparent)',
          filter: 'blur(30px)',
          willChange: 'transform',
          animation: 'blob-drift-4 9s ease-in-out infinite -7s',
        }}
      />

      {/* Blob 7 */}
      <div
        className="blob blob-7"
        style={{
          position: 'absolute',
          top: '40%',
          left: '20%',
          width: '9rem',
          height: '7rem',
          borderRadius: '55% 45% 50% 50% / 50% 55% 45% 55%',
          background: 'radial-gradient(circle, rgba(130,200,255,0.35), transparent)',
          filter: 'blur(32px)',
          willChange: 'transform',
          animation: 'blob-drift-6 7s ease-in-out infinite -4s',
        }}
      />

      {/* Blob 8 */}
      <div
        className="blob blob-8"
        style={{
          position: 'absolute',
          top: '10%',
          right: '25%',
          width: '6rem',
          height: '8rem',
          borderRadius: '50% 50% 45% 55% / 55% 45% 50% 50%',
          background: 'radial-gradient(circle, rgba(100,180,240,0.30), transparent)',
          filter: 'blur(38px)',
          willChange: 'transform',
          animation: 'blob-drift-5 10s ease-in-out infinite -8s',
        }}
      />
    </div>
  );
}
