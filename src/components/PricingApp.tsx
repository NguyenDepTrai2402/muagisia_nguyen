"use client"
import { useEffect, useRef, useState } from "react"
import { ArrowUpRight, ChevronDown, CircleCheck } from "lucide-react"

type BillingOption = {
  value: string
  label: string
  displayLabel?: string
  months: number
  discountMultiplier: number
}

type PricingCard = {
  tier: string
  description: string
  buttonLabel: string
  iconTone: string
  perks: string[]
}

const billingOptions: BillingOption[] = [
  { value: "1", label: "1 tháng", months: 1, discountMultiplier: 1 },
  { value: "3", label: "3 tháng", months: 3, discountMultiplier: 1 },
  { value: "6", label: "6 tháng", months: 6, discountMultiplier: 1 },
  {
    value: "12",
    label: "12 tháng",
    displayLabel: "12 tháng",
    months: 12,
    discountMultiplier: 0.8,
  },
]

const pricingCards: PricingCard[] = [
  {
    tier: "Gói cơ bản",
    description: "Bắt đầu từ con số 0.",
    buttonLabel: "Gói hiện tại",
    iconTone: "muted",
    perks: [
      "Sử dụng tín hiệu mua bán/ chỉ báo độc quyền (có giới hạn)",
      "Hệ thống AI hỏi đáp & phân tích cổ phiếu (có giới hạn)",
      "Tư vấn cơ cấu danh mục & Room Cộng Đồng",
      "Tin tức & báo cáo khuyến nghị chất lượng",
      "Sự kiện, nhật ký trên biểu đồ (Real-time)",
      "Truy cập danh mục trading/đầu tư tháng (giới hạn)",
    ],
  },
  {
    tier: "Gói chuyên sâu",
    description: "Tiết kiệm 20% khi đăng ký gói 12 tháng.",
    buttonLabel: "Nâng cấp ngay",
    iconTone: "highlight",
    perks: [
      "Tất cả tín hiệu mua bán & chỉ báo độc quyền",
      "Hệ thống AI hỏi đáp & phân tích (Không giới hạn)",
      "Tư vấn cơ cấu danh mục & Room VIP khách hàng",
      "Tin tức & báo cáo khuyến nghị chất lượng",
      "Sự kiện, nhật ký trên biểu đồ (Real-time)",
      "Truy cập danh mục trading/đầu tư (Không giới hạn)",
    ],
  },
]

const priceFormatter = new Intl.NumberFormat("vi-VN")
const baseMonthlyPrice = 279000

function formatPrice(amount: number): string {
  return `${priceFormatter.format(amount)}đ`
}

