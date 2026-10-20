import { Link } from "react-router"
import { Minus, Plus, Trash2 } from "lucide-react"
import { products } from "../../data/mockData"
import { useCart } from "../../components/CartContext"
import { Button, ButtonLink, Heading, PageHero } from "../../components/ui"

export default function CartPage() {
  const { cart, total, setQuantity, remove } = useCart()
  const items = products.filter((p) => cart[p.id])
  return (
    <>
      <PageHero
        eyebrow="Your order"
        title="REVIEW THE BAG."
        copy="Orders currently use a request-based checkout. No payment is processed in this prototype."
      />
      <section className="section light-section">
        <div className="shell cart-layout">
          <div>
            {items.length ? (
              items.map((product) => (
                <article className="cart-item" key={product.id}>
                  <img src={product.image} alt="" />
                  <div>
                    <span>{product.category}</span>
                    <h2>{product.name}</h2>
                    <strong>GHS {product.price.toFixed(2)}</strong>
                  </div>
                  <div className="quantity">
                    <Button
                      onClick={() =>
                        setQuantity(product.id, cart[product.id] - 1)
                      }
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
                  <Button className="remove" onClick={() => remove(product.id)}>
                    <Trash2 size={18} />
                  </Button>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <Heading>YOUR BAG IS QUIET.</Heading>
                <p>Add something from the shop to begin an order request.</p>
                <ButtonLink to="/shop">Explore the shop</ButtonLink>
              </div>
            )}
          </div>
          <aside className="order-summary">
            <span>Order request summary</span>
            <h2>GHS {total.toFixed(2)}</h2>
            <p>
              Delivery, collection and payment details will be confirmed
              directly by Gong Management.
            </p>
            {items.length > 0 && (
              <ButtonLink to="/booking">Continue order request</ButtonLink>
            )}
            <Link to="/shop">Continue shopping</Link>
          </aside>
        </div>
      </section>
    </>
  )
}
