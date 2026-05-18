import { scrollToTargetId } from "../utils/scrolling"

function Navbar() {
  const navItems: Array<{ label: string; targetId: string }> = [
    { label: "Tổng quan", targetId: "hero" },
    { label: "Dịch vụ", targetId: "features" },
    { label: "Partner", targetId: "partner" },
    { label: "Khoá học", targetId: "courses" },
    { label: "Tủ sách đầu tư", targetId: "books" },
    { label: "Tin tức", targetId: "news" },
    { label: "Liên hệ", targetId: "footer" },
  ]

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, targetId: string): void => {
    event.preventDefault()
    scrollToTargetId(targetId)
  }

  return (
    <nav className="navbar">
      <ul className="navbar-list">
        {navItems.map((item) => (
          <li key={item.label}>
            <a
              href={`#${item.targetId}`}
              className="navbar-link"
              onClick={(event) => handleNavClick(event, item.targetId)}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Navbar