function PricingApp(): React.ReactElement {
  const sectionRef = useRef<HTMLElement | null>(null)
  const titleRef = useRef<HTMLDivElement | null>(null)
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  const priceAnimationFrameRef = useRef<number>(0)
  const displayedPriceRef = useRef<number>(baseMonthlyPrice)
  const isInitialPriceRenderRef = useRef<boolean>(true)

  const [billingPeriod, setBillingPeriod] = useState<string>("1")
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)
  const [displayedPrice, setDisplayedPrice] =
    useState<number>(baseMonthlyPrice)
  const [isPriceAnimating, setIsPriceAnimating] =
    useState<boolean>(false)

  const selectedBilling =
    billingOptions.find((option) => option.value === billingPeriod) ??
    billingOptions[0]

  const discountedPrice = Math.round(
    baseMonthlyPrice *
      selectedBilling.months *
      selectedBilling.discountMultiplier
  )

  useEffect(() => {
    displayedPriceRef.current = displayedPrice
  }, [displayedPrice])

  useEffect(() => {
    if (!isDropdownOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isDropdownOpen])

  useEffect(() => {
    if (isInitialPriceRenderRef.current) {
      isInitialPriceRenderRef.current = false
      setDisplayedPrice(discountedPrice)
      displayedPriceRef.current = discountedPrice
      return
    }

    if (priceAnimationFrameRef.current) {
      cancelAnimationFrame(priceAnimationFrameRef.current)
      priceAnimationFrameRef.current = 0
    }

    if (displayedPriceRef.current === discountedPrice) {
      setDisplayedPrice(discountedPrice)
      displayedPriceRef.current = discountedPrice
      setIsPriceAnimating(false)
      return
    }

    const startValue = displayedPriceRef.current
    const duration = 650
    let startTime = 0

    const easeOutCubic = (value: number) =>
      1 - Math.pow(1 - value, 3)

    setIsPriceAnimating(true)

    const animatePrice = (timestamp: number) => {
      if (!startTime) startTime = timestamp

      const progress = Math.min(
        (timestamp - startTime) / duration,
        1
      )
      const easedProgress = easeOutCubic(progress)

      const nextValue = Math.round(
        startValue +
          (discountedPrice - startValue) * easedProgress
      )

      setDisplayedPrice(nextValue)
      displayedPriceRef.current = nextValue

      if (progress < 1) {
        priceAnimationFrameRef.current =
          requestAnimationFrame(animatePrice)
      } else {
        setDisplayedPrice(discountedPrice)
        displayedPriceRef.current = discountedPrice
        setIsPriceAnimating(false)
        priceAnimationFrameRef.current = 0
      }
    }

    priceAnimationFrameRef.current =
      requestAnimationFrame(animatePrice)

    return () => {
      if (priceAnimationFrameRef.current) {
        cancelAnimationFrame(priceAnimationFrameRef.current)
      }
    }
  }, [discountedPrice])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    const titleNode = titleRef.current
    const cardNodes = cardRefs.current.filter(
      (node): node is HTMLElement => Boolean(node)
    )

    if (!titleNode || !cardNodes.length) return

    const applyRevealStyles = (
      node: HTMLElement,
      progress: number
    ): void => {
      const easedProgress = 1 - Math.pow(1 - progress, 3)
      const yOffset = (1 - easedProgress) * 36

      node.style.opacity = easedProgress.toFixed(3)
      node.style.transform = `translate3d(0, ${yOffset.toFixed(
        2
      )}px, 0)`
    }

    if (prefersReducedMotion) {
      applyRevealStyles(titleNode, 1)
      cardNodes.forEach((cardNode) => applyRevealStyles(cardNode, 1))
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

    const applySectionStyles = (progress: number): void => {
      const titleProgress = Math.max(0, Math.min(1, progress / 0.4))
      applyRevealStyles(titleNode, titleProgress)

      cardNodes.forEach((cardNode, index) => {
        const start = 0.18 + index * 0.16
        const end = start + 0.32
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
      const rawProgress = (window.scrollY - startScroll) / viewportHeight

      targetProgress = Math.max(0, Math.min(1, rawProgress))
    }

    const renderProgress = (): void => {
      currentProgress += (targetProgress - currentProgress) * 0.06
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
    <section ref={sectionRef} className="pricing-section">
      <div ref={titleRef} className="pricing-title">
        <h1 className="features-h1">
          Đầu tư bài bản <br />
          Giao dịch có hệ thống
        </h1>
        <p className="description textCenter">
          Chọn gói phù hợp với hành trình đầu tư của bạn, từ trải
          nghiệm cơ bản đến bộ công cụ phân tích chuyên sâu.
        </p>
      </div>

      <div className="pricing-cards">
        {pricingCards.map((card, index) => {
          const isPaidCard = index === 1

          return (
            <article
              key={card.tier}
              ref={(node: HTMLElement | null) => {
                cardRefs.current[index] = node
              }}
              className={`pricing-card ${
                isPaidCard ? "pricing-card--featured" : ""
              }`.trim()}
            >
              <div className="pricing-card-top">
                <div className="pricing-card-header">
                  <h2 className="pricing-card-tier">{card.tier}</h2>

                  {isPaidCard && (
                    <div
                      ref={dropdownRef}
                      className={`pricing-dropdown ${
                        isDropdownOpen ? "pricing-dropdown--open" : ""
                      }`.trim()}
                    >
                      <button
                        type="button"
                        className="pricing-select-button"
                        aria-expanded={isDropdownOpen}
                        onClick={() =>
                          setIsDropdownOpen((prev) => !prev)
                        }
                      >
                        <span>
                          {selectedBilling.displayLabel ??
                            selectedBilling.label}
                        </span>
                        <span
                          className="pricing-select-icon"
                          aria-hidden="true"
                        >
                          <ChevronDown />
                        </span>
                      </button>

                      <div
                        className={`pricing-dropdown-menu ${
                          isDropdownOpen
                            ? "pricing-dropdown-menu--open"
                            : ""
                        }`.trim()}
                      >
                        {billingOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className={`pricing-dropdown-item ${
                              option.value === billingPeriod
                                ? "pricing-dropdown-item--active"
                                : ""
                            }`.trim()}
                            onClick={() => {
                              setBillingPeriod(option.value)
                              setIsDropdownOpen(false)
                            }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pricing-card-price-block">
                  <div className="pricing-card-price-row">
                    <span
                      className="pricing-card-price"
                      aria-live={isPriceAnimating ? "polite" : "off"}
                    >
                      {isPaidCard
                        ? formatPrice(displayedPrice)
                        : "Miễn phí"}
                    </span>
                    {isPaidCard && (
                      <span className="pricing-card-duration">
                        / {selectedBilling.label}
                      </span>
                    )}
                  </div>
                  <p className="pricing-card-description">
                    {card.description}
                  </p>
                </div>
              </div>

              <ul className="pricing-card-perks">
                {card.perks.map((perk) => (
                  <li key={perk} className="pricing-card-perk">
                    <CircleCheck
                      className={`pricing-card-perk-icon pricing-card-perk-icon--${card.iconTone}`}
                    />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`landing-button pricing-card-button ${
                  isPaidCard ? "" : "pricing-card-button--static"
                }`.trim()}
              >
                <span>{card.buttonLabel}</span>
                {isPaidCard && (
                  <span
                    className="landing-button-icon"
                    aria-hidden="true"
                  >
                    <ArrowUpRight />
                  </span>
                )}
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default PricingApp
