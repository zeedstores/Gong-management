
import { InquiryForm } from "../../components/InquiryForm"
import { Eyebrow, Heading, PageHero } from "../../components/ui"

export default function BookingPage() {
  return (
    <>
      <PageHero
        eyebrow="Bookings & enquiries"
        title="YOUR IDEA. OUR STAGE."
        copy="Tell us what you are planning. Whether it is an artist booking, event production or equipment hire, our team is ready to help."
        image="/assets/event-celebration.jpg"
      />

      <section className="section light-section">
        <div className="shell form-section light-form">
          <div>
            <Eyebrow dark>Bookings & enquiries</Eyebrow>

            <Heading>
              LET'S MAKE
              <br />
              IT HAPPEN.
            </Heading>

            <p>
              Share your event plans, requirements and budget.
              Our team will review your enquiry and get back to you.
            </p>

            <ul className="mt-6 space-y-3">
              <li>Artist and talent bookings</li>
              <li>Event planning and production</li>
              <li>Equipment hire enquiries</li>
              <li>Event registration assistance</li>
              <li>General enquiries</li>
            </ul>
          </div>

          <InquiryForm type="General enquiry" />
        </div>
      </section>
    </>
  )
}
