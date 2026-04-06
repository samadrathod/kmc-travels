import { useState } from 'react'
import './LandingPage.css'

const serviceOptions = ['Local', 'Outstation', 'Airport', 'Corporate']
const vehicleOptions = ['Any Vehicle', 'Sedan', 'SUV / MUV', 'Tempo Traveller', 'Bus']
const whatsappNumber = '919825021486'

const stats = [
  ['15+', 'Years in service'],
  ['50+', 'Vehicles on call'],
  ['24/7', 'Support line'],
  ['500+', 'Happy clients'],
]

const services = [
  ['Local taxi in Vadodara', 'Reliable chauffeur-driven cars for office trips, family outings, station runs, and full-day local bookings.'],
  ['Outstation travel', 'Comfortable one-way and round-trip travel across Gujarat and beyond with route-ready drivers.'],
  ['Airport and railway pickup', 'Smooth transfer service for arrivals, departures, and guest coordination with punctual reporting.'],
  ['All kinds of taxi booking', 'From individual car hire to larger group movement, KMC Travels handles practical travel requirements quickly.'],
]

const fleet = [
  { name: 'Swift Dzire', category: 'sedan', seats: '4 seats', air: 'AC', rate: 'Rs 10/km', note: 'Best for city and station travel' },
  { name: 'Honda Amaze', category: 'sedan', seats: '4 seats', air: 'AC', rate: 'Rs 11/km', note: 'Comfortable daily travel sedan' },
  { name: 'Honda City', category: 'sedan', seats: '4 seats', air: 'AC', rate: 'Rs 13/km', note: 'Executive ride for premium bookings' },
  { name: 'Toyota Altis', category: 'sedan', seats: '4 seats', air: 'AC', rate: 'Rs 14/km', note: 'Business class outstation option' },
  { name: 'Ertiga', category: 'suv', seats: '7 seats', air: 'AC', rate: 'Rs 14/km', note: 'Popular family and group mover' },
  { name: 'Innova Crysta', category: 'suv', seats: '7 seats', air: 'AC', rate: 'Rs 16/km', note: 'High-comfort intercity travel' },
  { name: 'Temp Traveller', category: 'large', seats: '14 seats', air: 'AC', rate: 'On Request', note: 'Ideal for tours and functions' },
  { name: 'Mini Bus', category: 'large', seats: '22 seats', air: 'Non-AC', rate: 'On Request', note: 'Group transport for events' },
  { name: 'Full Bus', category: 'large', seats: '45 seats', air: 'Non-AC', rate: 'On Request', note: 'Bulk movement for schools and companies' },
]

const filters = [
  ['all', 'All Vehicles'],
  ['sedan', 'Sedans'],
  ['suv', 'SUV / MUV'],
  ['large', 'Group Travel'],
]

const highlights = [
  ['Drivers who understand service', 'Every trip is handled by trained, verified chauffeurs with a strong focus on punctuality and courtesy.'],
  ['Fast response on urgent bookings', 'When plans change quickly, KMC Travels stays reachable and dispatch-ready across the day.'],
  ['Flexible fleet for every trip size', 'From local sedans to large group vehicles, the fleet scales with the travel need.'],
]

const coverage = [
  'Vadodara local travel',
  'Airport and railway transfers',
  'Ahmedabad, Surat, Anand, Rajkot',
  'Wedding and event travel',
  'Corporate guest pickup',
  'Bus and group routes on request',
]

const contacts = [
  ['Direct contact', 'Husena Arif Rathod', 'Mobile: 9825021486', 'tel:+919825021486'],
  ['Primary phone', '9099910360', 'Phone: 0265-2339400', 'tel:+919099910360'],
  ['Email', 'kmctravels@yahoo.in', 'arif4486@gmail.com', 'mailto:kmctravels@yahoo.in'],
  ['Office address', 'SB/92 & 100, Avishkar Complex', 'Old Padra Road, Nr. Manisha Circle, Vadodara - 390015', 'https://maps.google.com/?q=SB%2F92+100+Avishkar+Complex+Old+Padra+Road+Manisha+Circle+Vadodara'],
]

