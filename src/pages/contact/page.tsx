import { MapPin, MessageCircle, Phone } from "lucide-react"
import { InquiryForm } from "../../components/InquiryForm"
import { Eyebrow, Heading, PageHero } from "../../components/ui"

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="LET'S TALK SOUND, STAGE & POSSIBILITY."
        copy="We are based in Tema, Ghana. Exact address and direct contact details will be published once confirmed."
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
            <div className="contact-list">
              <p>
                <MapPin />
                Tema, Greater Accra, Ghana
                <br />
                <span>Exact location pending confirmation</span>
              </p>
              <p>
                <Phone />
                Phone number pending
              </p>
              <p>
                <MessageCircle />
                WhatsApp number pending
              </p>
            </div>
            <div className="map-placeholder">
              <MapPin size={32} />
              <strong>Map location pending</strong>
              <span>
                An accurate pin will appear after the client confirms the
                address.
              </span>
            </div>
          </div>
          <InquiryForm type="General enquiry" />
        </div>
      </section>
    </>
  )
}
