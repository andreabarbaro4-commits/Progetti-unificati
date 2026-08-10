import planetLarge from '../../../assets/planet-large.svg'
import planetSmall from '../../../assets/planet-small.svg'

/** Decorative planet SVG elements rendered behind the wizard content.
 *  Positioned to match the Figma design (484:1744). */
export function BackgroundDecorations() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 0 }}
    >
      {/* Large planet — left: 284px, top: 23px, size: ~967px, rotated 87.42deg */}
      <img
        src={planetLarge}
        alt=""
        className="absolute"
        style={{
          left: '284px',
          top: '23px',
          width: '967px',
          height: '967px',
          transform: 'rotate(87.42deg)',
        }}
      />

      {/* Small planet — right-bottom area, size: ~104px, rotated 87.42deg */}
      <img
        src={planetSmall}
        alt=""
        className="absolute"
        style={{
          left: '1345px',
          top: '794px',
          width: '104px',
          height: '104px',
          transform: 'rotate(87.42deg)',
        }}
      />
    </div>
  )
}
