import { ArrowUpRight } from "lucide-react"
import ContentCarousel from "./ContentCarousel"

const placeholderCover: string = "/IMGPlaceholder.jpg"

interface BookItem {
  title: string
  cover: string
  href: string
}

const bookItems: BookItem[] = [
  {
    title: "Nhà đầu tư thông minh",
    cover: placeholderCover,
    href: "https://shopee.vn/search?keyword=nha%20dau%20tu%20thong%20minh",
  },
  {
    title: "Giao dịch như một phù thủy chứng khoán",
    cover: placeholderCover,
    href: "https://shopee.vn/search?keyword=mark%20minervini",
  },
  {
    title: "Phân tích chứng khoán",
    cover: placeholderCover,
    href: "https://shopee.vn/search?keyword=phan%20tich%20chung%20khoan",
  },
  {
    title: "Làm giàu từ chứng khoán",
    cover: placeholderCover,
    href: "https://shopee.vn/search?keyword=lam%20giau%20tu%20chung%20khoan",
  },
  {
    title: "Tâm lý học trong đầu tư",
    cover: placeholderCover,
    href: "https://shopee.vn/search?keyword=tam%20ly%20hoc%20trong%20dau%20tu",
  },
  {
    title: "Chu kỳ thị trường",
    cover: placeholderCover,
    href: "https://shopee.vn/search?keyword=chu%20ky%20thi%20truong",
  },
]

function Books(): React.ReactElement {
  return (
    <ContentCarousel
      ariaLabel="Investment books carousel"
      description="Tập trung vào dòng sách đầu tư tài chính, MuagiSIA mang đến cho bạn đọc những cuốn sách hay nhất, giá trị nhất."
      getItemKey={(item: BookItem) => item.title}
      getItemTooltipText={(item: BookItem) => item.title}
      items={bookItems}
      renderItem={(item: BookItem) => (
        <a
          href={item.href}
          target="_blank"
          rel="noreferrer"
          className="content-carousel-card book-card"
        >
          <div className="book-card-media">
            <div className="book-card-model">
              <div className="book-card-pages" />
              <div className="book-card-back" />
              <img
                src={item.cover}
                alt={`Bìa sách ${item.title}`}
                className="book-card-cover"
              />
            </div>
          </div>

          <div className="book-card-body">
            <h2 className="book-card-title">{item.title}</h2>
            <span className="book-card-cta">
              <span>Chi tiết tại Shopee</span>
              <span className="landing-button-icon" aria-hidden="true">
                <ArrowUpRight />
              </span>
            </span>
          </div>
        </a>
      )}
      sectionClassName="books-section"
      title="Tủ sách đầu tư"
    />
  )
}

export default Books
