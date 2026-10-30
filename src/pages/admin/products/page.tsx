
import { useEffect, useRef, useState } from "react"
import { Edit3, Plus, Search, Trash2, X, ImagePlus } from "lucide-react"
import { supabase } from "../../../lib/supabase"
import { Button } from "../../../components/ui"

type Category = {
  id: string
  name: string
}

type Product = {
  id: string
  name: string
  category_id: string | null
  description: string | null
  price: number
  availability: "Draft" | "Available" | "Out of stock"
  image_url: string | null
  image_path: string | null
  product_categories: Category | null
}

type ProductForm = {
  name: string
  category_id: string
  description: string
  price: string
  availability: Product["availability"]
}

const emptyForm: ProductForm = {
  name: "",
  category_id: "",
  description: "",
  price: "",
  availability: "Draft",
}

const BUCKET = "product-images"

export default function AdminProductsPage() {
  const [items, setItems] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState("")
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [categoryError, setCategoryError] = useState("")
  const [message, setMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    const [productsResult, categoriesResult] = await Promise.all([
      supabase
        .from("products")
        .select("*, product_categories(id, name)")
        .order("created_at", { ascending: false }),
      supabase
        .from("product_categories")
        .select("id, name")
        .order("name"),
    ])

    if (productsResult.error) {
      setMessage(productsResult.error.message)
    } else {
      setItems((productsResult.data || []) as Product[])
    }

    if (categoriesResult.error) {
      setMessage(categoriesResult.error.message)
    } else {
      setCategories(categoriesResult.data || [])
    }

    setLoading(false)
  }

  function openCreateModal() {
    setEditing(null)
    setForm(emptyForm)
    setImageFile(null)
    setImagePreview("")
    setModalOpen(true)
    setMessage("")
  }

  function openEditModal(product: Product) {
    setEditing(product)
    setForm({
      name: product.name,
      category_id: product.category_id || "",
      description: product.description || "",
      price: String(product.price),
      availability: product.availability,
    })
    setImageFile(null)
    setImagePreview(product.image_url || "")
    setModalOpen(true)
    setMessage("")
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
    setImageFile(null)
    setImagePreview("")
    setForm(emptyForm)
  }

  function handleImageChange(file?: File) {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image must be smaller than 5MB.")
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setMessage("")
  }

  async function createCategory() {
    const name = newCategory.trim()

    if (!name) return

    setCategoryError("")

    const { data, error } = await supabase
      .from("product_categories")
      .insert({ name })
      .select("id, name")
      .single()

    if (error) {
      setCategoryError(error.message)
      return
    }

    setCategories((current) =>
      [...current, data].sort((a, b) => a.name.localeCompare(b.name))
    )
    setForm((current) => ({ ...current, category_id: data.id }))
    setNewCategory("")
  }

  async function deleteCategory(category: Category) {
    const confirmed = window.confirm(
      `Delete the category "${category.name}"? Products in this category will become uncategorised.`
    )

    if (!confirmed) return

    const { error } = await supabase
      .from("product_categories")
      .delete()
      .eq("id", category.id)

    if (error) {
      setMessage(error.message)
      return
    }

    setCategories((current) =>
      current.filter((item) => item.id !== category.id)
    )

    if (form.category_id === category.id) {
      setForm((current) => ({ ...current, category_id: "" }))
    }
  }

  async function saveProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setMessage("")

    let imageUrl = editing?.image_url || null
    let imagePath = editing?.image_path || null

    try {
      if (imageFile) {
        const extension = imageFile.name.split(".").pop() || "jpg"
        const path = `${crypto.randomUUID()}.${extension}`

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, imageFile, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) throw uploadError

        const { data } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(path)

        imageUrl = data.publicUrl
        imagePath = path
      }

      const productData = {
        name: form.name.trim(),
        category_id: form.category_id || null,
        description: form.description.trim() || null,
        price: Number(form.price),
        availability: form.availability,
        image_url: imageUrl,
        image_path: imagePath,
      }

      let error

      if (editing) {
        const result = await supabase
          .from("products")
          .update(productData)
          .eq("id", editing.id)

        error = result.error
      } else {
        const result = await supabase
          .from("products")
          .insert(productData)

        error = result.error
      }

      if (error) {
        if (imageFile && imagePath && imagePath !== editing?.image_path) {
          await supabase.storage.from(BUCKET).remove([imagePath])
        }
        throw error
      }

      if (
        editing?.image_path &&
        imageFile &&
        editing.image_path !== imagePath
      ) {
        await supabase.storage
          .from(BUCKET)
          .remove([editing.image_path])
      }

      closeModal()
      await loadData()
      setMessage(editing ? "Product updated successfully." : "Product created successfully.")
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      )
    } finally {
      setSaving(false)
    }
  }

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"? This cannot be undone.`
    )

    if (!confirmed) return

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id)

    if (error) {
      setMessage(error.message)
      return
    }

    if (product.image_path) {
      const { error: imageError } = await supabase.storage
        .from(BUCKET)
        .remove([product.image_path])

      if (imageError) {
        setMessage(`Product deleted, but its image could not be removed: ${imageError.message}`)
      }
    }

    setItems((current) => current.filter((item) => item.id !== product.id))
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesCategory =
      !categoryFilter || item.category_id === categoryFilter

    const matchesStatus =
      !statusFilter || item.availability === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <main className="admin-page">
      <div className="admin-title">
        <div>
          <span>Store</span>
          <h1>PRODUCTS</h1>
          <p>Manage your product catalogue.</p>
        </div>

        <Button onClick={openCreateModal}>
          <Plus size={17} />
          Add product
        </Button>
      </div>

      {message && (
        <div className="mb-4 rounded-lg border border-gray-200 p-3 text-sm">
          {message}
        </div>
      )}

      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-10 pr-3 text-sm outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-transparent px-3 py-2.5 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-transparent px-3 py-2.5 text-sm"
        >
          <option value="">All statuses</option>
          <option value="Draft">Draft</option>
          <option value="Available">Available</option>
          <option value="Out of stock">Out of stock</option>
        </select>
      </div>

      <div className="admin-table">
        <div className="table-head">
          <span>Product</span>
          <span>Category</span>
          <span>Price</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="p-6 text-center text-sm text-gray-500">
            Loading products...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            {items.length === 0
              ? "No products yet. Add your first product."
              : "No products match your search."}
          </div>
        ) : (
          filteredItems.map((item) => (
            <div className="table-row" key={item.id}>
              <div className="table-product">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100">
                    <ImagePlus size={17} className="text-gray-400" />
                  </div>
                )}
                <strong>{item.name}</strong>
              </div>

              <span>{item.product_categories?.name || "Uncategorised"}</span>
              <span>GHS {Number(item.price).toFixed(2)}</span>
              <span className="table-status">{item.availability}</span>

              <div className="row-actions">
                <button
                  aria-label="Edit product"
                  title="Edit product"
                  onClick={() => openEditModal(item)}
                >
                  <Edit3 size={17} />
                </button>
                <button
                  aria-label="Delete product"
                  title="Delete product"
                  onClick={() => deleteProduct(item)}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PRODUCT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-xl rounded-xl bg-white p-6 text-gray-900 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {editing ? "Edit product" : "Add product"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Enter your product details below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 hover:bg-gray-100"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveProduct} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Product name *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Category
                </label>
                <select
                  value={form.category_id}
                  onChange={(e) =>
                    setForm({ ...form, category_id: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm"
                >
                  <option value="">Uncategorised</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <div className="mt-2 flex gap-2">
                  <input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Create a new category"
                    className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={createCategory}
                    className="rounded-lg border border-gray-200 px-3 text-sm font-medium hover:bg-gray-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {categoryError && (
                  <p className="mt-1 text-xs text-red-600">{categoryError}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none"
                  placeholder="Describe this product..."
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Price (GHS) *
                  </label>
                  <input
                    required
                    min="0"
                    step="0.01"
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Availability
                  </label>
                  <select
                    value={form.availability}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        availability: e.target.value as Product["availability"],
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Available">Available</option>
                    <option value="Out of stock">Out of stock</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Product image
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageChange(e.target.files?.[0])}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 p-4 text-sm hover:bg-gray-50"
                >
                  <ImagePlus size={18} />
                  Choose image from device
                </button>

                <p className="mt-1 text-xs text-gray-400">
                  Maximum image size: 5MB.
                </p>

                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="h-32 w-32 rounded-lg border border-gray-200 object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editing
                      ? "Save changes"
                      : "Create product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MANAGEMENT */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold">Product categories</h2>
        {categories.length === 0 ? (
          <p className="text-sm text-gray-500">No categories created yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <span>{category.name}</span>
                <button
                  type="button"
                  title={`Delete ${category.name}`}
                  aria-label={`Delete ${category.name}`}
                  onClick={() => deleteCategory(category)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
