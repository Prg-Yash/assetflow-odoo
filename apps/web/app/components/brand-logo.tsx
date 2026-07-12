import Link from 'next/link'

type BrandLogoProps = {
  href?: string
  size?: number
  showText?: boolean
  className?: string
  textClassName?: string
  bordered?: boolean
}

export function BrandLogo({
  href = '/',
  size = 40,
  showText = true,
  className = '',
  textClassName = '',
  bordered = true,
}: BrandLogoProps) {
  const badge = (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-white/95 dark:bg-white/90 ${
        bordered ? 'border border-white/30 dark:border-white/20 shadow-sm' : ''
      }`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <img
        src="/AF.png"
        alt=""
        className="h-[68%] w-[68%] object-contain"
        draggable={false}
      />
    </span>
  )

  return (
    <Link href={href} className={`inline-flex items-center gap-3 ${className}`} aria-label="AssetFlow home">
      {badge}
      {showText && (
        <span className={`text-lg font-semibold tracking-tight ${textClassName}`}>
          AssetFlow
        </span>
      )}
    </Link>
  )
}

export default BrandLogo
