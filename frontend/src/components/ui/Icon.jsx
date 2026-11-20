import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  GripVertical,
  Heart,
  Home,
  LogIn,
  LogOut,
  MessageSquare,
  Moon,
  Palette,
  Sun,
  Trash2,
  Upload,
  X,
} from 'lucide-react'

// The app's icon set is Lucide. Icons are referenced by name so call sites stay simple.
const icons = {
  'arrow-right': ArrowRight,
  'arrow-left': ArrowLeft,
  close: X,
  heart: Heart,
  save: Bookmark,
  home: Home,
  grip: GripVertical,
  comment: MessageSquare,
  sun: Sun,
  moon: Moon,
  palette: Palette,
  'log-in': LogIn,
  'log-out': LogOut,
  upload: Upload,
  trash: Trash2,
}

export function Icon({ name, size = 16, filled = false, className = '' }) {
  const Glyph = icons[name]
  if (!Glyph) return null
  return (
    <Glyph
      size={size}
      strokeWidth={1.5}
      fill={filled ? 'currentColor' : 'none'}
      aria-hidden="true"
      className={className}
    />
  )
}
