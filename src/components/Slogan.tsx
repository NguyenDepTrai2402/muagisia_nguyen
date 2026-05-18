import { JSX, useEffect, useRef } from "react"

const lineOne = "MuagiSIA"
const lineTwo = '"Đồng hành chứng khoán Việt"'

function Slogan(): JSX.Element {
  const sectionRef = useRef<HTMLElement | null>(null)
  const charRefs = useRef<(HTMLSpanElement | null)[]>([])

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

    const applyCharacterStyles = (progress: number) => {
      const chars = charRefs.current.filter(
        (node): node is HTMLSpanElement => Boolean(node)
      )

      const totalChars = chars.length || 1

      chars.forEach((charNode, index) => {
        const start = (index / totalChars) * 0.75
        const end = start + 0.25

        const localProgress = Math.max(
          0,
          Math.min(1, (progress - start) / (end - start))
        )

        const easedProgress =
          localProgress < 0.5
            ? 4 * localProgress * localProgress * localProgress
            : 1 - Math.pow(-2 * localProgress + 2, 3) / 2

        const blur = (1 - easedProgress) * 10
        const opacity = easedProgress
        const yOffset = (1 - easedProgress) * 16

        charNode.style.opacity = opacity.toFixed(3)
        charNode.style.filter = `blur(${blur.toFixed(2)}px)`
        charNode.style.transform = `translate3d(0, ${yOffset.toFixed(
          2
        )}px, 0)`
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
        applyCharacterStyles(1)
        return
      }

      if (rect.top >= viewportHeight) {
        targetProgress = 0
        currentProgress = 0
        applyCharacterStyles(0)
        return
      }

      const elementTop = getElementDocumentTop(element)
      const startScroll = elementTop - viewportHeight * 0.8
      const animationDistance = viewportHeight * 0.4

      const rawProgress =
        (window.scrollY - startScroll) / animationDistance

      targetProgress = Math.max(0, Math.min(1, rawProgress))
    }

    const renderProgress = () => {
      currentProgress += (targetProgress - currentProgress) * 0.045
      applyCharacterStyles(currentProgress)

      if (Math.abs(targetProgress - currentProgress) > 0.001) {
        rafId = requestAnimationFrame(renderProgress)
      } else {
        currentProgress = targetProgress
        applyCharacterStyles(currentProgress)
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
    applyCharacterStyles(currentProgress)

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

  const renderCharacters = (
    text: string,
    keyPrefix: string,
    startIndex: number
  ) => {
    return text.split("").map((char, index) => {
      const refIndex = startIndex + index

      return (
        <span
          key={`${keyPrefix}-${index}`}
          className="slogan-char"
          ref={(node: HTMLSpanElement | null) => {
            charRefs.current[refIndex] = node
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      )
    })
  }

  return (
    <section
      className="slogan-section"
      ref={sectionRef}
    >
      <h1
        className="h1-title slogan-title"
        aria-label={`${lineOne} ${lineTwo}`}
      >
        {renderCharacters(lineOne, "line-1", 0)}
        <br />
        {renderCharacters(
          lineTwo,
          "line-2",
          lineOne.length
        )}
      </h1>
    </section>
  )
}

export default Slogan