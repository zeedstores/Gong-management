
import { useEffect, useMemo, useState } from "react"
import { Search, ShoppingBag } from "lucide-react"
import { supabase } from "../../lib/supabase"
import { useCart } from "../../components/CartContext"
import { Button, Eyebrow, Heading, PageHero } from "../../components/ui"

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  availability: string
  image_url: string | null
  category_id: string | null
  category: {
    name: string
  } | null
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const { add } = useCart()

  useEffect(() => {
    let active = true

    async function loadProducts() {
      setLoading(true)
      setError(false)

      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          description,
          price,
          availability,
          image_url,
          category_id,
          category:product_categories(name)
        `)
        .neq("availability", "Draft")
        .order("created_at", { ascending: false })

      if (!active) return

      if (error) {
        console.error("Error loading products:", error)
        setError(true)
        setProducts([])
      } else {
        setProducts((data ?? []) as Product[])
      }

      setLoading(false)
    }

    loadProducts()

    return () => {
      active = false
    }
  }, [])

  const categories = useMemo(
    () => [
      "All",
      ...new Set(
        products
          .map((product) => product.category?.name)
          .filter((name): name is string => Boolean(name)),
      ),
    ],
    [products],
  )

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase()

    return products.filter((product) => {
      const matchesCategory =
        category === "All" || product.category?.name === category

      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(search) ||
        product.description?.toLowerCase().includes(search)

      return matchesCategory && matchesSearch
    })
  }, [products, query, category])

  return (
    <>
      <PageHero
        eyebrow="Gong store"
        title="WEAR THE SOUND. CARRY THE CULTURE."
        copy="Explore official Gong merchandise and products inspired by the culture, music and experiences we create."
        image="/assets/event-choir.jpg"
      />

      <section className="section light-section py-16 sm:py-20 lg:py-28">
        <div className="shell">
          {/* SHOP INTRO */}
          <div className="mb-8 max-w-2xl sm:mb-10">
            <Eyebrow dark>The Gong store</Eyebrow>
            <Heading>
              FIND YOUR
              <br />
              GONG ESSENTIALS.
            </Heading>
          </div>

          {/* SEARCH AND FILTERS */}
          <div className="mb-8 space-y-5">
            <label className="flex w-full max-w-xl items-center gap-3 border border-black/15 bg-white px-4 py-3">
              <Search size={18} className="shrink-0 text-black/45" />

              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
                className="w-full bg-transparent text-sm text-black outline-none placeholder:text-black/40"
              />
            </label>

            {categories.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {categories.map((item) => (
                  <Button
                    key={item}
                    className={
                      category === item
                        ? "filter-active"
                        : "filter-button"
                    }
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* LOADING */}
          {loading && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div
                  key={item}
                  className="animate-pulse bg-white"
                >
                  <div className="aspect-[4/5] bg-black/10" />
                  <div className="space-y-3 p-3 sm:p-5">
                    <div className="h-3 w-1/3 bg-black/10" />
                    <div className="h-4 w-2/3 bg-black/10" />
                    <div className="h-5 w-1/2 bg-black/10" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="border border-black/10 bg-white p-6 sm:p-8">
              <h2 className="text-lg font-bold">Store unavailable</h2>
              <p className="mt-2 text-sm leading-7 text-black/60">
                We couldn't load the products right now. Please try again
                later.
              </p>
            </div>
          )}

          {/* EMPTY STORE */}
          {!loading && !error && products.length === 0 && (
            <div className="border border-black/10 bg-white p-8 text-center sm:p-12">
              <ShoppingBag
                size={32}
                className="mx-auto text-black/35"
              />
              <h2 className="mt-5 text-xl font-bold">The store is getting ready.</h2>
              <p className="mt-2 text-sm text-black/60">
                Check back soon for Gong products and merchandise.
              </p>
            </div>
          )}

          {/* PRODUCTS */}
          {!loading && !error && products.length > 0 && (
            <>
              <div className="mb-5 flex items-center justify-between gap-3">
                <p className="text-sm text-black/60">
                  {filtered.length}{" "}
                  {filtered.length === 1 ? "product" : "products"} found
                </p>
              </div>

              {filtered.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                  {filtered.map((product) => (
                    <article
                      key={product.id}
                      className="group min-w-0 overflow-hidden bg-white"
                    >
                      <div className="relative overflow-hidden bg-[#e8e4da]">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            loading="lazy"
                            decoding="async"
                            width="640"
                            height="800"
                            className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex aspect-[4/5] items-center justify-center">
                            <ShoppingBag
                              size={32}
                              className="text-black/25"
                            />
                          </div>
                        )}

                        <span className="absolute left-2 top-2 max-w-[85%] bg-black px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-white sm:left-3 sm:top-3 sm:text-[10px]">
                          {product.availability}
                        </span>
                      </div>

                      <div className="p-3 sm:p-5">
                        {product.category?.name && (
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-black/45 sm:text-xs">
                            {product.category.name}
                          </p>
                        )}

                        <h2 className="mt-1 line-clamp-2 text-sm font-bold sm:text-base">
                          {product.name}
                        </h2>

                        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <strong className="text-sm sm:text-base">
                            GHS {Number(product.price).toFixed(2)}
                          </strong>

                          <Button
                            onClick={() => add(product.id)}
                            className="w-full sm:w-auto"
                          >
                            <ShoppingBag size={15} />
                            Add to cart
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="border border-black/10 bg-white p-8 text-center">
                  <Heading>NO PRODUCTS FOUND.</Heading>
                  <p className="mt-3 text-sm text-black/60">
                    Try a different search or category.
                  </p>
                  <button
                    onClick={() => {
                      setQuery("")
                      setCategory("All")
                    }}
                    className="mt-5 text-sm font-semibold underline underline-offset-4"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
