type PlatformIconProps = {
  size?: number
  className?: string
}

export function MacPlatformIcon({ size = 15, className }: PlatformIconProps) {
  return (
    <img
      src="/maxxtoken/platform/mac.png"
      alt=""
      width={size}
      height={size}
      className={className}
      draggable={false}
    />
  )
}

export function WindowsPlatformIcon({ size = 15, className }: PlatformIconProps) {
  return (
    <img
      src="/maxxtoken/platform/windows.png"
      alt=""
      width={size}
      height={size}
      className={className}
      draggable={false}
    />
  )
}

export function PlatformIconPair({ size = 15 }: { size?: number }) {
  return (
    <span className="dl-platform-icons" aria-hidden="true">
      <MacPlatformIcon size={size} />
      <WindowsPlatformIcon size={size} />
    </span>
  )
}
