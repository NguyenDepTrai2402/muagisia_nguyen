import { useEffect, useRef, useState } from "react"
import { Info, X } from "lucide-react"

const incomeTableColumns = ["Sản phẩm", "Vốn gốc", "Số ngày", "AUM"]

type CellType = 
  | { type: "text"; value: string; label?: boolean; emphasis?: boolean; highlight?: boolean }
  | { type: "principal"; highlight?: boolean; label?: boolean }
  | { type: "valueWithInfo"; value: string; explanationId: string | number; explanation: string; emphasis?: boolean; label?: boolean; highlight?: boolean }

interface TableRow {
  key: string
  variant: string
  cells: CellType[]
}

const integerFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
})

const percentFormatterCache = new Map<number, Intl.NumberFormat>()

const getPercentFormatter = (digits: number): Intl.NumberFormat => {
  if (!percentFormatterCache.has(digits)) {
    percentFormatterCache.set(
      digits,
      new Intl.NumberFormat("vi-VN", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })
    )
  }

  return percentFormatterCache.get(digits)!
}

const formatInteger = (value: number): string => integerFormatter.format(Math.round(value))

const formatPercent = (value: number, digits: number = 2): string =>
  `${getPercentFormatter(digits).format(value * 100)}%`

const DEFAULT_PRINCIPAL = 20_000_000_000
const CASH_RATE = 0.004
const CASH_DAYS = 365
const TRADE_FEE = 0.0015
const NET_FEE = TRADE_FEE - 0.0003
const COMMISSION_RATE = 0.66
const BOND_VALUE = 1_000_000_000
const BOND_RATE = 0.0015
const EMPTY_CELL = "\u00A0"

function getIncomeBreakdown(principal: number) {
  const safePrincipal = Number.isFinite(principal) ? Math.max(principal, 0) : 0
  const dailyCashIncome = (CASH_RATE * safePrincipal) / CASH_DAYS
  const monthlyCashIncome = dailyCashIncome * 30
  const tradeGross = safePrincipal * TRADE_FEE
  const tradeNet = safePrincipal * NET_FEE
  const tradeCommission = tradeNet * COMMISSION_RATE
  const bondIncome = BOND_VALUE * BOND_RATE
  const finalIncome = monthlyCashIncome + tradeCommission + bondIncome

  return {
    principal: safePrincipal,
    dailyCashIncome,
    monthlyCashIncome,
    tradeGross,
    tradeNet,
    tradeCommission,
    bondIncome,
    finalIncome,
  }
}

const initialBreakdown = getIncomeBreakdown(DEFAULT_PRINCIPAL)

