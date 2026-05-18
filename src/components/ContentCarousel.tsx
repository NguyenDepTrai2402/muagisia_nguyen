import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const DEFAULT_ITEMS_PER_VIEW = 3

function getItemsPerView(width: number): number {
  if (width >= 1024) return 3
  if (width >= 640) return 2
  return 1
}

function chunkItems<T>(items: T[], itemsPerView: number): T[][] {
  const pages: T[][] = []

  for (let index = 0; index < items.length; index += itemsPerView) {
    pages.push(items.slice(index, index + itemsPerView))
  }

  return pages
}

function getFallbackTooltipText(item: unknown): string {
  if (
    typeof item === "object" &&
    item !== null &&
    "title" in item &&
    typeof item.title === "string"
  ) {
    return item.title
  }

  return ""
}

type HoverTooltip = {
  text: string
  left: number
  top: number
}

type ContentCarouselProps<T> = {
  ariaLabel?: string
  description?: string
  getItemKey: (item: T, index: number) => string | number
  getItemTooltipText?: (item: T, index: number) => string
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  sectionClassName?: string
  title?: string
}

function ContentCarousel<T>({
  ariaLabel,
  description,
  getItemKey,
  getItemTooltipText,
  items,
  renderItem,
  sectionClassName = "",
  title,
}: ContentCarouselProps<T>) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const headerRef = useRef<HTMLDivElement | null>(null)
  const slotRefs = useRef<(HTMLDivElement | null)[]>([])

  const [itemsPerView, setItemsPerView] = useState<number>(
    DEFAULT_ITEMS_PER_VIEW
  )
  const [currentPage, setCurrentPage] = useState<number>(0)
  const [hoverTooltip, setHoverTooltip] = useState<HoverTooltip | null>(null)

  const carouselPages = chunkItems(items, itemsPerView)
  const lastPageIndex = Math.max(0, carouselPages.length - 1)
  const activePage = Math.min(currentPage, lastPageIndex)

  useEffect(() => {
    const updateItemsPerView = () => {
      setItemsPerView(getItemsPerView(window.innerWidth))
    }

    updateItemsPerView()
    window.addEventListener("resize", updateItemsPerView)

    return () => {
      window.removeEventListener("resize", updateItemsPerView)
    }
  }, [])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    const headerNode = headerRef.current
    const slotNodes = slotRefs.current.filter(
      (node): node is HTMLDivElement => Boolean(node)
    )

    if (!headerNode) return

    const revealNode = (
      node: HTMLElement,
      progress: number,
      yOffset = 40
    ) => {
      const easedProgress = 1 - Math.pow(1 - progress, 3)
      const currentYOffset = (1 - easedProgress) * yOffset

      node.style.opacity = easedProgress.toFixed(3)
      node.style.transform = `translate3d(0, ${currentYOffset.toFixed(
        2
      )}px, 0)`
    }

    if (prefersReducedMotion) {
      revealNode(headerNode, 1)
      slotNodes.forEach((slotNode) => revealNode(slotNode, 1))
      return
    }

    let rafId = 0
    let isAnimating = false
    let targetProgress = 0
    let currentProgress = 0

    const getElementDocumentTop = (element: HTMLElement): number => {
      let top = 0
      let node: HTMLElement | null = element

      while (node) {
        top += node.offsetTop || 0
        node = node.offsetParent as HTMLElement | null
      }

      return top
    }

    const applySectionStyles = (progress: number) => {
      revealNode(headerNode, Math.max(0, Math.min(1, progress / 0.35)))

      slotNodes.forEach((slotNode, index) => {
        const start = 0.16 + (index % itemsPerView) * 0.1
        const end = start + 0.26
        const localProgress = Math.max(
          0,
          Math.min(1, (progress - start) / (end - start))
        )

        revealNode(slotNode, localProgress)
      })
    }

    const updateTargetProgress = () => {
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
      const animationDistance = viewportHeight
      const rawProgress =
        (window.scrollY - startScroll) / animationDistance

      targetProgress = Math.max(0, Math.min(1, rawProgress))
    }

    const renderProgress = () => {
      currentProgress += (targetProgress - currentProgress) * 0.08
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

    const scheduleUpdate = () => {
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
  }, [items.length, itemsPerView])

  const clearHoverTooltip = () => {
    setHoverTooltip(null)
  }

  const updateHoverTooltip = (
    text: string,
    clientX: number,
    clientY: number
  ) => {
    if (!text || typeof window === "undefined") return

    const margin = 16
    const maxWidth = 320
    const maxHeight = 120

    setHoverTooltip({
      text,
      left: Math.max(
        margin,
        Math.min(clientX + 18, window.innerWidth - maxWidth - margin)
      ),
      top: Math.max(
        margin,
        Math.min(clientY + 18, window.innerHeight - maxHeight - margin)
      ),
    })
  }

  const handleItemMouseEnter =
    (text: string) => (event: React.MouseEvent<HTMLDivElement>) => {
      updateHoverTooltip(text, event.clientX, event.clientY)
    }

  const handleItemMouseMove =
    (text: string) => (event: React.MouseEvent<HTMLDivElement>) => {
      updateHoverTooltip(text, event.clientX, event.clientY)
    }

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(0, page - 1))
  }

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(lastPageIndex, page + 1))
  }

  return (
    <section
      ref={sectionRef}
      className={`content-carousel-section ${sectionClassName}`.trim()}
    >
      <div ref={headerRef} className="content-carousel-header">
        <h1 className="features-h1">{title}</h1>
        <p className="description textCenter content-carousel-description">
          {description}
        </p>
      </div>

      <div
        className="content-carousel-shell"
        style={
          { "--carousel-columns": itemsPerView } as React.CSSProperties
        }
      >
        <div className="content-carousel-viewport">
          <div
            className="content-carousel-track"
            aria-label={ariaLabel}
            style={{
              transform: `translate3d(${-activePage * 100}%, 0, 0)`,
            }}
          >
            {carouselPages.map((pageItems, pageIndex) => (
              <div key={`page-${pageIndex}`} className="content-carousel-page">
                {pageItems.map((item, itemIndex) => {
                  const overallIndex =
                    pageIndex * itemsPerView + itemIndex

                  const tooltipText =
                    getItemTooltipText?.(item, overallIndex) ??
                    getFallbackTooltipText(item)

                  return (
                    <div
                        key={`${getItemKey(item, overallIndex)}-${overallIndex}`}
                        className="content-carousel-slot"
                        ref={(node) => {
                        slotRefs.current[overallIndex] = node
                  }}
                       onMouseEnter={
                        tooltipText
                    ? handleItemMouseEnter(tooltipText)
                           : undefined
                    }
                     onMouseMove={
                     tooltipText
                    ? handleItemMouseMove(tooltipText)
                    : undefined
                    }
                    onMouseLeave={clearHoverTooltip}
                              > 
                      {renderItem(item, overallIndex)}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {carouselPages.length > 1 && (
          <div className="content-carousel-footer">
            <button
              type="button"
              className="content-carousel-nav-button"
              disabled={activePage === 0}
              onClick={goToPreviousPage}
            >
              <ChevronLeft />
            </button>

            <div className="content-carousel-dots">
              {carouselPages.map((_, pageIndex) => (
                <button
                  key={`dot-${pageIndex}`}
                  type="button"
                  className={`content-carousel-dot ${
                    pageIndex === activePage
                      ? "content-carousel-dot--active"
                      : ""
                  }`}
                  onClick={() => setCurrentPage(pageIndex)}
                />
              ))}
            </div>

            <button
              type="button"
              className="content-carousel-nav-button"
              disabled={activePage === lastPageIndex}
              onClick={goToNextPage}
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </div>

      {hoverTooltip && (
        <div
          className="content-carousel-tooltip"
          role="tooltip"
          style={{
            left: `${hoverTooltip.left}px`,
            top: `${hoverTooltip.top}px`,
          }}
        >
          {hoverTooltip.text}
        </div>
      )}
    </section>
  )
}

export default ContentCarousel
