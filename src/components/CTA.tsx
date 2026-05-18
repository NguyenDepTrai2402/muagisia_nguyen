import { useEffect, useRef } from "react"
import { ArrowUpRight } from "lucide-react"
import { JSX } from "react/jsx-runtime"

const CTA = (): JSX.Element => {
  const sectionRef = useRef<HTMLElement | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    const sectionNode = sectionRef.current
    const cardNode = cardRef.current

    if (!sectionNode || !cardNode) return

    if (prefersReducedMotion) {
      cardNode.style.opacity = "1"
      cardNode.style.transform = "translate3d(0, 0, 0)"
      return
    }

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

    const easeOutCubic = (value: number): number =>
      1 - Math.pow(1 - value, 3)

    const applyRevealStyles = (progress: number): void => {
      const easedProgress = easeOutCubic(progress)
      const yOffset = (1 - easedProgress) * 42

      cardNode.style.opacity = easedProgress.toFixed(3)
      cardNode.style.transform = `translate3d(0, ${yOffset.toFixed(2)}px, 0)`
    }

    const updateTargetProgress = (): void => {
      const viewportHeight = window.innerHeight
      const rect = sectionNode.getBoundingClientRect()

      if (rect.bottom <= 0) {
        targetProgress = 1
        currentProgress = 1
        applyRevealStyles(1)
        return
      }

      if (rect.top >= viewportHeight) {
        targetProgress = 0
        currentProgress = 0
        applyRevealStyles(0)
        return
      }

      const elementTop = getElementDocumentTop(sectionNode)
      const startScroll = elementTop - viewportHeight * 0.82
      const animationDistance = viewportHeight * 0.48
      const rawProgress =
        (window.scrollY - startScroll) / animationDistance

      targetProgress = Math.max(0, Math.min(1, rawProgress))
    }

    const renderProgress = (): void => {
      currentProgress += (targetProgress - currentProgress) * 0.06
      applyRevealStyles(currentProgress)

      if (Math.abs(targetProgress - currentProgress) > 0.001) {
        rafId = requestAnimationFrame(renderProgress)
      } else {
        currentProgress = targetProgress
        applyRevealStyles(currentProgress)
        isAnimating = false
        rafId = 0
      }
    }

    const scheduleUpdate = (): void => {
      updateTargetProgress()

      if (!isAnimating) {
        isAnimating = true
        rafId = requestAnimationFrame(renderProgress)
      }
    }

    updateTargetProgress()
    currentProgress = targetProgress
    applyRevealStyles(currentProgress)

    window.addEventListener("scroll", scheduleUpdate, { passive: true })
    window.addEventListener("smooth-scroll-update", scheduleUpdate)
    window.addEventListener("resize", scheduleUpdate)
    window.addEventListener("load", scheduleUpdate)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener("smooth-scroll-update", scheduleUpdate)
      window.removeEventListener("resize", scheduleUpdate)
      window.removeEventListener("load", scheduleUpdate)
    }
  }, [])

  return (
    <section ref={sectionRef} className="cta-section">
      <div ref={cardRef} className="cta-card">
        <h1 className="features-h1 cta-title">
          Sẵn sàng nắm lấy cơ hội cùng{" "}
          <span className="textHighlight">MuagiSIA</span>?
        </h1>
        <p className="description textCenter cta-description">
          Đồng hành ngay cùng chúng tôi để nắm bắt những cơ hội đầu tư tốt
          nhất, tối ưu lợi nhuận và gia tăng tài sản ổn định và bền vững.
        </p>
        <button type="button" className="landing-button cta-button">
          <span>Tham gia ngay</span>
          <span className="landing-button-icon" aria-hidden="true">
            <ArrowUpRight />
          </span>
        </button>
      </div>
    </section>
  )
}

export default CTA