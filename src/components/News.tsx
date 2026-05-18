"use client"

import { ClockFading } from "lucide-react"
import ContentCarousel from "./ContentCarousel"
import { JSX, useEffect, useState } from "react"

type NewsItem = {
  href: string
  image: string
  title: string
  source: string
  time: string
}

const fallbackNews: NewsItem[] = [
  {
    href: "https://muagisia.com/",
    image: "/IMGPlaceholder2.jpg",
    title: "Thị trường tài chính cần chiến lược quản trị rủi ro rõ ràng",
    source: "MuagiSIA",
    time: "2026-05-18T08:00:00+07:00",
  },
  {
    href: "https://muagisia.com/",
    image: "/IMGPlaceholder.jpg",
    title: "Nhà đầu tư cá nhân ưu tiên dữ liệu và kỷ luật giao dịch",
    source: "MuagiSIA",
    time: "2026-05-18T09:30:00+07:00",
  },
  {
    href: "https://muagisia.com/",
    image: "/MuagisiaDemo.png",
    title: "Cập nhật xu hướng phân tích thị trường trong phiên mới",
    source: "MuagiSIA",
    time: "2026-05-18T10:15:00+07:00",
  },
]

function formatNewsTime(dateString: string): string {
  const formatter = new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour12: false,
  })

  const parts = formatter.formatToParts(new Date(dateString))

  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? ""

  return `${getPart("hour")}:${getPart("minute")} ${getPart("day")}/${getPart(
    "month"
  )}/${getPart("year")}`
}

function News(): JSX.Element {
  const [news, setNews] = useState<NewsItem[]>(fallbackNews)

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const url = "https://api.muagisia.com/data/news?page=1&limit=30"

      try {
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`)
        }

        const result = await response.json()
        const nextNews = result?.data?.data

        if (Array.isArray(nextNews) && nextNews.length > 0) {
          setNews(nextNews)
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message)
        }
      }
    }

    fetchData()
  }, [])

  return (
    <ContentCarousel
      ariaLabel="Financial news carousel"
      description="Cùng Muagisia cập nhật và theo dõi liên tục những tin tức mới nhất của thị trường để nắm bắt xu hướng, cơ hội và biến động quan trọng mỗi ngày."
      getItemKey={(item: NewsItem) => item.href}
      getItemTooltipText={(item: NewsItem) => item.title}
      items={news}
      renderItem={(item: NewsItem) => (
        <a
          href={item.href}
          target="_blank"
          rel="noreferrer"
          className="content-carousel-card news-card"

        >
          <div className="news-card-media">
            <img
              src={item.image}
              alt={item.title}
              className="news-card-cover"
            />
          </div>
          <div className="news-card-body">
            <h2 className="news-card-title">{item.title}</h2>
            <p className="news-card-source">Nguồn: {item.source}</p>
            <p className="news-card-time">
              <ClockFading />
              <span>{formatNewsTime(item.time)}</span>
            </p>
          </div>
        </a>
      )}
      sectionClassName="news-section"
      title="Tin cập nhật"
    />
  )
}

export default News
