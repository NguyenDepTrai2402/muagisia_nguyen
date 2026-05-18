import { ArrowUpRight } from "lucide-react"

function Hero() {
  return (
    <section className="hero">
      <h1 className="hero-title">
        Nắm bắt nhịp đập thị trường.
        <br />
        Ra quyết định chuẩn xác.
      </h1>
      <p className="hero-description">
        Nền tảng phân tích chứng khoán toàn diện. Trải nghiệm biểu đồ kỹ thuật chuyên sâu, dữ liệu dòng tiền real-time và các công cụ hỗ trợ đầu tư tối ưu nhất.
      </p>
      <button type="button" className="landing-button">
        <span>Trải nghiệm ngay</span>
        <span className="landing-button-icon" aria-hidden="true">
          <ArrowUpRight />
        </span>
      </button>
    </section>
  )
}

export default Hero
