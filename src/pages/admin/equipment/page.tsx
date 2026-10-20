import { Edit3, Plus, ToggleRight } from "lucide-react"
import { equipment } from "../../../data/mockData"
import { Button } from "../../../components/ui"

export default function AdminEquipmentPage() {
  return (
    <main className="admin-page">
      <div className="admin-title">
        <div>
          <span>Operations</span>
          <h1>EQUIPMENT</h1>
          <p>Manage categories, rates, images and availability.</p>
        </div>
        <Button disabled title="Connect persistent storage to add equipment">
          <Plus size={17} />
          Add equipment
        </Button>
      </div>
      <div className="equipment-admin-grid">
        {equipment.map((item) => (
          <article key={item.name}>
            <span>{item.category}</span>
            <h2>{item.name}</h2>
            <p>{item.copy}</p>
            <strong>{item.rate}</strong>
            <div>
              <button disabled title="Requires persistent storage">
                <ToggleRight size={18} />
                Published
              </button>
              <button disabled title="Requires persistent storage">
                <Edit3 size={18} />
                Edit
              </button>
            </div>
          </article>
        ))}
      </div>
      <section className="admin-panel">
        <div className="panel-title">
          <h2>Quote requests</h2>
          <span>0 open</span>
        </div>
        <div className="activity-empty">
          <strong>No equipment requests yet</strong>
          <p>
            New customer submissions will appear here with trackable statuses.
          </p>
        </div>
      </section>
    </main>
  )
}
