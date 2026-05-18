import { scrollToTargetId } from "../utils/scrolling"

const footerNavItems: Array<{ label: string; href: string }> = [
  { label: "Tổng quan", href: "#hero" },
  { label: "Partners", href: "#partner" },
  { label: "Tủ sách đầu tư", href: "#books" },
  { label: "Tin tức", href: "#news" },
  { label: "Liên hệ", href: "#footer" },
]

const footerPolicyItems: Array<{ label: string; href: string }> = [
  { label: "Chính sách bảo mật", href: "#" },
  { label: "Chính sách 1", href: "#" },
  { label: "Chính sách 2", href: "#" },
  { label: "Chính sách 3", href: "#" },
]

function Footer() {
  const handleFooterNavClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string): void => {
    if (!href.startsWith("#") || href === "#") return

    event.preventDefault()
    scrollToTargetId(href.slice(1))
  }

  return (
    <footer id="footer" className="site-footer">
      <div className="section-wrapper">
        <div className="footer-content">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-brand-lockup">
                <img
                  src="/logoMuagisia.svg"
                  alt="MuagiSIA"
                  className="footer-logo"
                />
                <span className="footer-brand-name">Muagisia</span>
              </div>

              <p className="footer-heading">
                Muagi SIA đồng hành cùng nhà đầu tư xây dựng hệ thống giao dịch và
                phương pháp đầu tư riêng biệt
              </p>

              <div className="footer-contact">
                <p>Địa chỉ: 29 Lê Duẫn, Phường Sài Gòn, TP.HCM</p>
                <p>
                  Điện thoại:{" "}
                  <a href="tel:+84901798808" className="footer-inline-link">
                    +84 90 179 8808
                  </a>
                </p>
                <p>
                  Email:{" "}
                  <a
                    href="mailto:congtacvien6868@gmail.com"
                    className="footer-inline-link"
                  >
                    congtacvien6868@gmail.com
                  </a>
                </p>
              </div>
            </div>

            <div className="footer-links-group">
              <div className="footer-column">
                <h2 className="footer-column-title">Điều hướng</h2>
                <ul className="footer-link-list">
                  {footerNavItems.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        className="footer-link"
                        onClick={(event) =>
                          handleFooterNavClick(event, item.href)
                        }
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="footer-column">
                <h2 className="footer-column-title">Chính sách</h2>
                <ul className="footer-link-list">
                  {footerPolicyItems.map((item) => (
                    <li key={item.label}>
                      <a href={item.href} className="footer-link">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            © 2026 MuagiSIA. Tất cả quyền đã được bảo lưu.
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