function Table() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const tableCardRef = useRef<HTMLDivElement>(null)
  const [committedPrincipal, setCommittedPrincipal] = useState(DEFAULT_PRINCIPAL)
  const [draftPrincipal, setDraftPrincipal] = useState(String(DEFAULT_PRINCIPAL))
  const [isEditingPrincipal, setIsEditingPrincipal] = useState(false)
  const [displayedFinalIncome, setDisplayedFinalIncome] = useState(
    initialBreakdown.finalIncome
  )
  const [isFinalAnimating, setIsFinalAnimating] = useState(false)
  const [openExplanationId, setOpenExplanationId] = useState<string | number | null>(null)

  const principalInputRef = useRef<HTMLInputElement>(null)
  const finalAnimationFrameRef = useRef<number>(0)
  const displayedFinalIncomeRef = useRef(initialBreakdown.finalIncome)
  const isInitialFinalRenderRef = useRef(true)

  const breakdown = getIncomeBreakdown(committedPrincipal)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    const sectionNode = sectionRef.current
    const tableCardNode = tableCardRef.current

    if (!sectionNode || !tableCardNode) return

    if (prefersReducedMotion) {
      tableCardNode.style.opacity = "1"
      tableCardNode.style.transform = "translate3d(0, 0, 0)"
      return
    }

    let rafId = 0
    let targetProgress = 0
    let currentProgress = 0
    let isAnimating = false

    const getElementDocumentTop = (element: Element): number => {
      let top = 0
      let node: Element | null = element

      while (node) {
        const htmlNode = node as HTMLElement
        top += htmlNode.offsetTop || 0
        node = htmlNode.offsetParent as Element | null
      }

      return top
    }

    const easeOutCubic = (value: number): number => 1 - Math.pow(1 - value, 3)

    const applyRevealStyles = (progress: number): void => {
      const easedProgress = easeOutCubic(progress)
      const yOffset = (1 - easedProgress) * 40

      tableCardNode.style.opacity = easedProgress.toFixed(3)
      tableCardNode.style.transform = `translate3d(0, ${yOffset.toFixed(
        2
      )}px, 0)`
    }

    const updateTargetProgress = () => {
      const viewportHeight = window.innerHeight
      const rect = sectionNode.getBoundingClientRect()

      if (rect.bottom <= 0) {
        targetProgress = 1
        currentProgress = 1
        applyRevealStyles(1)
        return
      }

      if (rect.top >= viewportHeight) {
        targetProgress = 0
        currentProgress = 0
        applyRevealStyles(0)
        return
      }

      const elementTop = getElementDocumentTop(sectionNode)
      const startScroll = elementTop - viewportHeight * 0.8
      const animationDistance = viewportHeight * 0.45
      const rawProgress = (window.scrollY - startScroll) / animationDistance
      targetProgress = Math.max(0, Math.min(1, rawProgress))
    }

    const renderProgress = () => {
      currentProgress += (targetProgress - currentProgress) * 0.06
      applyRevealStyles(currentProgress)

      if (Math.abs(targetProgress - currentProgress) > 0.001) {
        rafId = requestAnimationFrame(renderProgress)
      } else {
        currentProgress = targetProgress
        applyRevealStyles(currentProgress)
        isAnimating = false
        rafId = 0
      }
    }

    const scheduleUpdate = () => {
      updateTargetProgress()

      if (!isAnimating) {
        isAnimating = true
        rafId = requestAnimationFrame(renderProgress)
      }
    }

    updateTargetProgress()
    currentProgress = targetProgress
    applyRevealStyles(currentProgress)

    window.addEventListener("scroll", scheduleUpdate, { passive: true })
    window.addEventListener("smooth-scroll-update", scheduleUpdate)
    window.addEventListener("resize", scheduleUpdate)
    window.addEventListener("load", scheduleUpdate)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener("smooth-scroll-update", scheduleUpdate)
      window.removeEventListener("resize", scheduleUpdate)
      window.removeEventListener("load", scheduleUpdate)
    }
  }, [])

  useEffect(() => {
    if (!isEditingPrincipal) return

    principalInputRef.current?.focus()
    principalInputRef.current?.select()
  }, [isEditingPrincipal])

  useEffect(() => {
    if (openExplanationId === null && !isEditingPrincipal) return

    const handlePointerDown = (event: MouseEvent | TouchEvent): void => {
      if (!(event.target as HTMLElement).closest(".income-table-floating")) {
        setOpenExplanationId(null)
        setIsEditingPrincipal(false)
      }
    }

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setOpenExplanationId(null)
        setIsEditingPrincipal(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("touchstart", handlePointerDown)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("touchstart", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isEditingPrincipal, openExplanationId])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (isInitialFinalRenderRef.current) {
      isInitialFinalRenderRef.current = false
      setDisplayedFinalIncome(breakdown.finalIncome)
      displayedFinalIncomeRef.current = breakdown.finalIncome
      return
    }

    if (finalAnimationFrameRef.current) {
      cancelAnimationFrame(finalAnimationFrameRef.current)
      finalAnimationFrameRef.current = 0
    }

    if (
      prefersReducedMotion ||
      displayedFinalIncomeRef.current === breakdown.finalIncome
    ) {
      setDisplayedFinalIncome(breakdown.finalIncome)
      displayedFinalIncomeRef.current = breakdown.finalIncome
      setIsFinalAnimating(false)
      return
    }

    const startValue = displayedFinalIncomeRef.current
    const duration = 650
    let startTime = 0

    const easeOutCubic = (value: number): number => 1 - Math.pow(1 - value, 3)

    setIsFinalAnimating(true)

    const animateFinalIncome = (timestamp: number): void => {
      if (!startTime) startTime = timestamp

      const progress = Math.min((timestamp - startTime) / duration, 1)
      const easedProgress = easeOutCubic(progress)
      const nextValue = Math.round(
        startValue + (breakdown.finalIncome - startValue) * easedProgress
      )

      setDisplayedFinalIncome(nextValue)
      displayedFinalIncomeRef.current = nextValue

      if (progress < 1) {
        finalAnimationFrameRef.current =
          requestAnimationFrame(animateFinalIncome)
      } else {
        setDisplayedFinalIncome(breakdown.finalIncome)
        displayedFinalIncomeRef.current = breakdown.finalIncome
        setIsFinalAnimating(false)
        finalAnimationFrameRef.current = 0
      }
    }

    finalAnimationFrameRef.current = requestAnimationFrame(animateFinalIncome)

    return () => {
      if (finalAnimationFrameRef.current) {
        cancelAnimationFrame(finalAnimationFrameRef.current)
        finalAnimationFrameRef.current = 0
      }
    }
  }, [breakdown.finalIncome])

  useEffect(() => {
    return () => {
      if (finalAnimationFrameRef.current) {
        cancelAnimationFrame(finalAnimationFrameRef.current)
      }
    }
  }, [])

  const formattedPrincipal = formatInteger(breakdown.principal)
  const displayedFinalValue = formatInteger(displayedFinalIncome)

  const explanationText = {
    cashDay: `${formatInteger(breakdown.dailyCashIncome)} = (${formattedPrincipal} x ${formatPercent(CASH_RATE, 2)}) : ${CASH_DAYS}`,
    cashMonth: `${formatInteger(breakdown.monthlyCashIncome)} = ${formatInteger(breakdown.dailyCashIncome)} x 30`,
    tradeNetRate: `${formatPercent(NET_FEE, 2)} = ${formatPercent(TRADE_FEE, 2)} - 0,03%`,
    tradeGross: `${formatInteger(breakdown.tradeGross)} = ${formattedPrincipal} x ${formatPercent(TRADE_FEE, 2)}`,
    tradeNet: `${formatInteger(breakdown.tradeNet)} = ${formattedPrincipal} x ${formatPercent(NET_FEE, 2)}`,
    tradeCommission: `${formatInteger(breakdown.tradeCommission)} = ${formatInteger(breakdown.tradeNet)} x ${formatPercent(COMMISSION_RATE, 0)}`,
    bondIncome: `${formatInteger(breakdown.bondIncome)} = ${formatInteger(BOND_VALUE)} x ${formatPercent(BOND_RATE, 2)}`,
    finalIncome: `${formatInteger(breakdown.finalIncome)} = ${formatInteger(breakdown.monthlyCashIncome)} + ${formatInteger(breakdown.tradeCommission)} + ${formatInteger(breakdown.bondIncome)}`,
  }

  const incomeTableRows: TableRow[] = [
    {
      key: "cash-base",
      variant: "default",
      cells: [
        { type: "text", value: "CASH", label: true },
        { type: "principal", highlight: true },
        { type: "text", value: String(CASH_DAYS), emphasis: true },
        { type: "text", value: formatPercent(CASH_RATE, 2), emphasis: true },
      ],
    },
    {
      key: "cash-day",
      variant: "default",
      cells: [
        { type: "text", value: "" },
        { type: "text", value: "" },
        { type: "text", value: "1 ngày" },
        {
          type: "valueWithInfo",
          value: formatInteger(breakdown.dailyCashIncome),
          explanationId: "cash-day",
          explanation: explanationText.cashDay,
          emphasis: true,
        },
      ],
    },
    {
      key: "cash-month",
      variant: "default",
      cells: [
        { type: "text", value: "" },
        { type: "text", value: "" },
        { type: "text", value: "30 ngày" },
        {
          type: "valueWithInfo",
          value: formatInteger(breakdown.monthlyCashIncome),
          explanationId: "cash-month",
          explanation: explanationText.cashMonth,
          emphasis: true,
        },
      ],
    },
    {
      key: "trade-header",
      variant: "group",
      cells: [
        { type: "text", value: "TRADE", label: true },
        { type: "text", value: "Phí giao dịch", label: true },
        { type: "text", value: "Phí net", label: true },
        { type: "text", value: "Hoa hồng", label: true },
      ],
    },
    {
      key: "trade-rates",
      variant: "default",
      cells: [
        { type: "text", value: "" },
        { type: "text", value: formatPercent(TRADE_FEE, 2), emphasis: true },
        {
          type: "valueWithInfo",
          value: formatPercent(NET_FEE, 2),
          explanationId: "trade-net-rate",
          explanation: explanationText.tradeNetRate,
          emphasis: true,
        },
        {
          type: "text",
          value: formatPercent(COMMISSION_RATE, 0),
          emphasis: true,
        },
      ],
    },
    {
      key: "trade-values",
      variant: "default",
      cells: [
        { type: "text", value: "" },
        {
          type: "valueWithInfo",
          value: formatInteger(breakdown.tradeGross),
          explanationId: "trade-gross",
          explanation: explanationText.tradeGross,
          emphasis: true,
        },
        {
          type: "valueWithInfo",
          value: formatInteger(breakdown.tradeNet),
          explanationId: "trade-net",
          explanation: explanationText.tradeNet,
          emphasis: true,
        },
        {
          type: "valueWithInfo",
          value: formatInteger(breakdown.tradeCommission),
          explanationId: "trade-commission",
          explanation: explanationText.tradeCommission,
          emphasis: true,
        },
      ],
    },
    {
      key: "bond-header",
      variant: "group",
      cells: [
        { type: "text", value: "Trái phiếu", label: true },
        { type: "text", value: "Giá trị trái phiếu", label: true },
        { type: "text", value: "0,15%/năm", label: true },
        { type: "text", value: formatPercent(BOND_RATE, 2), label: true },
      ],
    },
    {
      key: "bond-value",
      variant: "default",
      cells: [
        { type: "text", value: "" },
        { type: "text", value: formatInteger(BOND_VALUE), emphasis: true },
        { type: "text", value: "" },
        {
          type: "valueWithInfo",
          value: formatInteger(breakdown.bondIncome),
          explanationId: "bond-income",
          explanation: explanationText.bondIncome,
          emphasis: true,
        },
      ],
    },
    {
      key: "other",
      variant: "default",
      cells: [
        { type: "text", value: "Khác", label: true },
        { type: "text", value: "" },
        { type: "text", value: "" },
        { type: "text", value: "" },
      ],
    },
    {
      key: "summary",
      variant: "summary",
      cells: [
        { type: "text", value: "Cuối kỳ (i)", label: true },
        { type: "text", value: "" },
        { type: "text", value: "" },
        {
          type: "valueWithInfo",
          value: displayedFinalValue,
          explanationId: "final-income",
          explanation: explanationText.finalIncome,
          emphasis: true,
          highlight: true,
        },
      ],
    },
    {
      key: "status",
      variant: "status",
      cells: [
        { type: "text", value: "Đủ điều kiện thanh toán", label: true },
        { type: "text", value: "" },
        { type: "text", value: "" },
        { type: "text", value: "" },
      ],
    },
  ]

  const handlePrincipalEditorOpen = () => {
    if (isFinalAnimating) return

    setOpenExplanationId(null)
    setDraftPrincipal(String(committedPrincipal))
    setIsEditingPrincipal(true)
  }

  const handlePrincipalChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const digitsOnly = event.target.value.replace(/[^\d]/g, "")
    setDraftPrincipal(digitsOnly)
  }

  const handlePrincipalCommit = () => {
    if (isFinalAnimating) return

    const normalizedPrincipal =
      draftPrincipal.trim() === "" ? DEFAULT_PRINCIPAL : Number(draftPrincipal)
    const nextPrincipal = Number.isFinite(normalizedPrincipal)
      ? normalizedPrincipal
      : DEFAULT_PRINCIPAL

    setDraftPrincipal(String(nextPrincipal))
    setOpenExplanationId(null)
    setIsEditingPrincipal(false)

    if (nextPrincipal === committedPrincipal) return

    setCommittedPrincipal(nextPrincipal)
  }

  const handlePrincipalKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      event.preventDefault()
      handlePrincipalCommit()
    }

    if (event.key === "Escape") {
      event.preventDefault()
      setDraftPrincipal(String(committedPrincipal))
      setIsEditingPrincipal(false)
    }
  }

  const toggleExplanation = (id: string | number): void => {
    setIsEditingPrincipal(false)

    setOpenExplanationId((currentId) => (currentId === id ? null : id))
  }

  const handlePrincipalClear = () => {
    if (isFinalAnimating) return

    setDraftPrincipal("")
    setOpenExplanationId(null)
    principalInputRef.current?.focus()
  }

  const renderPrincipalCell = () => {
    const isHintOpen = openExplanationId === "principal-hint"

    return (
      <div className="income-table-content">
        <div className="income-table-value-row income-table-principal-shell income-table-floating">
          <button
            type="button"
            className="income-table-trigger"
            disabled={isFinalAnimating}
            onClick={handlePrincipalEditorOpen}
          >
            {formattedPrincipal}
          </button>

          <span
            className={`income-table-explainer ${
              isHintOpen ? "income-table-explainer--open" : ""
            }`}
          >
            <button
              type="button"
              aria-expanded={isHintOpen}
              aria-label="Hiển thị hướng dẫn nhập vốn gốc"
              className="income-table-info-button"
              onClick={(event) => {
                event.stopPropagation()
                toggleExplanation("principal-hint")
              }}
            >
              <Info />
            </button>
            <span className="income-table-popup" role="tooltip">
              Chạm để nhập vốn gốc mới
            </span>
          </span>

          <div
            className={`income-table-popup income-table-popup--editor ${
              isEditingPrincipal ? "income-table-popup--visible" : ""
            }`}
          >
            <div className="income-table-editor">
              <div className="income-table-input-shell">
                <input
                  ref={principalInputRef}
                  aria-label="Vốn gốc CASH"
                  className="income-table-input income-table-input--with-clear"
                  disabled={isFinalAnimating}
                  inputMode="numeric"
                  onChange={handlePrincipalChange}
                  onKeyDown={handlePrincipalKeyDown}
                  type="text"
                  value={
                    draftPrincipal ? formatInteger(Number(draftPrincipal)) : ""
                  }
                />
                <button
                  type="button"
                  aria-label="Xóa vốn gốc"
                  className={`income-table-clear-button ${
                    draftPrincipal ? "income-table-clear-button--visible" : ""
                  }`}
                  disabled={isFinalAnimating || draftPrincipal.trim() === ""}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={handlePrincipalClear}
                >
                  <X />
                </button>
              </div>
              <button
                type="button"
                className="income-table-editor-button"
                disabled={isFinalAnimating}
                onClick={handlePrincipalCommit}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderValueWithInfo = (cell: Extract<CellType, { type: "valueWithInfo" }>): React.ReactElement => {
    const isOpen = openExplanationId === cell.explanationId

    return (
      <div className="income-table-content">
        <div className="income-table-value-row">
          <span className="income-table-value">{cell.value || EMPTY_CELL}</span>
          <span
            className={`income-table-explainer ${
              isOpen ? "income-table-explainer--open" : ""
            } income-table-floating`}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-label="Hiển thị cách tính"
              className="income-table-info-button"
              onClick={(event: React.MouseEvent<HTMLButtonElement>): void => {
                event.stopPropagation()
                toggleExplanation(cell.explanationId)
              }}
            >
              <Info />
            </button>
            <span className="income-table-popup" role="tooltip">
              {cell.explanation}
            </span>
          </span>
        </div>
      </div>
    )
  }

  const renderCellContent = (cell: CellType): React.ReactElement => {
    if (cell.type === "principal") {
      return renderPrincipalCell()
    }

    if (cell.type === "valueWithInfo") {
      return renderValueWithInfo(cell as Extract<CellType, { type: "valueWithInfo" }>)
    }

    return <span className="income-table-value">{cell.value || EMPTY_CELL}</span>
  }

  return (
    <section ref={sectionRef} className="table-section">
      <div ref={tableCardRef} className="table-card">
        <div className="table-scroll">
          <table className="income-table">
            <thead>
              <tr>
                {incomeTableColumns.map((column) => (
                  <th key={column} scope="col" className="income-table-head">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {incomeTableRows.map((row: TableRow) => (
                <tr
                  key={row.key}
                  className={`income-table-row income-table-row--${row.variant}`}
                >
                  {row.cells.map((cell: CellType, cellIndex: number) => (
                    <td
                      key={`${row.key}-${cellIndex}`}
                      className={`income-table-cell ${
                        "label" in cell && cell.label ? "income-table-cell--label" : ""
                      } ${
                        "emphasis" in cell && cell.emphasis ? "income-table-cell--emphasis" : ""
                      } ${
                        "highlight" in cell && cell.highlight ? "income-table-cell--highlight" : ""
                      }`}
                    >
                      {renderCellContent(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default Table
