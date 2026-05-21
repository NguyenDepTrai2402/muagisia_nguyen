import { JSX, useEffect, useRef, useState } from "react"
import {
  ArrowUpRight,
  ChevronDown,
  CircleCheck,
} from "lucide-react"

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
  iconTone: "muted" | "highlight"
  perks: string[]
}

const billingOptions: BillingOption[] = [
  {
    value: "1",
    label: "1 tháng",
    months: 1,
    discountMultiplier: 1,
  },
  {
    value: "3",
    label: "3 tháng",
    months: 3,
    discountMultiplier: 1,
  },
  {
    value: "6",
    label: "6 tháng",
    months: 6,
    discountMultiplier: 1,
  },
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
      "Tham gia khóa học đầu tư cơ bản",
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
      "Các khóa học đầu tư từ cơ bản đến nâng cao",
    ],
  },
]

const priceFormatter = new Intl.NumberFormat("vi-VN")
const baseMonthlyPrice = 279000

function formatPrice(amount: number): string {
  return `${priceFormatter.format(amount)}đ`
}

function PricingApp(): JSX.Element {
  const sectionRef = useRef<HTMLElement | null>(null)
  const titleRef = useRef<HTMLDivElement | null>(null)
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  const priceAnimationFrameRef = useRef<number>(0)
  const displayedPriceRef = useRef<number>(baseMonthlyPrice)
  const isInitialPriceRenderRef = useRef<boolean>(true)

  const [billingPeriod, setBillingPeriod] = useState<string>("1")
  const [isDropdownOpen, setIsDropdownOpen] =
    useState<boolean>(false)
  const [displayedPrice, setDisplayedPrice] =
    useState<number>(baseMonthlyPrice)
  const [isPriceAnimating, setIsPriceAnimating] =
    useState<boolean>(false)

  const selectedBilling =
    billingOptions.find(
      (option) => option.value === billingPeriod
    ) ?? billingOptions[0]

  const discountedPrice = Math.round(
    baseMonthlyPrice *
      selectedBilling.months *
      selectedBilling.discountMultiplier
  )

  useEffect(() => {
    displayedPriceRef.current = displayedPrice
  }, [displayedPrice])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    const titleNode = titleRef.current
    const cardNodes = cardRefs.current.filter(
      Boolean
    ) as HTMLElement[]

    if (!titleNode || !cardNodes.length) return

    if (prefersReducedMotion) {
      titleNode.style.opacity = "1"
      titleNode.style.transform = "translate3d(0,0,0)"

      cardNodes.forEach((cardNode) => {
        cardNode.style.opacity = "1"
        cardNode.style.transform = "translate3d(0,0,0)"
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

      const startScroll =
        elementTop - viewportHeight * 0.78

      const animationDistance = viewportHeight * 1

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

    window.addEventListener(
      "smooth-scroll-update",
      scheduleUpdate
    )

    window.addEventListener("resize", scheduleUpdate)
    window.addEventListener("load", scheduleUpdate)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)

      window.removeEventListener(
        "scroll",
        scheduleUpdate
      )

      window.removeEventListener(
        "smooth-scroll-update",
        scheduleUpdate
      )

      window.removeEventListener(
        "resize",
        scheduleUpdate
      )

      window.removeEventListener("load", scheduleUpdate)
    }
  }, [])

  useEffect(() => {
    if (!isDropdownOpen) return

    const handlePointerDown = (
      event: MouseEvent
    ): void => {
      if (
        !dropdownRef.current?.contains(
          event.target as Node
        )
      ) {
        setIsDropdownOpen(false)
      }
    }

    const handleEscape = (
      event: KeyboardEvent
    ): void => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown
    )

    document.addEventListener(
      "keydown",
      handleEscape
    )

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      )

      document.removeEventListener(
        "keydown",
        handleEscape
      )
    }
  }, [isDropdownOpen])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (isInitialPriceRenderRef.current) {
      isInitialPriceRenderRef.current = false

      setDisplayedPrice(discountedPrice)
      displayedPriceRef.current = discountedPrice

      return
    }

    if (priceAnimationFrameRef.current) {
      cancelAnimationFrame(
        priceAnimationFrameRef.current
      )

      priceAnimationFrameRef.current = 0
    }

    if (
      prefersReducedMotion ||
      displayedPriceRef.current === discountedPrice
    ) {
      setDisplayedPrice(discountedPrice)

      displayedPriceRef.current = discountedPrice

      setIsPriceAnimating(false)

      return
    }

    const startValue = displayedPriceRef.current
    const duration = 650

    let startTime = 0

    const easeOutCubic = (value: number): number =>
      1 - Math.pow(1 - value, 3)

    setIsPriceAnimating(true)

    const animatePrice = (
      timestamp: number
    ): void => {
      if (!startTime) startTime = timestamp

      const progress = Math.min(
        (timestamp - startTime) / duration,
        1
      )

      const easedProgress = easeOutCubic(progress)

      const nextValue = Math.round(
        startValue +
          (discountedPrice - startValue) *
            easedProgress
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
        cancelAnimationFrame(
          priceAnimationFrameRef.current
        )

        priceAnimationFrameRef.current = 0
      }
    }
  }, [discountedPrice])

  useEffect(() => {
    return () => {
      if (priceAnimationFrameRef.current) {
        cancelAnimationFrame(
          priceAnimationFrameRef.current
        )
      }
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="pricing-section"
    >
      <div
        ref={titleRef}
        className="pricing-title"
      >
        <h1 className="features-h1">
          Đầu tư bài bản
          <br />
          Giao dịch có{" "}
          <span className="textHighlight">
            hệ thống
          </span>
        </h1>

        <p className="description textCenter">
          MuagiSIA đồng hành cùng nhà đầu tư xây
          dựng hệ thống giao dịch và phương pháp
          đầu tư riêng biệt
        </p>
      </div>

      <div
        className="pricing-cards"
        aria-label="MuagiSIA pricing"
      >
        {pricingCards.map((card, index) => {
          const isPaidCard = index === 1

          return (
            <article
              key={card.tier}
              ref={(node) => {
                cardRefs.current[index] = node
              }}
              className={`pricing-card ${
                isPaidCard
                  ? "pricing-card--featured"
                  : ""
              }`}
            >
              <div className="pricing-card-top">
                <div className="pricing-card-header">
                  <h2 className="pricing-card-tier">
                    {card.tier}
                  </h2>

                  {isPaidCard ? (
                    <div
                      ref={dropdownRef}
                      className={`pricing-dropdown ${
                        isDropdownOpen
                          ? "pricing-dropdown--open"
                          : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="pricing-select-button"
                        aria-haspopup="menu"
                        aria-expanded={
                          isDropdownOpen
                        }
                        aria-label="Choose billing period"
                        disabled={isPriceAnimating}
                        onClick={() =>
                          setIsDropdownOpen(
                            (currentState) =>
                              !currentState
                          )
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
                        }`}
                        role="menu"
                        aria-hidden={!isDropdownOpen}
                      >
                        {billingOptions.map(
                          (option) => (
                            <button
                              key={option.value}
                              type="button"
                              className={`pricing-dropdown-item ${
                                option.value ===
                                billingPeriod
                                  ? "pricing-dropdown-item--active"
                                  : ""
                              }`}
                              role="menuitemradio"
                              aria-checked={
                                option.value ===
                                billingPeriod
                              }
                              onClick={() => {
                                if (
                                  option.value ===
                                    billingPeriod ||
                                  isPriceAnimating
                                ) {
                                  setIsDropdownOpen(
                                    false
                                  )

                                  return
                                }

                                setBillingPeriod(
                                  option.value
                                )

                                setIsDropdownOpen(
                                  false
                                )
                              }}
                            >
                              {option.displayLabel ??
                                option.label}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="pricing-card-price-block">
                  {isPaidCard ? (
                    <div className="pricing-card-price-row">
                      <span className="pricing-card-price">
                        {formatPrice(displayedPrice)}
                      </span>

                      <span className="pricing-card-duration">
                        /{" "}
                        {selectedBilling.displayLabel ??
                          selectedBilling.label}
                      </span>
                    </div>
                  ) : (
                    <div className="pricing-card-price-row">
                      <span className="pricing-card-price">
                        Miễn phí
                      </span>
                    </div>
                  )}
                </div>

                <p className="pricing-card-description">
                  {card.description}
                </p>

                <button
                  type="button"
                  className={`landing-button pricing-card-button ${
                    isPaidCard
                      ? ""
                      : "pricing-card-button--static"
                  }`}
                  aria-disabled={!isPaidCard}
                >
                  <span>{card.buttonLabel}</span>

                  {isPaidCard ? (
                    <span
                      className="landing-button-icon"
                      aria-hidden="true"
                    >
                      <ArrowUpRight />
                    </span>
                  ) : null}
                </button>
              </div>

              <ul
                className="pricing-card-perks"
                aria-label={`${card.tier} perks`}
              >
                {card.perks.map((perk) => (
                  <li
                    key={perk}
                    className="pricing-card-perk"
                  >
                    <CircleCheck
                      className={`pricing-card-perk-icon pricing-card-perk-icon--${card.iconTone}`}
                    />

                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default PricingApp