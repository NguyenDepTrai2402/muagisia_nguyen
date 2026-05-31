import { ArrowUpRight } from "lucide-react"
import ContentCarousel from "./ContentCarousel"

const placeholderCover: string = "/IMGPlaceholder.jpg"

interface BookItem {
  name: string
  img: string
  link: string
}

const bookItems= [
        {
            img: "/images/book01.webp",
            name: "Sách Phương Pháp Quản Trị Vốn Trong Đầu Tư Chứng Khoán (Money Management System)",
            link: "https://s.shopee.vn/9UxmDTrRRC"
        },
        {
            img: "/images/book02.webp",
            name: "Bộ sách Làm Giàu Từ Chứng Khoán (Phiên bản mới) + Hướng Dẫn Thực Hành CANSLIM Cho Người Mới Bắt Đầu",
            link: "https://s.shopee.vn/4LFg3dsEUe"
        },
        {
            img: "/images/book03.webp",
            name: "Sách Cách Kiếm Lợi Nhuận 18.000% Từ Thị Trường Chứng Khoán - Trade Like An O'Neil Disciple",
            link: "https://s.shopee.vn/3VgZ498l76"
        },
        {
            img: "/images/book04.webp",
            name: "Sách Hướng Dẫn Giao Dịch Theo Sóng Elliott - Visual Guide To Elliott Wave Trading",
            link: "https://s.shopee.vn/40cpf7NaPA"
        },
        {
            img: "/images/book05.webp",
            name: "Sách Phù thuỷ giao dịch chứng khoán - Mark Minervini - Phiên bản mới",
            link: "https://s.shopee.vn/7KtHdHEYbr"
        },
        {
            img: "/images/book06.webp",
            name: "Sách Fibonacci Trading - Cách thức làm chủ lợi thế về thời gian và giá trong giao dịch ",
            link: "https://s.shopee.vn/9UxmDEpBNk"
        },
    ];

function Books(): React.ReactElement {
  return (
<ContentCarousel
  ariaLabel="Investment books carousel"
  description="Tập trung vào dòng sách đầu tư tài chính, MuagiSIA mang đến cho bạn đọc những cuốn sách hay nhất, giá trị nhất."
  getItemKey={(item: BookItem) => item.link}
  getItemTooltipText={(item: BookItem) => item.name}
  items={bookItems}
  renderItem={(item: BookItem) => (
    <a
      href={item.link}
      target="_blank"
      rel="noreferrer"
      className="content-carousel-card book-card"
    >
      <div className="book-card-media">
        <div className="book-card-model">
          <div className="book-card-pages" />
          <div className="book-card-back" />
          <img
            src={item.img}
            alt={`Bìa sách ${item.name}`}
            className="book-card-cover"
          />
        </div>
      </div>

      <div className="book-card-body">
        <h2 className="book-card-title">{item.name}</h2>
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
