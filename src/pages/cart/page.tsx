
import { Link } from "react-router"
import { Minus, Plus, Trash2, MessageCircle } from "lucide-react"
import { useCart } from "../../components/CartContext"
import {
  Button,
  ButtonLink,
  Heading,
  PageHero,
} from "../../components/ui"

export default function CartPage() {
  const {
    cart,
    products,
    total,
    loading,
    setQuantity,
    remove,
  } = useCart()

  const items = products.filter((product) => cart[product.id])

  const checkoutOnWhatsApp = () => {
    // WhatsApp number will be loaded from Admin Settings later.
    // Do not hardcode a business number here.
    const whatsappNumber = ""

    if (!whatsappNumber) {
      alert(
        "WhatsApp ordering is currently unavailable. Please contact Gong Management.",
      )
      return
    }

    const orderLines = items.map((product, index) => {
      const quantity = cart[product.id]
      const unitPrice = Number(product.price)
      const subtotal = unitPrice * quantity

      return [
        `${index + 1}. ${product.name}`,
        `Quantity: ${quantity}`,
        `Unit price: GHS ${unitPrice.toFixed(2)}`,
        `Subtotal: GHS ${subtotal.toFixed(2)}`,
      ].join("\n")
    })

    const message = [
      "Hello Gong Management, I would like to place an order.",
      "",
      ...orderLines.flatMap((line) => [line, ""]),
      `TOTAL: GHS ${total.toFixed(2)}`,
      "",
      "Please confirm product availability, delivery/collection options and payment details.",
      "",
      "Thank you.",
    ].join("\n")

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <>
      <PageHero
        eyebrow="Your order"
        title="REVIEW THE BAG."
        copy="Review your selected products and prepare your order request for WhatsApp checkout."
      />

      <section className="section light-section">
        <div className="shell cart-layout">
          <div>
            {loading ? (
              <div className="space-y-5">
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="h-32 animate-pulse rounded bg-black/10"
                  />
                ))}
              </div>
            ) : items.length > 0 ? (
              items.map((product) => (
                <article className="cart-item" key={product.id}>
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      width={160}
                      height={160}
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center bg-black/5">
                      No image
                    </div>
                  )}

                  <div>
                    <span>Gong Store</span>
                    <h2>{product.name}</h2>
                    <strong>
                      GHS {Number(product.price).toFixed(2)}
                    </strong>
                    <p>
                      Subtotal: GHS{" "}
                      {(Number(product.price) * cart[product.id]).toFixed(2)}
                    </p>
                  </div>

                  <div className="quantity">
                    <Button
                      onClick={() =>
                        setQuantity(
                          product.id,
                          cart[product.id] - 1,
                        )
                      }
                      disabled={cart[product.id] <= 1}
                    >
                      <Minus size={15} />
                    </Button>

                    <span>{cart[product.id]}</span>

                    <Button
                      onClick={() =>
                        setQuantity(
                          product.id,
                          cart[product.id] + 1,
                        )
                      }
                    >
                      <Plus size={15} />
                    </Button>
                  </div>

                  <Button
                    className="remove"
                    onClick={() => remove(product.id)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <Heading>YOUR BAG IS QUIET.</Heading>
                <p>
                  Add something from the shop to begin an order request.
                </p>
                <ButtonLink to="/shop">
                  Explore the shop
                </ButtonLink>
              </div>
            )}
          </div>

          <aside className="order-summary">
            <span>Order request summary</span>

            <h2>GHS {total.toFixed(2)}</h2>

            <p>
              Delivery, collection and payment details will be
              confirmed directly by Gong Management.
            </p>

            {items.length > 0 && !loading && (
              <Button
                onClick={checkoutOnWhatsApp}
                className="w-full"
              >
                <MessageCircle size={18} />
                Checkout on WhatsApp
              </Button>
            )}

            <Link to="/shop">Continue shopping</Link>
          </aside>
        </div>
      </section>
    </>
  )
}
