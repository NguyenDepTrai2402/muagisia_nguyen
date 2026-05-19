import { useEffect, useRef, useState } from "react"
import Navbar from "../components/Navbar"
import Hero from "../components/Hero"
import Slogan from "../components/Slogan"
import Features from "../components/Features"
import PricingApp from "../components/PricingApp"
import KafiPartner from "../components/KafiPartner"
import Tablet from "../components/Tablet"
import Table from "../components/Table"
import Books from "../components/Books"
import News from "../components/News"
import CTA from "../components/CTA"
import Footer from "../components/Footer"
import PartnerApplicationModal from "../components/PartnerApplicationModal"
import { ArrowUpRight } from "lucide-react"
import { scrollToTargetId, stopAnimatedWindowScroll } from "./scrolling"
import "./index.css"

function App() {
  const scrollingContainerRef = useRef<HTMLDivElement>(null)
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false)

  const handleLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    scrollToTargetId("top")
  }

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    if (prefersReducedMotion) return

    const container = scrollingContainerRef.current
    if (!container) return

    let targetScrollY = window.scrollY
    let currentScrollY = window.scrollY
    let rafId = 0
    const easing = 0.08

    const applyTransform = () => {
      container.style.transform = `translate3d(0, ${-currentScrollY}px, 0)`
      window.dispatchEvent(new Event("smooth-scroll-update"))
    }

    const updateBodyHeight = () => {
      document.body.style.height = `${container.scrollHeight}px`
    }

    const animate = () => {
      currentScrollY += (targetScrollY - currentScrollY) * easing

      if (Math.abs(targetScrollY - currentScrollY) < 0.1) {
        currentScrollY = targetScrollY
      }

      applyTransform()

      if (Math.abs(targetScrollY - currentScrollY) > 0.1) {
        rafId = requestAnimationFrame(animate)
      } else {
        rafId = 0
      }
    }

    const onScroll = () => {
      targetScrollY = window.scrollY
      if (!rafId) {
        rafId = requestAnimationFrame(animate)
      }
    }

    const onResize = () => {
      updateBodyHeight()
      targetScrollY = window.scrollY
      if (!rafId) {
        rafId = requestAnimationFrame(animate)
      }
    }

    const resizeObserver = new ResizeObserver(updateBodyHeight)
    resizeObserver.observe(container)

    updateBodyHeight()
    applyTransform()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onResize)

    return () => {
      stopAnimatedWindowScroll()
      resizeObserver.disconnect()
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
      if (rafId) cancelAnimationFrame(rafId)
      container.style.transform = ""
      document.body.style.height = ""
    }
  }, [])

  return (
    <div className="smooth-scroll-parent">
      <header className="site-header">
        <a href="#top" aria-label="Back to top" onClick={handleLogoClick}>
          <img src="/logoMuagisia.svg" alt="MuagiSIA" className="site-logo" />
        </a>
        <Navbar />
        <button type="button" className="landing-button">
          <span>Đăng nhập</span>
          <span className="landing-button-icon" aria-hidden="true">
            <ArrowUpRight />
          </span>
        </button>
      </header>

      <div id="top" ref={scrollingContainerRef} className="smooth-scroll-container">
        <div>
          <div id="hero" className="section-wrapper">
            <Hero />
            <Tablet />
            <Slogan />
          </div>

          <div id="features" className="section-wrapper">
            <Features />
            <PricingApp />
          </div>
          
          <div id="partner" className="section-wrapper">
            <KafiPartner onOpenApplicationModal={() => setIsPartnerModalOpen(true)} />
            <Table />
          </div>

          <div id="books" className="section-wrapper">
            <Books />
          </div>

          <div id="news" className="section-wrapper">
            <News />
            <CTA />
          </div>
        </div>

        <Footer />
      </div>

      <PartnerApplicationModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
      />
    </div>
  )
}

export default App