const createWhatsAppLink = (message) => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

function buildQuickBookingMessage(form) {
  return [
    'Hello KMC Travels, I need a vehicle.',
    '',
    `Service Type: ${form.serviceType}`,
    `Vehicle Type: ${form.vehicleType}`,
    `Travel Date: ${form.travelDate || 'Not provided'}`,
    `Pickup Area: ${form.pickupArea || 'Not provided'}`,
  ].join('\n')
}

function buildFullBookingMessage(form) {
  return [
    'Hello KMC Travels, I want to book a vehicle.',
    '',
    `Full Name: ${form.fullName}`,
    `Phone: ${form.phone}`,
    `Pickup: ${form.pickup}`,
    `Destination: ${form.destination}`,
    `Date: ${form.date || 'Not provided'}`,
    `Vehicle: ${form.vehicle}`,
    `Trip Notes: ${form.notes || 'Not provided'}`,
  ].join('\n')
}

export default function LandingPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [quickForm, setQuickForm] = useState({
    serviceType: serviceOptions[0],
    vehicleType: vehicleOptions[0],
    travelDate: '',
    pickupArea: '',
  })
  const [bookingForm, setBookingForm] = useState({
    fullName: '',
    phone: '',
    pickup: '',
    destination: '',
    date: '',
    vehicle: vehicleOptions[0],
    notes: '',
  })
  const [quickError, setQuickError] = useState('')
  const [bookingError, setBookingError] = useState('')
  const visibleFleet = activeFilter === 'all' ? fleet : fleet.filter((item) => item.category === activeFilter)

  const submitQuickForm = (event) => {
    event.preventDefault()

    if (!quickForm.pickupArea.trim()) {
      setQuickError('Please add a pickup area so the team knows where the trip starts.')
      return
    }

    setQuickError('')
    window.open(createWhatsAppLink(buildQuickBookingMessage(quickForm)), '_blank', 'noopener,noreferrer')
  }

  const submitBookingForm = (event) => {
    event.preventDefault()

    if (!bookingForm.fullName.trim() || !bookingForm.phone.trim() || !bookingForm.pickup.trim() || !bookingForm.destination.trim()) {
      setBookingError('Please fill in name, phone, pickup, and destination before sending the enquiry.')
      return
    }

    setBookingError('')
    window.open(createWhatsAppLink(buildFullBookingMessage(bookingForm)), '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="kmc-page">
      <header className="kmc-header">
        <a className="kmc-brand" href="#top">
          <span className="kmc-brand-box">KMC</span>
          <span className="kmc-brand-copy">
            <strong>KMC Travels</strong>
            <small>Rent A Car | Vadodara</small>
          </span>
        </a>
        <nav className="kmc-nav">
          <a href="#services">Services</a>
          <a href="#fleet">Fleet</a>
          <a href="#coverage">Coverage</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="kmc-button kmc-button-solid kmc-header-cta" href="tel:+919099910360">Call Now</a>
      </header>

      <main id="top">
        <section className="kmc-hero">
          <div className="kmc-hero-grid">
            <div className="kmc-hero-copy">
              <p className="kmc-eyebrow">KMC Travels | Rent A Car | Vadodara</p>
              <h1>Swift Dzire to bus booking, all kinds of taxi under one dependable travel desk.</h1>
              <p className="kmc-hero-text">
                KMC Travels serves local rides, airport pickups, outstation trips, and group transport with a practical
                fleet that includes Swift Dzire, Honda Amaze, Xcent, Ertiga, Innova Crysta, Honda City, Altis, Temp Traveller,
                Mini Bus, and Bus options.
              </p>
              <div className="kmc-actions">
                <a className="kmc-button kmc-button-solid" href="#contact">Book Your Ride</a>
                <a className="kmc-button kmc-button-ghost" href={createWhatsAppLink('Hello KMC Travels, I need a vehicle.')} target="_blank" rel="noreferrer">WhatsApp Enquiry</a>
              </div>
              <div className="kmc-stats">
                {stats.map(([value, label]) => (
                  <div className="kmc-stat" key={label}>
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <form className="kmc-hero-card" onSubmit={submitQuickForm}>
              <div className="kmc-card-top">
                <span>Quick booking</span>
                <span>24/7 support</span>
              </div>
              <div className="kmc-form-grid">
                <label>
                  Service Type
                  <select value={quickForm.serviceType} onChange={(event) => setQuickForm((current) => ({ ...current, serviceType: event.target.value }))}>
                    {serviceOptions.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label>
                  Vehicle Type
                  <select value={quickForm.vehicleType} onChange={(event) => setQuickForm((current) => ({ ...current, vehicleType: event.target.value }))}>
                    {vehicleOptions.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label>
                  Travel Date
                  <input type="date" value={quickForm.travelDate} onChange={(event) => setQuickForm((current) => ({ ...current, travelDate: event.target.value }))} />
                </label>
                <label>
                  Pickup Area
                  <input type="text" placeholder="Vadodara, Airport, Station..." value={quickForm.pickupArea} onChange={(event) => setQuickForm((current) => ({ ...current, pickupArea: event.target.value }))} />
                </label>
              </div>
              <p className="kmc-card-text">Need urgent travel support? Call Husena Arif Rathod or the office line for quick booking help.</p>
              {quickError ? <p className="kmc-form-error">{quickError}</p> : <p className="kmc-form-hint">This sends your trip details directly to KMC Travels on WhatsApp.</p>}
              <button className="kmc-button kmc-button-solid kmc-button-block" type="submit">Send Quick Booking</button>
            </form>
          </div>
        </section>

        <section className="kmc-proof">
          SB/92 & 100, Avishkar Complex, Old Padra Road, Nr. Manisha Circle, Vadodara - 390015 | Web: www.kmctravels.com
        </section>

        <section className="kmc-section" id="services">
          <div className="kmc-section-head">
            <p className="kmc-eyebrow kmc-eyebrow-dark">Services</p>
            <h2>Daily taxi work, family travel, and larger transport bookings presented the way the business actually operates.</h2>
          </div>
          <div className="kmc-service-list">
            {services.map(([title, text]) => (
              <article className="kmc-service-row" key={title}>
                <span>{title}</span>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="kmc-section kmc-section-dark" id="fleet">
          <div className="kmc-section-head">
            <p className="kmc-eyebrow">Fleet</p>
            <h2>Choose from the vehicles listed by KMC Travels and book the right fit for the route.</h2>
          </div>
          <div className="kmc-filters">
            {filters.map(([id, label]) => (
              <button key={id} type="button" className={activeFilter === id ? 'kmc-filter active' : 'kmc-filter'} onClick={() => setActiveFilter(id)}>
                {label}
              </button>
            ))}
          </div>
          <div className="kmc-fleet-grid">
            {visibleFleet.map((item) => (
              <article className="kmc-fleet-card" key={item.name}>
                <span className="kmc-fleet-type">{item.category}</span>
                <h3>{item.name}</h3>
                <p>{item.note}</p>
                <div className="kmc-fleet-meta">
                  <span>{item.seats}</span>
                  <span>{item.air}</span>
                  <span>{item.rate}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="kmc-story">
          <div className="kmc-story-copy">
            <p className="kmc-eyebrow kmc-eyebrow-dark">Why clients stay with KMC</p>
            <h2>A Vadodara travel service built on responsiveness, familiarity, and straightforward booking help.</h2>
            <p>
              The difference is not just the vehicle. It is how quickly the team responds, how calmly bookings are handled,
              and how consistently the trip is delivered from pickup to drop.
            </p>
          </div>
          <div className="kmc-highlight-list">
            {highlights.map(([title, text]) => (
              <article className="kmc-highlight" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="kmc-section" id="coverage">
          <div className="kmc-section-head">
            <p className="kmc-eyebrow kmc-eyebrow-dark">Coverage</p>
            <h2>Built around Vadodara service, with the flexibility to handle outstation and group travel when needed.</h2>
          </div>
          <div className="kmc-coverage">
            <div className="kmc-coverage-panel">
              <span className="kmc-chip">Vadodara Dispatch</span>
              <h3>Local office, practical fleet, direct contact.</h3>
              <p>
                The business card positions KMC Travels as a direct, contact-led taxi service. The website should keep that same
                clarity: what vehicles are available, who to call, and how to book quickly.
              </p>
            </div>
            <div className="kmc-coverage-list">
              {coverage.map((item) => (
                <div className="kmc-coverage-item" key={item}>
                  <span></span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="kmc-contact" id="contact">
          <div className="kmc-contact-copy">
            <p className="kmc-eyebrow">Contact</p>
            <h2>Ready to book a ride or check which vehicle is available?</h2>
            <p>Reach out directly for taxi booking, airport transfer, outstation planning, or group vehicle availability.</p>
            <div className="kmc-contact-list">
              {contacts.map(([label, value, sub, href]) => (
                <a className="kmc-contact-item" href={href} key={label} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                  <small>{sub}</small>
                </a>
              ))}
            </div>
          </div>

          <form className="kmc-contact-card" onSubmit={submitBookingForm}>
            <h3>Quick Booking Enquiry</h3>
            <p>Share the route, date, and vehicle need. KMC Travels can respond with the right option fast.</p>
            <div className="kmc-form-grid kmc-form-grid-compact">
              <label>
                Full Name
                <input type="text" placeholder="Your name" value={bookingForm.fullName} onChange={(event) => setBookingForm((current) => ({ ...current, fullName: event.target.value }))} />
              </label>
              <label>
                Phone
                <input type="tel" placeholder="+91 XXXXXXXXXX" value={bookingForm.phone} onChange={(event) => setBookingForm((current) => ({ ...current, phone: event.target.value }))} />
              </label>
              <label>
                Pickup
                <input type="text" placeholder="Pickup location" value={bookingForm.pickup} onChange={(event) => setBookingForm((current) => ({ ...current, pickup: event.target.value }))} />
              </label>
              <label>
                Destination
                <input type="text" placeholder="Destination" value={bookingForm.destination} onChange={(event) => setBookingForm((current) => ({ ...current, destination: event.target.value }))} />
              </label>
              <label>
                Date
                <input type="date" value={bookingForm.date} onChange={(event) => setBookingForm((current) => ({ ...current, date: event.target.value }))} />
              </label>
              <label>
                Vehicle
                <select value={bookingForm.vehicle} onChange={(event) => setBookingForm((current) => ({ ...current, vehicle: event.target.value }))}>
                  {vehicleOptions.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="kmc-full-span">
                Trip Notes
                <textarea placeholder="Passengers, travel timing, special requests..." value={bookingForm.notes} onChange={(event) => setBookingForm((current) => ({ ...current, notes: event.target.value }))}></textarea>
              </label>
            </div>
            {bookingError ? <p className="kmc-form-error">{bookingError}</p> : <p className="kmc-form-hint">Your enquiry opens in WhatsApp with the booking details already filled in.</p>}
            <button className="kmc-button kmc-button-solid kmc-button-block" type="submit">Send Enquiry on WhatsApp</button>
          </form>
        </section>
      </main>

      <footer className="kmc-footer">
        <div>
          <strong>KMC Travels</strong>
          <p>SB/92 & 100, Avishkar Complex, Old Padra Road, Nr. Manisha Circle, Vadodara - 390015</p>
        </div>
        <div>
          <p>Phone: 0265-2339400 | Mobile: 9099910360</p>
          <p>Email: kmctravels@yahoo.in | Web: www.kmctravels.com</p>
        </div>
      </footer>

      <a className="kmc-floating-call" href="tel:+919099910360">Call KMC</a>
    </div>
  )
}
