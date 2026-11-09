
import { useState } from "react"
import { Link } from "react-router"
import { Minus, Plus, Trash2, CreditCard } from "lucide-react"
import { useCart } from "../../components/CartContext"
import {
  Button,
  ButtonLink,
  Heading,
  PageHero,
} from "../../components/ui"
import PaymentModal from "../../components/PaymentModal"

export default function CartPage() {
  const {
    cart,
    products,
    total,
    loading,
    setQuantity,
    remove,
  } = useCart()

  const [paymentOpen, setPaymentOpen] = useState(false)

  const items = products.filter((product) => cart[product.id])

  const orderItems = items.map((product) => ({
    name: product.name,
    quantity: cart[product.id],
    unitPrice: Number(product.price),
  }))

  return (
    <>
      <PageHero
        eyebrow="Your order"
        title="REVIEW THE BAG."
        copy="Review your selected products and complete your order securely."
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
                        setQuantity(product.id, cart[product.id] - 1)
                      }
                      disabled={cart[product.id] <= 1}
                    >
                      <Minus size={15} />
                    </Button>

                    <span>{cart[product.id]}</span>

                    <Button
                      onClick={() =>
                        setQuantity(product.id, cart[product.id] + 1)
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
                  Add something from the shop to begin an order.
                </p>
                <ButtonLink to="/shop">
                  Explore the shop
                </ButtonLink>
              </div>
            )}
          </div>

          <aside className="order-summary">
            <span>Order summary</span>

            <h2>GHS {total.toFixed(2)}</h2>

            <p>
              Review your order total and proceed to the available payment
              options. Delivery or collection arrangements can be confirmed
              with Gong Management.
            </p>

            {items.length > 0 && !loading && (
              <Button
                onClick={() => setPaymentOpen(true)}
                className="w-full"
              >
                <CreditCard size={18} />
                Proceed to payment
              </Button>
            )}

            <Link to="/shop">Continue shopping</Link>
          </aside>
        </div>
      </section>

      {paymentOpen && (
        <PaymentModal
          onClose={() => setPaymentOpen(false)}
          purpose="shop"
          amount={total}
          orderItems={orderItems}
        />
      )}
    </>
  )
}
