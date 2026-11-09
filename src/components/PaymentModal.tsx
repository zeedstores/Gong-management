
import { useEffect, useState } from "react"
import {
  X,
  Copy,
  Check,
  ExternalLink,
  CreditCard,
  MessageCircle,
  Loader2,
} from "lucide-react"
import { supabase } from "../lib/supabase"

type PaymentSettings = {
  account_name: string | null
  bank_name: string | null
  account_ghs: string | null
  account_usd: string | null
  account_gbp: string | null
  account_eur: string | null
  paystack_url: string | null
  payment_instructions: string | null
}

type SiteSettings = {
  whatsapp_number: string | null
}

type Currency = "GHS" | "USD" | "GBP" | "EUR"

type OrderItem = {
  name: string
  quantity: number
  unitPrice: number
}

type Props = {
  onClose: () => void
  purpose?: "donation" | "shop" | "property"
  amount?: number
  orderItems?: OrderItem[]
  propertyTitle?: string
}

const currencies: {
  code: Currency
  label: string
  key: keyof PaymentSettings
}[] = [
  { code: "GHS", label: "Ghana Cedi", key: "account_ghs" },
  { code: "USD", label: "US Dollar", key: "account_usd" },
  { code: "GBP", label: "British Pound", key: "account_gbp" },
  { code: "EUR", label: "Euro", key: "account_eur" },
]

