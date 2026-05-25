import { toPng } from 'html-to-image'

export async function exportReceiptPngFromElement(element: HTMLElement) {
  return toPng(element, {
    cacheBust: true,
    pixelRatio: 3,
    backgroundColor: '#0a0b09',
  })
}
