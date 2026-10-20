import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { products } from "../data/mockData"

type Cart = Record<string, number>
type CartContextValue = {
  cart: Cart
  count: number
  total: number
  add: (id: string) => void
  remove: (id: string) => void
  setQuantity: (id: string, qty: number) => void
}
const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({})
  const value = useMemo(
    () => ({
      cart,
      count: Object.values(cart).reduce((a, b) => a + b, 0),
      total: products.reduce(
        (sum, product) => sum + product.price * (cart[product.id] || 0),
        0,
      ),
      add: (id: string) =>
        setCart((current) => ({ ...current, [id]: (current[id] || 0) + 1 })),
      remove: (id: string) =>
        setCart((current) => {
          const next = { ...current }
          delete next[id]
          return next
        }),
      setQuantity: (id: string, qty: number) =>
        setCart((current) => ({ ...current, [id]: Math.max(1, qty) })),
    }),
    [cart],
  )
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error("useCart must be used inside CartProvider")
  return value
}
