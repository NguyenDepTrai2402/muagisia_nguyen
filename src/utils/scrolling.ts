let scrollAnimationId: number = 0

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function easeInOutCubic(value: number): number {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2
}

export function getElementDocumentTop(element: Element | null): number {
  let top: number = 0
  let node: Element | null = element

  while (node) {
    const htmlNode = node as HTMLElement
    top += htmlNode.offsetTop || 0
    node = htmlNode.offsetParent as Element | null
  }

  return top
}

export function stopAnimatedWindowScroll(): void {
  if (scrollAnimationId) {
    cancelAnimationFrame(scrollAnimationId)
    scrollAnimationId = 0
  }
}

export function animateWindowScrollTo(targetTop: number): void {
  if (typeof window === "undefined") return

  const startTop: number = window.scrollY
  const distance: number = targetTop - startTop

  stopAnimatedWindowScroll()

  if (Math.abs(distance) < 1) {
    window.scrollTo({ top: targetTop, behavior: "auto" })
    return
  }

  const prefersReducedMotion: boolean = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches

  if (prefersReducedMotion) {
    window.scrollTo({ top: targetTop, behavior: "auto" })
    return
  }

  const duration: number = clamp(Math.abs(distance) * 0.45, 540, 920)
  const startTime: number = performance.now()

  const step = (now: number): void => {
    const progress: number = Math.min(1, (now - startTime) / duration)
    const easedProgress: number = easeInOutCubic(progress)
    const nextTop: number = startTop + distance * easedProgress

    window.scrollTo({ top: nextTop, behavior: "auto" })

    if (progress < 1) {
      scrollAnimationId = requestAnimationFrame(step)
    } else {
      scrollAnimationId = 0
    }
  }

  scrollAnimationId = requestAnimationFrame(step)
}

export function scrollToTargetId(
  targetId: string,
  { extraOffset = 12 }: { extraOffset?: number } = {}
): boolean {
  if (typeof window === "undefined") return false

  const target = document.getElementById(targetId)
  if (!target) return false

  const header = document.querySelector(".site-header") as HTMLElement | null
  const headerOffset: number =
    header ? header.getBoundingClientRect().height + extraOffset : 0

  const targetTop: number = Math.max(
    0,
    getElementDocumentTop(target) - headerOffset
  )

  animateWindowScrollTo(targetTop)
  window.history.replaceState(null, "", `#${targetId}`)

  return true
}