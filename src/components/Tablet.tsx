import { JSX, useEffect, useRef } from "react"

function Tablet(): JSX.Element {
  const tabletRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let rafId = 0
    let targetProgress = 0
    let currentProgress = 0
    let isAnimating = false

    const getElementDocumentTop = (element: HTMLElement): number => {
      let top = 0
      let node: HTMLElement | null = element

      while (node) {
        top += node.offsetTop || 0
        node = node.offsetParent as HTMLElement | null
      }

      return top
    }

    const updateTargetProgress = () => {
      const element = tabletRef.current
      if (!element) return

      const viewportHeight = window.innerHeight
      const rect = element.getBoundingClientRect()

      if (rect.bottom <= 0) {
        targetProgress = 1
        currentProgress = 1
        element.style.setProperty("--tablet-progress", "1")
        return
      }

      if (rect.top >= viewportHeight) {
        targetProgress = 0
        currentProgress = 0
        element.style.setProperty("--tablet-progress", "0")
        return
      }

      const elementTop = getElementDocumentTop(element)
      const startScroll = elementTop - viewportHeight * 0.85
      const animationDistance = viewportHeight * 0.6
      const rawProgress =
        (window.scrollY - startScroll) / animationDistance

      targetProgress = Math.max(0, Math.min(1, rawProgress))
    }

    const renderProgress = () => {
      const element = tabletRef.current
      if (!element) {
        isAnimating = false
        return
      }

      currentProgress += (targetProgress - currentProgress) * 0.06

      element.style.setProperty(
        "--tablet-progress",
        currentProgress.toFixed(4)
      )

      if (Math.abs(targetProgress - currentProgress) > 0.0008) {
        rafId = requestAnimationFrame(renderProgress)
      } else {
        currentProgress = targetProgress
        element.style.setProperty(
          "--tablet-progress",
          currentProgress.toFixed(4)
        )
        isAnimating = false
        rafId = 0
      }
    }

    const scheduleUpdate = () => {
      updateTargetProgress()

      if (!isAnimating) {
        isAnimating = true
        rafId = requestAnimationFrame(renderProgress)
      }
    }

    updateTargetProgress()
    currentProgress = targetProgress

    const element = tabletRef.current
    if (element) {
      element.style.setProperty(
        "--tablet-progress",
        currentProgress.toFixed(4)
      )
    }

    window.addEventListener("scroll", scheduleUpdate, {
      passive: true,
    })
    window.addEventListener("smooth-scroll-update", scheduleUpdate)
    window.addEventListener("resize", scheduleUpdate)
    window.addEventListener("load", scheduleUpdate)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)

      window.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener(
        "smooth-scroll-update",
        scheduleUpdate
      )
      window.removeEventListener("resize", scheduleUpdate)
      window.removeEventListener("load", scheduleUpdate)
    }
  }, [])

  return (
    <section className="tablet-section">
      <span className="tablet-glow" aria-hidden="true" />
      <div ref={tabletRef} className="tablet-frame">
        <img
          src="/MuagisiaDemo.png"
          alt="Muagisia product demo on tablet"
          className="tablet-screen"
        />
      </div>
    </section>
  )
}

export default Tablet