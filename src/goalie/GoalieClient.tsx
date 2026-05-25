import { useCallback, useEffect, type MouseEvent } from 'react'
import { PolarEmbedCheckout } from '@polar-sh/checkout/embed'
import { GOALIE_POLAR_CHECKOUT_URL } from './polar'

function goToThankYouPage() {
  window.location.assign('/goalie/thank-you')
}

function goToCheckout() {
  window.location.assign(GOALIE_POLAR_CHECKOUT_URL)
}

export default function GoalieClient() {
  const startDownload = useCallback(async (event: MouseEvent) => {
    event.preventDefault()

    try {
      const checkout = await PolarEmbedCheckout.create(GOALIE_POLAR_CHECKOUT_URL, { theme: 'light' })
      checkout.addEventListener('success', (successEvent) => {
        successEvent.preventDefault()
        checkout.close()
        goToThankYouPage()
      })
    } catch {
      // Embed blocked or unavailable — full-page checkout always works.
      goToCheckout()
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('checkout') === 'success') {
      goToThankYouPage()
      return
    }

    const buttons = document.querySelectorAll<HTMLElement>('[data-goalie-download]')
    const onClick = (event: Event) => {
      void startDownload(event as unknown as MouseEvent)
    }

    buttons.forEach((button) => button.addEventListener('click', onClick))
    return () => buttons.forEach((button) => button.removeEventListener('click', onClick))
  }, [startDownload])

  return null
}

export { GOALIE_POLAR_CHECKOUT_URL, GOALIE_SUCCESS_URL } from './polar'
