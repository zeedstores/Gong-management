
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotice("")

    if (paymentMethod === "paystack") {
      window.open(PAYSTACK_LINK, "_blank", "noopener,noreferrer")
      setNotice(
        `Please enter GHS ${Number(product?.price).toLocaleString("en-GH")} on the Paystack page. Make sure the amount matches your order exactly. Gong Managements will verify your payment.`
      )
      return
    }

    setNotice(
      "Please transfer the exact amount shown in your order summary. Gong Managements will verify your payment."
    )
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
        <h1 className="text-2xl font-bold">{error || "Product unavailable"}</h1>
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
              <h2 className="mb-5 text-lg font-bold">Customer Information</h2>

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

            {paymentMethod === "bank_transfer" && (
              <div className="rounded-lg border border-[#d6aa33] bg-[#fffaf0] p-5">
                <h3 className="mb-3 font-bold">Bank Account Details</h3>
                <p className="text-sm">Account Name: GONG MANAGEMENTS</p>
                <p className="text-sm">Bank: Guaranty Trust Bank (Ghana) Limited</p>
                <p className="text-sm">Account Number: 3219002004060</p>
                <p className="mt-3 text-xs text-gray-600">
                  Confirm the accepted transfer currency and instructions with
                  Gong Managements before making payment.
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-black px-6 py-4 font-bold uppercase tracking-wider text-white transition hover:bg-[#a77c20]"
            >
              {paymentMethod === "paystack"
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
                When redirected to Paystack, enter the exact total shown here.
                Your payment will need to be verified by Gong Managements.
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  )
}
