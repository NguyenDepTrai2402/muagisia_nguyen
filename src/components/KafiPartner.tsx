import { JSX, useEffect, useRef } from "react"
import {
  ArrowUpRight,
  BookOpenText,
  Boxes,
  HandCoins,
  Infinity as InfinityIcon,
  TrendingUp,
} from "lucide-react"

type PartnerCardIconKey =
  | "trending-up"
  | "hand-coins"
  | "infinity"
  | "book-open-text"
  | "boxes"

type PartnerCard = {
  title: string
  description: string
  imageType: PartnerCardIconKey
}

type KafiPartnerProps = {
  onOpenApplicationModal: () => void
}

const partnerCardIcons: Record<
  PartnerCardIconKey,
  React.ComponentType<{ size?: number }>
> = {
  "trending-up": TrendingUp,
  "hand-coins": HandCoins,
  infinity: InfinityIcon,
  "book-open-text": BookOpenText,
  boxes: Boxes,
}

const partnerCards: PartnerCard[] = [
  {
    title: "Hoa hồng phí giao dịch",
    description: "Có thể lên đến 66%.",
    imageType: "trending-up",
  },
  {
    title: "Tự do linh hoạt",
    description:
      "Không phải đến công ty làm việc. Không áp KPIs, doanh số.",
    imageType: "hand-coins",
  },
  {
    title: "Thu nhập bứt phá",
    description:
      "Tăng thu nhập gấp nhiều lần không giới hạn.",
    imageType: "infinity",
  },
  {
    title: "Đào tạo chuyên sâu",
    description:
      "Trang bị kiến thức chuyên sâu về tài chính, chứng khoán và kỹ năng phân tích thị trường.",
    imageType: "book-open-text",
  },
  {
    title: "Sản phẩm đa dạng",
    description: "Đa dạng các sản phẩm tài chính bán kèm.",
    imageType: "boxes",
  },
]

