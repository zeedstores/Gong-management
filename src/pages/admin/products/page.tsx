import { useState } from "react"
import { Edit3, Plus, Trash2 } from "lucide-react"
import { products as initialProducts } from "../../../data/mockData"
import { Button, Field, Select } from "../../../components/ui"

export default function AdminProductsPage() {
  const [items, setItems] = useState(initialProducts)
  const [adding, setAdding] = useState(false)
  return (
    <main className="admin-page">
      <div className="admin-title">
        <div>
          <span>Store</span>
          <h1>PRODUCTS</h1>
          <p>
            Manage the demonstration catalogue. Refreshing resets mock changes.
          </p>
        </div>
        <Button onClick={() => setAdding(!adding)}>
          <Plus size={17} />
          Add product
        </Button>
      </div>
      {adding && (
        <form
          className="admin-form"
          onSubmit={(e) => {
            e.preventDefault()
            setItems([
              ...items,
              {
                id: `demo-${Date.now()}`,
                name: "New demo product",
                category: "Uncategorised",
                price: 0,
                availability: "Draft",
                image: "/assets/event-stage.jpg",
              },
            ])
            setAdding(false)
          }}
        >
          <Field
            label="Product name"
            required
            defaultValue="New demo product"
          />
          <Field label="Price (GHS)" type="number" defaultValue="0" />
          <Select label="Availability">
            <option>Draft</option>
            <option>Available</option>
            <option>Out of stock</option>
          </Select>
          <Button type="submit">Create demo product</Button>
        </form>
      )}
      <div className="admin-table">
        <div className="table-head">
          <span>Product</span>
          <span>Category</span>
          <span>Price</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {items.map((item) => (
          <div className="table-row" key={item.id}>
            <div className="table-product">
              <img src={item.image} alt="" />
              <strong>{item.name}</strong>
            </div>
            <span>{item.category}</span>
            <span>GHS {item.price.toFixed(2)}</span>
            <span className="table-status">{item.availability}</span>
            <div className="row-actions">
              <button
                aria-label="Edit"
                disabled
                title="Editing requires persistent storage"
              >
                <Edit3 size={17} />
              </button>
              <button
                aria-label="Delete"
                onClick={() => setItems(items.filter((p) => p.id !== item.id))}
              >
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
