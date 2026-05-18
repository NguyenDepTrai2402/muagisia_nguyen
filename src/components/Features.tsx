import { JSX, useEffect, useRef } from "react"
import {
  ChartCandlestick,
  LayoutPanelLeft,
  Zap,
} from "lucide-react"

type FeatureCard = {
  icon: React.ComponentType<{ size?: number }>
  title: string
  description: string
}

const featureCards: FeatureCard[] = [
  {
    icon: Zap,
    title: "Dữ liệu Real-time",
    description:
      "Cập nhật liên tục biến động thị trường, khối ngoại, tự doanh và thanh khoản. Không bỏ lỡ bất kỳ cơ hội nào.",
  },
  {
    icon: ChartCandlestick,
    title: "Phân tích chuyên sâu",
    description:
      "Tích hợp đầy đủ các chỉ báo kỹ thuật mạnh mẽ, Heatmap dòng tiền và bộ lọc cổ phiếu thông minh.",
  },
  {
    icon: LayoutPanelLeft,
    title: "Tùy biến linh hoạt",
    description:
      "Thiết lập không gian làm việc theo phong cách riêng của bạn. Giao diện trực quan, mượt mà trên mọi thiết bị.",
  },
]

const Features = (): JSX.Element => {
  const sectionRef = useRef<HTMLElement | null>(null)
  const titleRef = useRef<HTMLDivElement | null>(null)
  const cardRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    const titleNode = titleRef.current
    const cardNodes = cardRefs.current.filter(
      (node): node is HTMLElement => Boolean(node)
    )

    if (!titleNode || !cardNodes.length) return

    if (prefersReducedMotion) {
      titleNode.style.opacity = "1"
      titleNode.style.transform = "translate3d(0, 0, 0)"
      cardNodes.forEach((cardNode) => {
        cardNode.style.opacity = "1"
        cardNode.style.transform = "translate3d(0, 0, 0)"
      })
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

    const applyRevealStyles = (
      node: HTMLElement,
      progress: number
    ): void => {
      const easedProgress = easeOutCubic(progress)
      const yOffset = (1 - easedProgress) * 36

      node.style.opacity = easedProgress.toFixed(3)
      node.style.transform = `translate3d(0, ${yOffset.toFixed(
        2
      )}px, 0)`
    }

    const applySectionStyles = (progress: number): void => {
      const titleProgress = Math.max(
        0,
        Math.min(1, progress / 0.4)
      )
      applyRevealStyles(titleNode, titleProgress)

      cardNodes.forEach((cardNode, index) => {
        const start = 0.18 + index * 0.14
        const end = start + 0.28
        const localProgress = Math.max(
          0,
          Math.min(1, (progress - start) / (end - start))
        )

        applyRevealStyles(cardNode, localProgress)
      })
    }

    const updateTargetProgress = (): void => {
      const element = sectionRef.current
      if (!element) return

      const viewportHeight = window.innerHeight
      const rect = element.getBoundingClientRect()

      if (rect.bottom <= 0) {
        targetProgress = 1
        currentProgress = 1
        applySectionStyles(1)
        return
      }

      if (rect.top >= viewportHeight) {
        targetProgress = 0
        currentProgress = 0
        applySectionStyles(0)
        return
      }

      const elementTop = getElementDocumentTop(element)
      const startScroll = elementTop - viewportHeight * 0.78
      const animationDistance = viewportHeight * 1
      const rawProgress =
        (window.scrollY - startScroll) / animationDistance

      targetProgress = Math.max(0, Math.min(1, rawProgress))
    }

    const renderProgress = (): void => {
      currentProgress += (targetProgress - currentProgress) * 0.05
      applySectionStyles(currentProgress)

      if (Math.abs(targetProgress - currentProgress) > 0.001) {
        rafId = requestAnimationFrame(renderProgress)
      } else {
        currentProgress = targetProgress
        applySectionStyles(currentProgress)
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
    applySectionStyles(currentProgress)

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
    <section ref={sectionRef} className="features-section">
      <div ref={titleRef} className="features-title">
        <h1 className="features-h1">
          Tại sao nên chọn{" "}
          <span className="textHighlight">MuagiSIA</span>?
        </h1>
        <p className="description textCenter">
          Đồng hành cùng khách hàng xây dựng phương pháp đầu tư và
          quản lý vốn cá nhân hiệu quả, bền vững trên nền tảng công
          nghệ hiện đại.
        </p>
      </div>

      <div
        className="features-cards"
        aria-label="MuagiSIA features"
      >
        {featureCards.map((feature, index) => {
          const Icon = feature.icon

          return (
            <article
              key={feature.title}
              ref={(node) => {
                cardRefs.current[index] = node
              }}
              className="feature-card"
            >
              <span
                className="feature-card-icon"
                aria-hidden="true"
              >
                <Icon />
              </span>
              <h2 className="feature-card-title">
                {feature.title}
              </h2>
              <p className="feature-card-description">
                {feature.description}
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default Features