import avatar3d from '../../../assets/avatar-3d.png'

interface OrgTypeStepProps {
  onNext: () => void
  onFreelance: () => void
}

export function OrgTypeStep({ onNext, onFreelance }: OrgTypeStepProps) {
  return (
    <div className="flex flex-1 w-full min-h-0">
      {/* Left side: heading at top, buttons at bottom */}
      <div className="flex flex-col justify-between flex-1 min-w-0 min-h-0 pr-4">
        <h1
          className="font-semibold leading-[1.1] text-black"
          style={{ fontSize: 'clamp(2rem, 4.5vw, 4.5rem)' }}
        >
          Iniziamo dalle basi.
          <br />
          Lavori con un&apos;azienda
          <br />o sei un freelance?
        </h1>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onNext}
            className="bg-black text-white border border-transparent rounded-[1.5rem] px-10 py-4 text-xl font-medium cursor-pointer hover:bg-gray-800 transition-colors"
          >
            Company
          </button>
          <button
            type="button"
            onClick={onFreelance}
            className="border border-black text-black rounded-[1.5rem] px-10 py-4 text-xl font-medium cursor-pointer bg-transparent hover:bg-gray-50 transition-colors"
          >
            Freelance
          </button>
        </div>
      </div>

      {/* Right side: avatar with vh-based height so it actually fills space */}
      <div className="hidden md:flex items-center justify-center w-[40%] flex-shrink-0">
        <img
          src={avatar3d}
          alt="Flowlee avatar"
          style={{ height: '22rem', width: 'auto', objectFit: 'contain' }}
        />
      </div>
    </div>
  )
}
