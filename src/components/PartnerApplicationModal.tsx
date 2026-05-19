import { JSX, useCallback, useEffect, useRef, useState } from "react"
import {
  ArrowUpRight,
  ChevronDown,
  FileText,
  Mail,
  MapPin,
  Phone,
  Upload,
  User,
  X,
} from "lucide-react"
import { stopAnimatedWindowScroll } from "../utils/scrolling"

type FormState = {
  fullName: string
  phone: string
  email: string
  region: string
  experience: string
  agreed: boolean
}

type Props = {
  isOpen: boolean
  onClose: () => void
}

const initialFormState: FormState = {
  fullName: "",
  phone: "",
  email: "",
  region: "",
  experience: "",
  agreed: false,
}

const regionOptions: { value: string; label: string }[] = [
  { value: "", label: "Chọn khu vực" },
  { value: "hcm", label: "TP. Hồ Chí Minh" },
  { value: "hn", label: "Hà Nội" },
  { value: "dn", label: "Đà Nẵng" },
  { value: "other", label: "Khu vực khác" },
]

function PartnerApplicationModal({ isOpen, onClose }: Props): JSX.Element | null {
  const [formValues, setFormValues] = useState<FormState>(initialFormState)
  const [selectedFileName, setSelectedFileName] = useState<string>("")
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const [isClosing, setIsClosing] = useState<boolean>(false)
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] =
    useState<boolean>(false)

  const firstInputRef = useRef<HTMLInputElement | null>(null)
  const closeTimeoutRef = useRef<number | null>(null)
  const regionDropdownRef = useRef<HTMLDivElement | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  const selectedRegionLabel =
    regionOptions.find((option) => option.value === formValues.region)?.label ??
    regionOptions[0].label

  const handleRequestClose = useCallback((): void => {
    if (closeTimeoutRef.current) return

    setIsClosing(true)
    closeTimeoutRef.current = window.setTimeout(() => {
      closeTimeoutRef.current = null
      setIsClosing(false)
      onClose()
    }, 220)
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isRegionDropdownOpen) {
          setIsRegionDropdownOpen(false)
          return
        }
        handleRequestClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleRequestClose, isOpen, isRegionDropdownOpen])

  useEffect(() => {
    if (!isOpen) return

    stopAnimatedWindowScroll()
    firstInputRef.current?.focus()

    return () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (!isRegionDropdownOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (
        regionDropdownRef.current &&
        !regionDropdownRef.current.contains(event.target as Node)
      ) {
        setIsRegionDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
    }
  }, [isRegionDropdownOpen])

  const handleFieldChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ): void => {
    const { checked, name, type, value } = event.target as HTMLInputElement

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: type === "checkbox" ? checked : value,
    }))
    setIsSubmitted(false)
  }

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const nextFile = event.target.files?.[0]
    setSelectedFileName(nextFile ? nextFile.name : "")
    setIsSubmitted(false)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    setIsSubmitted(true)
  }

  const handleRegionSelect = (nextRegion: string): void => {
    setFormValues((currentValues) => ({
      ...currentValues,
      region: nextRegion,
    }))
    setIsRegionDropdownOpen(false)
    setIsSubmitted(false)
  }

  if (!isOpen) return null

  return (
    <div
      className={`partner-modal-overlay${
        isClosing ? " partner-modal-overlay--closing" : ""
      }`}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleRequestClose()
        }
      }}
    >
      <section
        className={`partner-modal${isClosing ? " partner-modal--closing" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="partner-modal-title"
      >
        <button
          type="button"
          className="partner-modal-close"
          aria-label="Đóng biểu mẫu"
          onClick={handleRequestClose}
        >
          <X />
        </button>

        <div ref={scrollContainerRef} className="partner-modal-scroll">
          <header className="partner-modal-header">
            <img
              src="/logo-kafi.svg"
              alt="Kafi"
              className="partner-modal-logo"
            />
            <div className="partner-modal-heading">
              <h2 id="partner-modal-title" className="partner-modal-title">
                Đăng ký Kafi Partner
              </h2>
              <p className="partner-modal-description">
                Để lại thông tin, đội ngũ Kafi sẽ liên hệ tư vấn chương trình
                đối tác phù hợp với khu vực và kinh nghiệm của bạn.
              </p>
            </div>
          </header>

          <form className="partner-modal-form" onSubmit={handleSubmit}>
            <div className="partner-modal-grid">
              <label className="partner-modal-field" htmlFor="partner-fullName">
                <span className="partner-modal-label">
                  <User />
                  Họ và tên
                  <span className="partner-modal-required">*</span>
                </span>
                <input
                  ref={firstInputRef}
                  id="partner-fullName"
                  name="fullName"
                  type="text"
                  className="partner-modal-input"
                  placeholder="Nguyễn Văn A"
                  value={formValues.fullName}
                  onChange={handleFieldChange}
                  required
                />
              </label>

              <label className="partner-modal-field" htmlFor="partner-phone">
                <span className="partner-modal-label">
                  <Phone />
                  Số điện thoại
                  <span className="partner-modal-required">*</span>
                </span>
                <input
                  id="partner-phone"
                  name="phone"
                  type="tel"
                  className="partner-modal-input"
                  placeholder="090 000 0000"
                  value={formValues.phone}
                  onChange={handleFieldChange}
                  required
                />
              </label>

              <label className="partner-modal-field" htmlFor="partner-email">
                <span className="partner-modal-label">
                  <Mail />
                  Email
                </span>
                <input
                  id="partner-email"
                  name="email"
                  type="email"
                  className="partner-modal-input"
                  placeholder="email@example.com"
                  value={formValues.email}
                  onChange={handleFieldChange}
                />
              </label>

              <div className="partner-modal-field">
                <span className="partner-modal-label">
                  <MapPin />
                  Khu vực
                  <span className="partner-modal-required">*</span>
                </span>
                <div
                  ref={regionDropdownRef}
                  className={`partner-modal-dropdown${
                    isRegionDropdownOpen
                      ? " partner-modal-dropdown--open"
                      : ""
                  }`}
                >
                  <button
                    type="button"
                    className={`partner-modal-select-button${
                      formValues.region
                        ? ""
                        : " partner-modal-select-button--placeholder"
                    }`}
                    aria-haspopup="listbox"
                    aria-expanded={isRegionDropdownOpen}
                    onClick={() =>
                      setIsRegionDropdownOpen((currentValue) => !currentValue)
                    }
                  >
                    <span>{selectedRegionLabel}</span>
                    <span className="partner-modal-select-icon">
                      <ChevronDown />
                    </span>
                  </button>

                  <div
                    className={`partner-modal-dropdown-menu${
                      isRegionDropdownOpen
                        ? " partner-modal-dropdown-menu--open"
                        : ""
                    }`}
                    role="listbox"
                  >
                    {regionOptions.map((option) => (
                      <button
                        key={option.value || "placeholder"}
                        type="button"
                        role="option"
                        aria-selected={formValues.region === option.value}
                        className={`partner-modal-dropdown-item${
                          formValues.region === option.value
                            ? " partner-modal-dropdown-item--active"
                            : ""
                        }`}
                        onClick={() => handleRegionSelect(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <label
              className="partner-modal-field partner-modal-field--full"
              htmlFor="partner-experience"
            >
              <span className="partner-modal-label">
                <FileText />
                Kinh nghiệm tư vấn hoặc kinh doanh
              </span>
              <textarea
                id="partner-experience"
                name="experience"
                className="partner-modal-input partner-modal-textarea"
                placeholder="Chia sẻ ngắn về kinh nghiệm, tệp khách hàng hoặc mục tiêu hợp tác của bạn"
                value={formValues.experience}
                onChange={handleFieldChange}
              />
            </label>

            <label className="partner-modal-upload" htmlFor="partner-file">
              <input
                id="partner-file"
                type="file"
                className="partner-modal-file-input"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleFileChange}
              />
              <span className="partner-modal-upload-icon">
                <Upload />
              </span>
              <span className="partner-modal-upload-text">
                {selectedFileName || "Tải lên hồ sơ hoặc tài liệu giới thiệu"}
              </span>
              <span className="partner-modal-upload-note">
                PDF, DOC, DOCX, PNG hoặc JPG. Có thể bỏ qua bước này.
              </span>
            </label>

            <label className="partner-modal-consent" htmlFor="partner-agreed">
              <input
                id="partner-agreed"
                name="agreed"
                type="checkbox"
                className="partner-modal-consent-input"
                checked={formValues.agreed}
                onChange={handleFieldChange}
                required
              />
              <span className="partner-modal-consent-box" />
              <span className="partner-modal-consent-text">
                Tôi đồng ý để Kafi liên hệ và xử lý thông tin đăng ký theo mục
                đích tư vấn chương trình đối tác.
              </span>
            </label>

            {isSubmitted && (
              <div className="partner-modal-success" role="status">
                Cảm ơn bạn đã đăng ký. Kafi sẽ liên hệ lại trong thời gian sớm
                nhất.
              </div>
            )}

            <button
              type="submit"
              className="landing-button partner-modal-submit"
            >
              <span>Gửi đăng ký</span>
              <span className="landing-button-icon" aria-hidden="true">
                <ArrowUpRight />
              </span>
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}

export default PartnerApplicationModal
