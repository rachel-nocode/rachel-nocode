import type { MouseEvent } from 'react'
import { PlatformIconPair } from './PlatformIcons'

export const POLAR_CHECKOUT_URL =
  'https://buy.polar.sh/polar_cl_TF2FMLN9mPYUxBtKhXSPZHJotGeO8ICDeFEA124wOvt'

type PolarDownloadButtonProps = {
  onClick: (event: MouseEvent) => void
  className?: string
  iconSize?: number
  showIcons?: boolean
}

export function PolarDownloadButton({
  onClick,
  className = 'btn-primary',
  iconSize = 15,
  showIcons = true,
}: PolarDownloadButtonProps) {
  return (
    <a className={className} href={POLAR_CHECKOUT_URL} onClick={onClick}>
      {showIcons ? <PlatformIconPair size={iconSize} /> : null}
      Download
    </a>
  )
}
