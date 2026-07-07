import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io'
import { HiOutlineUserCircle } from 'react-icons/hi2'
import { BsGrid3X3Gap } from 'react-icons/bs'
import { FlowleeLogo } from './FlowleeLogo'

interface TopNavigationProps {
  /** Label shown next to the back arrows, e.g. "Profilo/Lavoro". Omit to hide it. */
  leftLabel?: string
  /** Called when the back arrows are clicked. Omit to make them non-interactive. */
  onBack?: () => void
}

function ArrowsContainer({ onBack }: { onBack?: () => void }) {
  return (
    <div
      className="arrows-container"
      onClick={onBack}
      style={onBack ? { cursor: 'pointer' } : undefined}
    >
      <IoIosArrowDown className="top-icon" />
      <IoIosArrowUp className="top-icon" />
    </div>
  )
}

function RightIcons() {
  return (
    <div className="right-icons">
      <BsGrid3X3Gap className="top-icon" />
      <HiOutlineUserCircle className="top-icon" />
    </div>
  )
}

/**
 * Shared header bar used by the steps that come after the welcome screen.
 * Without a `leftLabel` (role step only), the icons sit directly on the
 * bar and the right icons live inside the centered logo block. With a
 * `leftLabel`, the arrows and label are grouped in `.nav-left` and the
 * right icons become their own sibling block. Both variants mirror the
 * pre-refactor markup exactly — the `.nav-left` class is absolutely
 * positioned in CSS, so using it unconditionally shifts the layout.
 */
export function TopNavigation({ leftLabel, onBack }: TopNavigationProps) {
  if (!leftLabel) {
    return (
      <div className="top-navigation">
        <ArrowsContainer onBack={onBack} />
        <div className="nav-center">
          <FlowleeLogo />
          <RightIcons />
        </div>
      </div>
    )
  }

  return (
    <div className="top-navigation">
      <div className="nav-left">
        <ArrowsContainer onBack={onBack} />
        <div className="profilo-lavoro-container">
          <span>{leftLabel}</span>
        </div>
      </div>
      <div className="nav-center">
        <FlowleeLogo />
      </div>
      <RightIcons />
    </div>
  )
}
