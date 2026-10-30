
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { supabase } from "../lib/supabase"

export type CartProduct = {
  id: string
  name: string
  price: number
  image_url: string | null
  category_id: string | null
  availability: string
}

type Cart = Record<string, number>

type CartContextValue = {
  cart: Cart
  products: CartProduct[]
  count: number
  total: number
  loading: boolean
  add: (id: string) => void
  remove: (id: string) => void
  setQuantity: (id: string, qty: number) => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({})
  const [products, setProducts] = useState<CartProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, price, image_url, category_id, availability",
        )
        .neq("availability", "Draft")

      if (error) {
        console.error("Cart products error:", error)
      } else {
        setProducts(data ?? [])
      }

      setLoading(false)
    }

    fetchProducts()
  }, [])

  const value = useMemo(() => {
    const count = Object.values(cart).reduce(
      (sum, quantity) => sum + quantity,
      0,
    )

    const total = products.reduce(
      (sum, product) =>
        sum + Number(product.price) * (cart[product.id] || 0),
      0,
    )

    return {
      cart,
      products,
      count,
      total,
      loading,

      add: (id: string) =>
        setCart((current) => ({
          ...current,
          [id]: (current[id] || 0) + 1,
        })),

      remove: (id: string) =>
        setCart((current) => {
          const next = { ...current }
          delete next[id]
          return next
        }),

      setQuantity: (id: string, qty: number) =>
        setCart((current) => ({
          ...current,
          [id]: Math.max(1, qty),
        })),
    }
  }, [cart, products, loading])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const value = useContext(CartContext)

  if (!value) {
    throw new Error("useCart must be used inside CartProvider")
  }

  return value
}
