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

function PartnerApplicationModal({ onClose }: Props): JSX.Element {
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
      onClose()
    }, 220)
  }, [onClose])

  useEffect(() => {
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
  }, [handleRequestClose, isRegionDropdownOpen])

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

  return (
    // JSX giữ nguyên như m đang có
    <div />
  )
}

export default PartnerApplicationModal