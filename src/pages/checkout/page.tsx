
import { useEffect, useState, type FormEvent } from "react"
import { useParams, Link } from "react-router"
import { supabase } from "../../lib/supabase"

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  availability: string
}

type PaymentMethod = "paystack" | "bank_transfer"

type PaymentDetails = {
  account_name: string | null
  bank_name: string | null
  account_ghs: string | null
  payment_instructions: string | null
}

const PAYSTACK_LINK = "https://paystack.shop/pay/z44irmmv-s"

export default function CheckoutPage() {
  const { productId } = useParams()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("paystack")

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const [notice, setNotice] = useState("")
  const [paymentDetails, setPaymentDetails] =
    useState<PaymentDetails | null>(null)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError("Product not found.")
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("products")
        .select("id, name, description, price, image_url, availability")
        .eq("id", productId)
        .neq("availability", "Draft")
        .maybeSingle()

      if (error || !data) {
        setError("We couldn't find this product.")
      } else {
        setProduct(data)
      }

      setLoading(false)
    }

    fetchProduct()
  }, [productId])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotice("")

    if (paymentMethod === "paystack") {
      window.open(PAYSTACK_LINK, "_blank", "noopener,noreferrer")

      setNotice(
        `Please enter GHS ${Number(product?.price).toLocaleString("en-GH")} on the Paystack page. Make sure the amount matches your order exactly. Gong Managements will verify your payment.`
      )
      return
    }

    setPaymentLoading(true)

    const { data, error } = await supabase
      .from("payment_settings")
      .select(
        "account_name, bank_name, account_ghs, payment_instructions"
      )
      .eq("id", true)
      .maybeSingle()

    setPaymentLoading(false)

    if (error || !data) {
      setNotice("Unable to load bank details. Please try again.")
      console.error("Payment details error:", error?.message)
      return
    }

    if (!data.account_ghs) {
      setNotice("Bank account details are currently unavailable.")
      return
    }

    setPaymentDetails(data)
    setPaymentModalOpen(true)
  }

  const copyAccountNumber = async () => {
    if (!paymentDetails?.account_ghs) return

    try {
      await navigator.clipboard.writeText(paymentDetails.account_ghs)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setNotice("Unable to copy account number. Please copy it manually.")
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f3f0e8] px-5 py-24 text-center">
        Loading checkout...
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#f3f0e8] px-5 py-24 text-center">
        <h1 className="text-2xl font-bold">
          {error || "Product unavailable"}
        </h1>
        <Link to="/shop" className="mt-6 inline-block underline">
          Return to Store
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f3f0e8] px-5 py-12 md:py-20">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/shop"
          className="mb-8 inline-block text-sm font-semibold text-gray-600 hover:text-black"
        >
          ← Back to Store
        </Link>

        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#a77c20]">
            Gong Managements Store
          </p>
          <h1 className="mt-3 text-3xl font-black uppercase md:text-5xl">
            Checkout
          </h1>
          <p className="mt-3 text-gray-600">
            Complete your details and select your preferred payment method.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-[1fr_0.85fr]">
          <form
            onSubmit={handleSubmit}
            className="space-y-7 rounded-xl bg-white p-6 shadow-sm md:p-8"
          >
            <section>
              <h2 className="mb-5 text-lg font-bold">
                Customer Information
              </h2>

              <div className="space-y-4">
                <input
                  required
                  type="text"
                  placeholder="Full name"
                  value={customer.name}
                  onChange={(e) =>
                    setCustomer({ ...customer, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />

                <input
                  required
                  type="email"
                  placeholder="Email address"
                  value={customer.email}
                  onChange={(e) =>
                    setCustomer({ ...customer, email: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />

                <input
                  required
                  type="tel"
                  placeholder="Phone number"
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer({ ...customer, phone: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>
            </section>

            <section>
              <h2 className="mb-5 text-lg font-bold">Payment Method</h2>

              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-300 p-4">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "paystack"}
                    onChange={() => {
                      setPaymentMethod("paystack")
                      setNotice("")
                    }}
                  />
                  <span>
                    <span className="block font-semibold">Paystack</span>
                    <span className="text-sm text-gray-500">
                      Pay securely online
                    </span>
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-300 p-4">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "bank_transfer"}
                    onChange={() => {
                      setPaymentMethod("bank_transfer")
                      setNotice("")
                    }}
                  />
                  <span>
                    <span className="block font-semibold">
                      Direct Bank Transfer
                    </span>
                    <span className="text-sm text-gray-500">
                      Transfer directly to Gong Managements
                    </span>
                  </span>
                </label>
              </div>
            </section>

            <button
              type="submit"
              disabled={paymentLoading}
              className="w-full rounded-lg bg-black px-6 py-4 font-bold uppercase tracking-wider text-white transition hover:bg-[#a77c20] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {paymentLoading
                ? "Loading payment details..."
                : paymentMethod === "paystack"
                  ? "Continue to Paystack"
                  : "Continue"}
            </button>

            {notice && (
              <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                {notice}
              </p>
            )}
          </form>

          <aside className="h-fit rounded-xl bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-6 text-lg font-bold">Order Summary</h2>

            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="mb-5 h-56 w-full rounded-lg bg-gray-100 object-contain"
              />
            )}

            <h3 className="text-xl font-bold">{product.name}</h3>

            {product.description && (
              <p className="mt-2 text-sm text-gray-500">
                {product.description}
              </p>
            )}

            <div className="my-6 border-t border-gray-200 pt-5">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Quantity</span>
                <span className="font-semibold">1</span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="font-bold">Total</span>
                <span className="text-2xl font-black">
                  GHS {Number(product.price).toLocaleString("en-GH")}
                </span>
              </div>
            </div>

            {paymentMethod === "paystack" && (
              <p className="rounded-lg bg-gray-100 p-4 text-xs leading-5 text-gray-600">
                When redirected to Paystack, enter the exact total shown
                here. Your payment will need to be verified by Gong
                Managements.
              </p>
            )}
          </aside>
        </div>
      </div>

      {/* Bank Transfer Modal */}
      {paymentModalOpen && paymentDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4"
          onClick={() => setPaymentModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-modal-title"
            className="my-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a77c20]">
                  Gong Managements
                </p>
                <h2
                  id="payment-modal-title"
                  className="mt-2 text-2xl font-black"
                >
                  Complete Payment
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Transfer to the account below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPaymentModalOpen(false)}
                aria-label="Close payment details"
                className="rounded-full bg-gray-100 px-3 py-2 text-lg hover:bg-gray-200"
              >
                ×
              </button>
            </div>

            <div className="rounded-xl bg-[#fff8e8] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Amount to pay
              </p>
              <p className="mt-2 text-3xl font-black">
                GHS {Number(product.price).toLocaleString("en-GH")}
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Bank
                </p>
                <p className="mt-1 font-bold">
                  {paymentDetails.bank_name || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Account name
                </p>
                <p className="mt-1 font-bold">
                  {paymentDetails.account_name || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Account number
                </p>

                <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <span className="break-all text-lg font-bold tracking-wider">
                    {paymentDetails.account_ghs}
                  </span>

                  <button
                    type="button"
                    onClick={copyAccountNumber}
                    className="shrink-0 rounded-lg bg-black px-4 py-2 text-xs font-bold text-white hover:bg-[#a77c20]"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            {paymentDetails.payment_instructions && (
              <div className="mt-6 rounded-lg bg-gray-100 p-4">
                <p className="mb-2 text-sm font-bold">
                  Payment Instructions
                </p>
                <p className="whitespace-pre-line text-sm leading-6 text-gray-600">
                  {paymentDetails.payment_instructions}
                </p>
              </div>
            )}

            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm leading-6 text-amber-900">
                Please transfer the exact amount shown above. Keep your
                payment receipt for verification. Your order is not
                confirmed until Gong Managements verifies the payment.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setPaymentModalOpen(false)}
              className="mt-6 w-full rounded-lg bg-black px-6 py-4 font-bold uppercase tracking-wider text-white hover:bg-[#a77c20]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
