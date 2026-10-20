import { InquiryForm } from "../../components/InquiryForm"
import { Eyebrow, Heading, PageHero } from "../../components/ui"

export default function BookingPage() {
  return (
    <>
      <PageHero
        eyebrow="Bookings & enquiries"
        title="YOUR IDEA. OUR STAGE."
        copy="Tell us what you are planning and the team will shape the right next step."
        image="/assets/event-celebration.jpg"
      />
      <section className="section light-section">
        <div className="shell form-section light-form">
          <div>
            <Eyebrow dark>Start a conversation</Eyebrow>
            <Heading>
              MAKE THE FIRST
              <br />
              MOVE.
            </Heading>
            <p>
              Use this adaptable form for artist bookings, event production,
              equipment, registration help or a general enquiry.
            </p>
          </div>
          <InquiryForm type="Book an Artist" />
        </div>
      </section>
    </>
  )
}
