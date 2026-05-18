"use client"

import { ArrowUpRight } from "lucide-react"
import ContentCarousel from "./ContentCarousel"

type CourseItem = {
  title: string
  description: string
  href: string
}

const courseItems: CourseItem[] = [
  {
    title: "Nền tảng đầu tư chứng khoán",
    description:
      "Xây dựng tư duy đầu tư, đọc hiểu thị trường và quản lý vốn từ những nguyên tắc cơ bản.",
    href: "#",
  },
  {
    title: "Phân tích kỹ thuật thực chiến",
    description:
      "Ứng dụng xu hướng, khối lượng, hỗ trợ kháng cự và tín hiệu giao dịch vào kế hoạch mua bán.",
    href: "#",
  },
  {
    title: "Quản trị danh mục cá nhân",
    description:
      "Thiết kế danh mục phù hợp khẩu vị rủi ro, theo dõi hiệu suất và tái cơ cấu có kỷ luật.",
    href: "#",
  },
  {
    title: "Đọc báo cáo tài chính",
    description:
      "Nắm các chỉ số quan trọng để đánh giá sức khỏe doanh nghiệp và chất lượng tăng trưởng.",
    href: "#",
  },
  {
    title: "Tâm lý giao dịch",
    description:
      "Nhận diện thiên kiến hành vi, kiểm soát cảm xúc và duy trì hệ thống giao dịch nhất quán.",
    href: "#",
  },
  {
    title: "Chiến lược đầu tư dài hạn",
    description:
      "Lựa chọn doanh nghiệp, định giá tương đối và xây dựng kế hoạch nắm giữ bền vững.",
    href: "#",
  },
]

function Courses(): React.ReactElement {
  return (
    <ContentCarousel
      ariaLabel="Investment courses carousel"
      description="Các khóa học được thiết kế theo lộ trình từ cơ bản đến nâng cao, giúp bạn đầu tư có phương pháp và giao dịch có kỷ luật."
      getItemKey={(item: CourseItem) => item.title}
      getItemTooltipText={(item: CourseItem) => item.title}
      items={courseItems}
      renderItem={(item: CourseItem) => (
        <a href={item.href} className="content-carousel-card book-card">
          <div className="book-card-media">
            <div className="kafi-partner-card-media kafi-partner-card-artwork">
              <span className="kafi-partner-card-artwork-glow" />
              <span className="kafi-partner-card-artwork-badge">
                <ArrowUpRight />
              </span>
            </div>
          </div>

          <div className="book-card-body">
            <h2 className="book-card-title">{item.title}</h2>
            <p className="feature-card-description">{item.description}</p>
            <span className="book-card-cta">
              <span>Xem khóa học</span>
              <span className="landing-button-icon" aria-hidden="true">
                <ArrowUpRight />
              </span>
            </span>
          </div>
        </a>
      )}
      sectionClassName="courses-section"
      title="Khóa học đầu tư"
    />
  )
}

export default Courses