const KafiPartner = ({
  onOpenApplicationModal,
}: KafiPartnerProps): JSX.Element => {
  const sectionRef = useRef<HTMLElement | null>(null)
  const titleMainRef = useRef<HTMLDivElement | null>(null)
  const titleSideRef = useRef<HTMLDivElement | null>(null)
  const cardRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    const titleMainNode = titleMainRef.current
    const titleSideNode = titleSideRef.current
    const cardNodes = cardRefs.current.filter(
      (node): node is HTMLElement => Boolean(node)
    )

    if (!titleMainNode || !titleSideNode || !cardNodes.length)
      return

    if (prefersReducedMotion) {
      titleMainNode.style.opacity = "1"
      titleMainNode.style.transform =
        "translate3d(0, 0, 0)"
      titleSideNode.style.opacity = "1"
      titleSideNode.style.transform =
        "translate3d(0, 0, 0)"
      cardNodes.forEach((cardNode) => {
        cardNode.style.opacity = "1"
        cardNode.style.transform =
          "translate3d(0, 0, 0)"
      })
      return
    }

    let rafId = 0
    let targetProgress = 0
    let currentProgress = 0
    let isAnimating = false

    const getElementDocumentTop = (
      element: HTMLElement
    ): number => {
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
      progress: number,
      {
        xOffset = 0,
        yOffset = 36,
      }: { xOffset?: number; yOffset?: number } = {}
    ): void => {
      const easedProgress = easeOutCubic(progress)
      const currentXOffset =
        (1 - easedProgress) * xOffset
      const currentYOffset =
        (1 - easedProgress) * yOffset

      node.style.opacity = easedProgress.toFixed(3)
      node.style.transform = `translate3d(${currentXOffset.toFixed(
        2
      )}px, ${currentYOffset.toFixed(2)}px, 0)`
    }

    const applySectionStyles = (
      progress: number
    ): void => {
      const titleProgress = Math.max(
        0,
        Math.min(1, progress / 0.4)
      )

      applyRevealStyles(titleMainNode, titleProgress, {
        xOffset: -54,
        yOffset: 0,
      })

      applyRevealStyles(titleSideNode, titleProgress, {
        xOffset: 54,
        yOffset: 0,
      })

      cardNodes.forEach((cardNode, index) => {
        const start = 0.18 + index * 0.14
        const end = start + 0.28
        const localProgress = Math.max(
          0,
          Math.min(
            1,
            (progress - start) / (end - start)
          )
        )

        if (index < 3) {
          applyRevealStyles(cardNode, localProgress)
          return
        }

        applyRevealStyles(cardNode, localProgress, {
          xOffset: index === 3 ? -48 : 48,
          yOffset: 0,
        })
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

      const elementTop =
        getElementDocumentTop(element)
      const startScroll =
        elementTop - viewportHeight * 0.78
      const animationDistance =
        viewportHeight * 1

      const rawProgress =
        (window.scrollY - startScroll) /
        animationDistance

      targetProgress = Math.max(
        0,
        Math.min(1, rawProgress)
      )
    }

    const renderProgress = (): void => {
      currentProgress +=
        (targetProgress - currentProgress) * 0.05

      applySectionStyles(currentProgress)

      if (
        Math.abs(targetProgress - currentProgress) >
        0.001
      ) {
        rafId = requestAnimationFrame(
          renderProgress
        )
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
        rafId = requestAnimationFrame(
          renderProgress
        )
      }
    }

    updateTargetProgress()
    currentProgress = targetProgress
    applySectionStyles(currentProgress)

    window.addEventListener("scroll", scheduleUpdate, {
      passive: true,
    })
    window.addEventListener(
      "smooth-scroll-update",
      scheduleUpdate
    )
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
    <section
      ref={sectionRef}
      className="features-section kafi-partner-section"
    >
      <div className="kafi-partner-title">
        <div
          ref={titleMainRef}
          className="kafi-partner-title-main"
        >
          <div className="kafi-partner-heading">
            <img
              src="/logo-kafi.svg"
              alt="Kafi"
              className="kafi-partner-logo"
            />
            <h1 className="features-h1">
              Trở thành Kafi Partner
            </h1>
          </div>
          <p className="kafi-partner-subtitle">
            Cơ hội cộng tác trong lĩnh vực tài chính với mô hình linh
            hoạt, minh bạch và nhiều dư địa tăng trưởng.
          </p>
        </div>

        <div
          ref={titleSideRef}
          className="kafi-partner-title-side"
        >
          <p className="description kafi-partner-description">
            Đồng hành cùng MuagiSIA và Kafi để giới thiệu các sản phẩm
            tài chính phù hợp tới cộng đồng nhà đầu tư, đồng thời xây
            dựng nguồn thu nhập chủ động từ chính mạng lưới của bạn.
          </p>
          <button
            type="button"
            className="landing-button kafi-partner-button"
            onClick={onOpenApplicationModal}
          >
            <span>Đăng ký cộng tác</span>
            <span className="landing-button-icon" aria-hidden="true">
              <ArrowUpRight />
            </span>
          </button>
        </div>
      </div>

      <div className="features-cards kafi-partner-cards">
        {partnerCards.map((card, index) => {
          const Icon = partnerCardIcons[card.imageType]

          return (
            <article
              key={card.title}
              ref={(node) => {
                cardRefs.current[index] = node
              }}
              className="feature-card kafi-partner-card"
            >
              <div className="kafi-partner-card-frame">
                <div className="kafi-partner-card-media kafi-partner-card-artwork">
                  <span className="kafi-partner-card-artwork-glow" />
                  <span className="kafi-partner-card-artwork-badge">
                    <Icon />
                  </span>
                </div>
              </div>

              <div className="kafi-partner-card-body">
                <h2 className="feature-card-title kafi-partner-card-title">
                  {card.title}
                </h2>
                <p className="feature-card-description">
                  {card.description}
                </p>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default KafiPartner
