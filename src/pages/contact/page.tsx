
import { MapPin, MessageCircle, Phone } from "lucide-react"
import { InquiryForm } from "../../components/InquiryForm"
import {
  Eyebrow,
  Heading,
  PageHero,
} from "../../components/ui"

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="LET'S TALK SOUND, STAGE & POSSIBILITY."
        copy="Have an event, artist booking or production idea? Get in touch with Gong Management and let's discuss what's possible."
      />

      <section className="section light-section">
        <div className="shell contact-grid">
          <div>
            <Eyebrow dark>Find Gong</Eyebrow>

            <Heading>
              TEMA IS
              <br />
              HOME BASE.
            </Heading>

            <p>
              Reach out to discuss your next event, production
              project or collaboration.
            </p>

            <div className="contact-list">
              <p>
                <MapPin />
                <span>
                  <strong>Location</strong>
                  <br />
                  Tema, Greater Accra, Ghana
                  <br />
                  <span>Exact address to be confirmed.</span>
                </span>
              </p>

              <p>
                <Phone />
                <span>
                  <strong>Phone</strong>
                  <br />
                  Contact details coming soon.
                </span>
              </p>

              <p>
                <MessageCircle />
                <span>
                  <strong>WhatsApp</strong>
                  <br />
                  WhatsApp contact coming soon.
                </span>
              </p>
            </div>

            <div className="map-placeholder">
              <MapPin size={32} />
              <strong>Gong Management — Tema</strong>
              <span>
                Our map location will be published once the
                official business address is confirmed.
              </span>
            </div>
          </div>

          <InquiryForm type="General enquiry" />
        </div>
      </section>
    </>
  )
}