export default function PaymentModal({
  onClose,
  purpose = "donation",
  amount,
  orderItems = [],
  propertyTitle,
}: Props) {
  const isShopOrder = purpose === "shop"
  const isProperty = purpose === "property"

  const [settings, setSettings] = useState<PaymentSettings | null>(null)
  const [whatsapp, setWhatsapp] = useState("")
  const [currency, setCurrency] = useState<Currency>("GHS")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true

    async function loadPaymentDetails() {
      setLoading(true)
      setError("")

      const [paymentResult, siteResult] = await Promise.all([
        supabase
          .from("payment_settings")
          .select(
            "account_name, bank_name, account_ghs, account_usd, account_gbp, account_eur, paystack_url, payment_instructions"
          )
          .eq("id", true)
          .single(),

        supabase
          .from("site_settings")
          .select("whatsapp_number")
          .eq("id", true)
          .single(),
      ])

      if (!active) return

      if (paymentResult.error) {
        console.error("Payment settings error:", paymentResult.error.message)
        setError("Unable to load payment details. Please try again later.")
        setLoading(false)
        return
      }

      const payment = paymentResult.data as PaymentSettings
      setSettings(payment)
      setWhatsapp(
        (siteResult.data as SiteSettings | null)?.whatsapp_number ?? ""
      )

      const firstAvailable = currencies.find((item) => payment[item.key])

      if (firstAvailable) {
        setCurrency(firstAvailable.code)
      }

      setLoading(false)
    }

    loadPaymentDetails()

    return () => {
      active = false
    }
  }, [])

  const selectedCurrency = currencies.find(
    (item) => item.code === currency
  )

  const accountNumber =
    selectedCurrency && settings ? settings[selectedCurrency.key] : null

  const availableCurrencies = currencies.filter(
    (item) => settings?.[item.key]
  )

  async function copyAccountNumber() {
    if (!accountNumber) return

    try {
      await navigator.clipboard.writeText(accountNumber)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setError("Unable to copy account number. Please copy it manually.")
    }
  }

  function verifyOnWhatsApp() {
    if (!whatsapp) {
      setError(
        "WhatsApp contact is not available. Please contact Gong Management."
      )
      return
    }

    let messageText = ""

    if (isProperty) {
      messageText = [
        "PROPERTY ENQUIRY",
        `Property: ${propertyTitle ?? "Selected property"}`,
        `Asking price: GHS ${(amount ?? 0).toLocaleString("en-GH")}`,
        "",
        "I am interested in this property. Please confirm its availability and provide the verified purchase process and payment instructions.",
      ].join("\n")
    } else if (isShopOrder) {
      messageText = [
        "SHOP ORDER",
        ...orderItems.map(
          (item, index) =>
            `${index + 1}. ${item.name} x ${item.quantity} — GHS ${(item.unitPrice * item.quantity).toFixed(2)}`
        ),
        "",
        `ORDER TOTAL: GHS ${(amount ?? 0).toFixed(2)}`,
        "",
        "I have made my payment. Please find my receipt attached for verification.",
      ].join("\n")
    } else {
      messageText =
        "I have made a donation and would like to submit my payment receipt for verification."
    }

    const phone = whatsapp.replace(/\D/g, "")
    const message = encodeURIComponent(
      `Hello Gong Management,\n\n${messageText}`
    )

    window.open(
      `https://wa.me/${phone}?text=${message}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  const title = isProperty
    ? "Property payment options"
    : isShopOrder
      ? "Complete your order"
      : "Make a contribution"

  const heading = isProperty
    ? "Gong Properties"
    : isShopOrder
      ? "Gong Store"
      : "Gong Foundation"

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
        className="relative my-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white text-[#090909] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-[#090909] px-6 py-5 text-white">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d6aa33]">
              {heading}
            </p>
            <h2 id="payment-modal-title" className="mt-1 text-2xl font-bold">
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close payment modal"
            className="rounded-full p-2 transition hover:bg-white/10"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin text-[#d6aa33]" size={32} />
              <p className="mt-3 text-sm text-black/60">
                Loading payment details...
              </p>
            </div>
          ) : error && !settings ? (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : settings ? (
            <>
              {isProperty && (
                <div className="rounded-lg border border-black/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-black/50">
                    Selected property
                  </p>
                  <h3 className="mt-1 font-bold">
                    {propertyTitle ?? "Selected property"}
                  </h3>
                  <p className="mt-3 text-xs text-black/50">Asking price</p>
                  <strong className="text-2xl">
                    GHS {(amount ?? 0).toLocaleString("en-GH")}
                  </strong>
                </div>
              )}

              {isShopOrder && (
                <div className="rounded-lg border border-black/10 p-4">
                  <h3 className="font-bold">Your order</h3>

                  <div className="mt-3 space-y-3">
                    {orderItems.map((item, index) => (
                      <div
                        key={`${item.name}-${index}`}
                        className="flex justify-between gap-4 text-sm"
                      >
                        <span className="text-black/65">
                          {item.name} × {item.quantity}
                        </span>
                        <strong className="shrink-0">
                          GHS {(item.unitPrice * item.quantity).toFixed(2)}
                        </strong>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4">
                    <span className="font-bold">Total to pay</span>
                    <strong className="text-xl">
                      GHS {(amount ?? 0).toFixed(2)}
                    </strong>
                  </div>
                </div>
              )}

              {isProperty && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
                  <h3 className="font-bold text-amber-950">
                    Important: Confirm before payment
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-amber-900">
                    This is an asking price, not a payment instruction.
                    Contact Gong Management first to confirm availability,
                    ownership documentation, agreed price and the verified
                    payment process. Do not transfer money until these details
                    have been confirmed.
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-bold">Bank transfer</h3>
                <p className="mt-1 text-sm text-black/60">
                  {isProperty
                    ? "The account details below are provided for reference. Confirm the correct payment amount and instructions with Gong Management before transferring."
                    : isShopOrder
                      ? "Transfer the order total to the bank account below."
                      : "Transfer your contribution directly to our bank account."}
                </p>
              </div>

              <div className="rounded-lg border border-black/10 p-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-black/50">Bank name</p>
                    <p className="font-semibold">
                      {settings.bank_name || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-black/50">Account name</p>
                    <p className="font-semibold">
                      {settings.account_name || "Not provided"}
                    </p>
                  </div>
                </div>

                {availableCurrencies.length > 0 && (
                  <>
                    <div className="mt-5">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-black/55">
                        Select account currency
                      </label>

                      <div className="grid grid-cols-4 gap-2">
                        {availableCurrencies.map((item) => (
                          <button
                            key={item.code}
                            type="button"
                            onClick={() => {
                              setCurrency(item.code)
                              setCopied(false)
                            }}
                            className={`rounded-md border px-2 py-2 text-sm font-bold transition ${
                              currency === item.code
                                ? "border-[#d6aa33] bg-[#d6aa33] text-black"
                                : "border-black/15 hover:border-[#d6aa33]"
                            }`}
                          >
                            {item.code}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs text-black/50">
                        {selectedCurrency?.label} account number
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-3 rounded-md bg-[#f5f3ed] p-3">
                        <span className="break-all font-bold tracking-wide">
                          {accountNumber}
                        </span>

                        <button
                          type="button"
                          onClick={copyAccountNumber}
                          className="flex shrink-0 items-center gap-1 text-sm font-semibold text-[#72530b] hover:text-black"
                        >
                          {copied ? <Check size={17} /> : <Copy size={17} />}
                          {copied ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {settings.payment_instructions && (
                <div className="rounded-lg bg-[#f5f3ed] p-4">
                  <h4 className="text-sm font-bold">Payment instructions</h4>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-black/65">
                    {settings.payment_instructions}
                  </p>
                </div>
              )}

              {settings.paystack_url && (
                <div>
                  <a
                    href={settings.paystack_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-[#d6aa33] px-5 py-3 font-bold text-black transition hover:bg-[#c39720]"
                  >
                    <CreditCard size={18} />
                    Pay with Paystack
                    <ExternalLink size={15} />
                  </a>

                  {isShopOrder && (
                    <p className="mt-2 text-xs leading-relaxed text-black/50">
                      Enter the exact order total of GHS{" "}
                      {(amount ?? 0).toFixed(2)} when completing your payment.
                    </p>
                  )}
                  {isProperty && (
                    <p className="mt-2 text-xs leading-relaxed text-amber-800">
                      Contact Gong Management before using this payment link.
                      Confirm that it is approved for this property transaction.
                    </p>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={verifyOnWhatsApp}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[#090909] px-5 py-3 font-bold text-white transition hover:bg-[#262626]"
              >
                <MessageCircle size={18} />
                {isProperty
                  ? "Discuss this property on WhatsApp"
                  : "Submit payment receipt on WhatsApp"}
              </button>

              <p className="text-center text-xs leading-relaxed text-black/45">
                {isProperty
                  ? "Our team can help confirm availability and guide you through the purchase process."
                  : "After making your payment, send your receipt to Gong Management through WhatsApp for verification."}
              </p>

              {error && <p className="text-sm text-red-600">{error}</p>}
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
