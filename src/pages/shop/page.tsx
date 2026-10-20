import { useMemo, useState } from "react"
import { Search, ShoppingBag } from "lucide-react"
import { products } from "../../data/mockData"
import { useCart } from "../../components/CartContext"
import { Button, Eyebrow, Heading, PageHero } from "../../components/ui"

export default function ShopPage() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All")
  const { add } = useCart()
  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (category === "All" || p.category === category) &&
          p.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, category],
  )
  return (
    <>
      <PageHero
        eyebrow="Gong store"
        title="WEAR THE SOUND. CARRY THE CULTURE."
        copy="A flexible storefront demonstration. Products, prices, imagery and availability are managed from one data source."
        image="/assets/event-choir.jpg"
      />
      <section className="section light-section">
        <div className="shell shop-toolbar">
          <label>
            <Search size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products"
            />
          </label>
          <div>
            {["All", ...new Set(products.map((p) => p.category))].map(
              (item) => (
                <Button
                  className={
                    category === item ? "filter-active" : "filter-button"
                  }
                  onClick={() => setCategory(item)}
                  key={item}
                >
                  {item}
                </Button>
              ),
            )}
          </div>
        </div>
        <div className="shell shop-grid">
          {filtered.map((product) => (
            <article key={product.id}>
              <div className="shop-image">
                <img src={product.image} alt="" loading="lazy" />
                <span>{product.availability}</span>
              </div>
              <Eyebrow dark>{product.category}</Eyebrow>
              <h2>{product.name}</h2>
              <div className="shop-buy">
                <strong>GHS {product.price.toFixed(2)}</strong>
                <Button onClick={() => add(product.id)}>
                  <ShoppingBag size={17} />
                  Add to cart
                </Button>
              </div>
            </article>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="empty-state">
            <Heading>NO PRODUCTS FOUND.</Heading>
            <p>Try a different search or category.</p>
          </div>
        )}
      </section>
    </>
  )
}
