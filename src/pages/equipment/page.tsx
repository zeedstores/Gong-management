import { useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { equipment } from "../../data/mockData"
import {
  Button,
  Eyebrow,
  Field,
  Heading,
  PageHero,
  TextArea,
} from "../../components/ui"

export default function EquipmentPage() {
  const [selected, setSelected] = useState<string[]>([])
  const [sent, setSent] = useState(false)
  const toggle = (name: string) =>
    setSelected((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    )
  return (
    <>
      <PageHero
        eyebrow="Equipment hire"
        title="THE GEAR TO GO BIG."
        copy="Explore dynamic production categories and build a quote request. Availability and final pricing are confirmed by the team."
        image="/assets/event-stage.jpg"
      />
      <section className="section light-section">
        <div className="shell equipment-grid">
          {equipment.map((item, i) => (
            <article
              className={selected.includes(item.name) ? "selected" : ""}
              key={item.name}
            >
              <span>
                0{i + 1} · {item.category}
              </span>
              <Heading>{item.name}</Heading>
              <p>{item.copy}</p>
              <strong>{item.rate}</strong>
              <Button onClick={() => toggle(item.name)}>
                {selected.includes(item.name) ? "Selected" : "Add to request"}
              </Button>
            </article>
          ))}
        </div>
      </section>
      <section className="section dark-section">
        <div className="shell form-section">
          <div>
            <Eyebrow>Quote request</Eyebrow>
            <Heading>
              TELL US WHAT
              <br />
              YOU'RE BUILDING.
            </Heading>
            <p>
              Submitting a request does not guarantee availability or confirm a
              final quote.
            </p>
          </div>
          {sent ? (
            <div className="success-panel dark">
              <CheckCircle2 size={36} />
              <h3>Quote request received</h3>
              <p>
                Prototype confirmation only. The connected version will create a
                trackable request.
              </p>
              <Button onClick={() => setSent(false)}>Start another</Button>
            </div>
          ) : (
            <form
              className="form-grid"
              onSubmit={(e) => {
                e.preventDefault()
                setSent(true)
              }}
            >
              <Field label="Customer name" required />
              <Field label="Phone / WhatsApp" required placeholder="+233" />
              <Field label="Email" type="email" required />
              <Field label="Event date" type="date" required />
              <Field label="Event venue" required />
              <Field label="Hire duration" required />
              <Field
                label="Selected equipment"
                value={selected.join(", ")}
                readOnly
                placeholder="Select above"
              />
              <TextArea label="Additional requirements" />
              <Button type="submit">Request quotation</Button>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
