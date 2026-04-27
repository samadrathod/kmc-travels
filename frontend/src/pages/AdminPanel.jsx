import { useDeferredValue, useEffect, useState } from 'react'
import axios from 'axios'
import { buildAdminHeaders, buildApiUrl } from '../lib/api'
import './AdminPanel.css'

const bookingDateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
const statusOptions = ['pending', 'confirmed', 'done']
const categoryOptions = ['sedan', 'suv', 'large']
const airOptions = ['AC', 'Non-AC']

const BLANK_VEHICLE = {
  name: '',
  category: 'sedan',
  seats: '',
  air: 'AC',
  rate: '',
  note: '',
  visible: true,
  order: 0,
}

// ─── API helpers ────────────────────────────────────────────────────────────

async function requestBookings(password) {
  const res = await axios.get(buildApiUrl('/api/bookings'), {
    headers: buildAdminHeaders(password),
  })
  return Array.isArray(res.data) ? res.data : []
}

async function updateBooking(password, bookingId, updates) {
  const res = await axios.patch(buildApiUrl(`/api/bookings/${bookingId}`), updates, {
    headers: buildAdminHeaders(password),
  })
  return res.data
}

async function deleteBooking(password, bookingId) {
  await axios.delete(buildApiUrl(`/api/bookings/${bookingId}`), {
    headers: buildAdminHeaders(password),
  })
}

async function requestVehicles(password) {
  const res = await axios.get(buildApiUrl('/api/vehicles?all=1'), {
    headers: buildAdminHeaders(password),
  })
  return Array.isArray(res.data) ? res.data : []
}

async function createVehicle(password, data) {
  const res = await axios.post(buildApiUrl('/api/vehicles'), data, {
    headers: buildAdminHeaders(password),
  })
  return res.data
}

async function updateVehicle(password, vehicleId, updates) {
  const res = await axios.patch(buildApiUrl(`/api/vehicles/${vehicleId}`), updates, {
    headers: buildAdminHeaders(password),
  })
  return res.data
}

async function deleteVehicle(password, vehicleId) {
  await axios.delete(buildApiUrl(`/api/vehicles/${vehicleId}`), {
    headers: buildAdminHeaders(password),
  })
}

// ─── Small helpers ───────────────────────────────────────────────────────────

function formatBookingTime(createdAt) {
  if (!createdAt) return '-'
  return bookingDateFormatter.format(new Date(createdAt))
}

function normalizeStatus(status) {
  return statusOptions.includes(status) ? status : 'pending'
}

// ─── Fleet form modal ────────────────────────────────────────────────────────

function VehicleModal({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState(initial || BLANK_VEHICLE)
  const isEdit = Boolean(initial?._id)

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="admin-title" style={{ fontSize: '22px' }}>
            {isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h2>
          <button className="admin-ghost-btn" onClick={onClose} style={{ minHeight: 36, padding: '6px 14px' }}>✕</button>
        </div>

        <div className="modal-body">
          <div className="modal-grid">
            <label className="admin-field">
              <span className="admin-field-label">Vehicle Name *</span>
              <input className="admin-input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Swift Dzire" />
            </label>

            <label className="admin-field">
              <span className="admin-field-label">Category *</span>
              <select className="admin-input" value={form.category} onChange={(e) => set('category', e.target.value)}>
                {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>

            <label className="admin-field">
              <span className="admin-field-label">Seats *</span>
              <input className="admin-input" value={form.seats} onChange={(e) => set('seats', e.target.value)} placeholder="e.g. 4 seats" />
            </label>

            <label className="admin-field">
              <span className="admin-field-label">AC / Non-AC</span>
              <select className="admin-input" value={form.air} onChange={(e) => set('air', e.target.value)}>
                {airOptions.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </label>

            <label className="admin-field">
              <span className="admin-field-label">Rate / Price *</span>
              <input className="admin-input" value={form.rate} onChange={(e) => set('rate', e.target.value)} placeholder="e.g. Rs 10/km or On Request" />
            </label>

            <label className="admin-field">
              <span className="admin-field-label">Display Order</span>
              <input className="admin-input" type="number" value={form.order} onChange={(e) => set('order', Number(e.target.value))} placeholder="0" />
            </label>

            <label className="admin-field modal-full">
              <span className="admin-field-label">Short Note</span>
              <input className="admin-input" value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="e.g. Best for city and station travel" />
            </label>

            <label className="admin-field modal-full" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <input
                type="checkbox"
                checked={form.visible}
                onChange={(e) => set('visible', e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#f5c518', cursor: 'pointer' }}
              />
              <span className="admin-field-label" style={{ margin: 0 }}>Visible on website</span>
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button className="admin-ghost-btn" onClick={onClose}>Cancel</button>
          <button className="admin-primary-btn" onClick={() => onSave(form)} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Vehicle'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function AdminPanel() {
  // Auth
  const [adminPassword, setAdminPassword] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)

  // Tab
  const [activeTab, setActiveTab] = useState('bookings')

  // Bookings state
  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [bookingsError, setBookingsError] = useState('')
  const [search, setSearch] = useState('')
  const [bookingMessage, setBookingMessage] = useState('')
  const [busyBookingId, setBusyBookingId] = useState('')
  const deferredSearch = useDeferredValue(search)

  // Vehicles state
  const [vehicles, setVehicles] = useState([])
  const [vehiclesLoading, setVehiclesLoading] = useState(false)
  const [vehiclesError, setVehiclesError] = useState('')
  const [vehicleMessage, setVehicleMessage] = useState('')
  const [busyVehicleId, setBusyVehicleId] = useState('')
  const [modalVehicle, setModalVehicle] = useState(null) // null = closed, {} = new, {_id,...} = edit
  const [modalSaving, setModalSaving] = useState(false)

  // ── restore session ──────────────────────────────────────────────────────
  async function authenticate(password, options = {}) {
    const { silent = false } = options
    const nextPassword = password.trim()

    if (!nextPassword) {
      if (!silent) {
        setPasswordError('Enter the admin password.')
      }
      setAuthChecking(false)
      setIsAuthenticated(false)
      return false
    }

    try {
      setAuthChecking(true)
      setBookingsLoading(true)
      setVehiclesLoading(true)

      const [bookingData, vehicleData] = await Promise.all([
        requestBookings(nextPassword),
        requestVehicles(nextPassword),
      ])

      setAdminPassword(nextPassword)
      setIsAuthenticated(true)
      setBookings(bookingData)
      setVehicles(vehicleData)
      setBookingsError('')
      setVehiclesError('')
      setPasswordError('')

      if (!silent) {
        setPasswordInput('')
      }

      return true
    } catch (err) {
      setAdminPassword('')
      setIsAuthenticated(false)
      setBookings([])
      setVehicles([])

      if (err.response?.status === 401) {
        setPasswordError('Incorrect password.')
      } else if (err.response?.status === 500) {
        setPasswordError(err.response?.data?.message || 'Admin portal is not configured correctly.')
      } else {
        setPasswordError('Could not reach the admin portal.')
      }

      return false
    } finally {
      setAuthChecking(false)
      setBookingsLoading(false)
      setVehiclesLoading(false)
    }
  }

  useEffect(() => {
    setAuthChecking(false)
  }, [])

  // ── load data when logged in ─────────────────────────────────────────────
  // ── bookings ─────────────────────────────────────────────────────────────

  async function loadBookings(password = adminPassword) {
    try {
      setBookingsLoading(true)
      const data = await requestBookings(password)
      setBookings(data)
      setBookingsError('')
      setPasswordError('')
    } catch (err) {
      if (err.response?.status === 401) {
        setAdminPassword('')
        setIsAuthenticated(false)
        setPasswordError('Incorrect password.')
        return
      }
      setBookingsError('Failed to load bookings. Make sure the backend is running.')
    } finally {
      setBookingsLoading(false)
    }
  }

  async function handlePasswordSubmit() {
    await authenticate(passwordInput)
  }

  function handleLogout() {
    setAdminPassword('')
    setIsAuthenticated(false)
    setPasswordInput('')
    setBookings([])
    setVehicles([])
    setSearch('')
    setPasswordError('')
    setBookingsError('')
    setVehiclesError('')
    setBookingMessage('')
    setVehicleMessage('')
  }

  async function handleStatusChange(bookingId, nextStatus) {
    try {
      setBusyBookingId(bookingId)
      const updated = await updateBooking(adminPassword, bookingId, { status: nextStatus })
      setBookings((prev) => prev.map((b) => b._id === bookingId ? updated : b))
      setBookingMessage(`Status updated to ${nextStatus}.`)
      setBookingsError('')
    } catch (err) {
      setBookingsError(err.response?.data?.message || 'Could not update booking status.')
    } finally {
      setBusyBookingId('')
    }
  }

  async function handleDeleteBooking(bookingId) {
    if (!window.confirm('Delete this booking record permanently?')) return
    try {
      setBusyBookingId(bookingId)
      await deleteBooking(adminPassword, bookingId)
      setBookings((prev) => prev.filter((b) => b._id !== bookingId))
      setBookingMessage('Booking deleted successfully.')
      setBookingsError('')
    } catch (err) {
      setBookingsError(err.response?.data?.message || 'Could not delete booking.')
    } finally {
      setBusyBookingId('')
    }
  }

  // ── vehicles ─────────────────────────────────────────────────────────────

  async function loadVehicles(password = adminPassword) {
    try {
      setVehiclesLoading(true)
      const data = await requestVehicles(password)
      setVehicles(data)
      setVehiclesError('')
    } catch (err) {
      if (err.response?.status === 401) {
        setAdminPassword('')
        setIsAuthenticated(false)
        setPasswordError('Incorrect password.')
        return
      }
      setVehiclesError('Failed to load vehicles.')
    } finally {
      setVehiclesLoading(false)
    }
  }

  async function handleSaveVehicle(form) {
    if (!form.name.trim() || !form.rate.trim() || !form.seats.trim()) {
      setVehiclesError('Name, seats, and rate are required.')
      return
    }

    try {
      setModalSaving(true)
      if (form._id) {
        const updated = await updateVehicle(adminPassword, form._id, form)
        setVehicles((prev) => prev.map((v) => v._id === form._id ? updated : v))
        setVehicleMessage('Vehicle updated.')
      } else {
        const created = await createVehicle(adminPassword, form)
        setVehicles((prev) => [...prev, created])
        setVehicleMessage('Vehicle added.')
      }
      setModalVehicle(null)
      setVehiclesError('')
    } catch (err) {
      setVehiclesError(err.response?.data?.message || 'Could not save vehicle.')
    } finally {
      setModalSaving(false)
    }
  }

  async function handleToggleVisible(vehicle) {
    try {
      setBusyVehicleId(vehicle._id)
      const updated = await updateVehicle(adminPassword, vehicle._id, { visible: !vehicle.visible })
      setVehicles((prev) => prev.map((v) => v._id === vehicle._id ? updated : v))
      setVehicleMessage(`"${vehicle.name}" is now ${updated.visible ? 'visible' : 'hidden'} on the site.`)
      setVehiclesError('')
    } catch {
      setVehiclesError('Could not update visibility.')
    } finally {
      setBusyVehicleId('')
    }
  }

  async function handleDeleteVehicle(vehicle) {
    if (!window.confirm(`Delete "${vehicle.name}" permanently?`)) return
    try {
      setBusyVehicleId(vehicle._id)
      await deleteVehicle(adminPassword, vehicle._id)
      setVehicles((prev) => prev.filter((v) => v._id !== vehicle._id))
      setVehicleMessage('Vehicle deleted.')
      setVehiclesError('')
    } catch {
      setVehiclesError('Could not delete vehicle.')
    } finally {
      setBusyVehicleId('')
    }
  }

  // ── filtered bookings ────────────────────────────────────────────────────

  const bookingList = Array.isArray(bookings) ? bookings : []
  const vehicleList = Array.isArray(vehicles) ? vehicles : []
  const normalizedSearch = deferredSearch.trim().toLowerCase()
  const filtered = bookingList.filter((b) => {
    if (!normalizedSearch) return true
    return (
      b.fullName?.toLowerCase().includes(normalizedSearch) ||
      b.phone?.toLowerCase().includes(normalizedSearch) ||
      b.pickup?.toLowerCase().includes(normalizedSearch) ||
      b.destination?.toLowerCase().includes(normalizedSearch)
    )
  })

  const pendingCount = bookingList.filter((b) => normalizeStatus(b.status) === 'pending').length
  const confirmedCount = bookingList.filter((b) => normalizeStatus(b.status) === 'confirmed').length
  const doneCount = bookingList.filter((b) => normalizeStatus(b.status) === 'done').length

  // ── lock screen ──────────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <div className="admin-lock-screen">
        <div className="admin-lock-card">
          <div>
            <p className="admin-kicker">Authorized Access</p>
            <h2 className="admin-title">KMC Operations Portal</h2>
            <p className="admin-subtitle">Use your server admin password to access bookings, update status, and manage records.</p>
          </div>
          <label className="admin-field">
            <span className="admin-field-label">Admin Password</span>
            <input
              className="admin-input"
              type="password"
              name="adminPassword"
              autoComplete="current-password"
              placeholder="Enter Password..."
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            />
          </label>
          {passwordError && <p className="admin-error" aria-live="polite">{passwordError}</p>}
          <button type="button" onClick={handlePasswordSubmit} className="admin-primary-btn" disabled={authChecking}>
            {authChecking ? 'Checking...' : 'Enter Portal'}
          </button>
        </div>
      </div>
    )
  }

  // ── main panel ───────────────────────────────────────────────────────────

  return (
    <div className="admin-page">
      {/* Modal */}
      {modalVehicle !== null && (
        <VehicleModal
          initial={modalVehicle._id ? modalVehicle : null}
          onSave={handleSaveVehicle}
          onClose={() => setModalVehicle(null)}
          saving={modalSaving}
        />
      )}

      {/* Top bar */}
      <div className="admin-topbar">
        <div>
          <p className="admin-kicker">KMC Operations</p>
          <h1 className="admin-title">Management Console</h1>
        </div>
        <div className="admin-topbar-actions">
          <button type="button" onClick={() => { loadBookings(); loadVehicles() }} className="admin-secondary-btn" disabled={bookingsLoading || vehiclesLoading}>
            Refresh
          </button>
          <button type="button" onClick={handleLogout} className="admin-ghost-btn">Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          type="button"
          className={activeTab === 'bookings' ? 'admin-tab admin-tab-active' : 'admin-tab'}
          onClick={() => setActiveTab('bookings')}
        >
          Bookings <span className="admin-tab-badge">{bookingList.length}</span>
        </button>
        <button
          type="button"
          className={activeTab === 'fleet' ? 'admin-tab admin-tab-active' : 'admin-tab'}
          onClick={() => setActiveTab('fleet')}
        >
          Fleet <span className="admin-tab-badge">{vehicleList.length}</span>
        </button>
      </div>

      {/* ── BOOKINGS TAB ── */}
      {activeTab === 'bookings' && (
        <>
          <div className="admin-stats">
            <div className="admin-stat-card"><span className="admin-stat-num">{bookingList.length}</span><span className="admin-stat-label">Total</span></div>
            <div className="admin-stat-card"><span className="admin-stat-num">{pendingCount}</span><span className="admin-stat-label">Pending</span></div>
            <div className="admin-stat-card"><span className="admin-stat-num">{confirmedCount}</span><span className="admin-stat-label">Confirmed</span></div>
            <div className="admin-stat-card"><span className="admin-stat-num">{doneCount}</span><span className="admin-stat-label">Done</span></div>
          </div>

          <div className="admin-toolbar">
            <label className="admin-field admin-search">
              <span className="admin-field-label">Search Enquiries</span>
              <input className="admin-input" type="search" autoComplete="off" placeholder="Name, phone, pickup, destination…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </label>
            {bookingMessage && <p className="admin-success-banner" aria-live="polite">{bookingMessage}</p>}
          </div>

          {bookingsLoading && <p className="admin-info">Loading bookings…</p>}
          {bookingsError && <p className="admin-error-banner">{bookingsError}</p>}
          {!bookingsLoading && !bookingsError && filtered.length === 0 && <p className="admin-info">No bookings found.</p>}

          {!bookingsLoading && !bookingsError && filtered.length > 0 && (
            <>
              {/* Desktop table */}
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      {['#', 'Name', 'Phone', 'Pickup', 'Destination', 'Date', 'Vehicle', 'Status', 'Trip Notes', 'Submitted', 'Actions'].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((booking, index) => {
                      const status = normalizeStatus(booking.status)
                      const isBusy = busyBookingId === booking._id
                      return (
                        <tr key={booking._id}>
                          <td>{index + 1}</td>
                          <td>{booking.fullName || '-'}</td>
                          <td><a href={`tel:${booking.phone}`} className="admin-phone-link">{booking.phone || '-'}</a></td>
                          <td>{booking.pickup || '-'}</td>
                          <td>{booking.destination || '-'}</td>
                          <td>{booking.date || '-'}</td>
                          <td>{booking.vehicle || '-'}</td>
                          <td>
                            <div className="admin-status-cell">
                              <span className={`admin-status-badge admin-status-${status}`}>{status}</span>
                              <select className="admin-status-select" value={status} onChange={(e) => handleStatusChange(booking._id, e.target.value)} disabled={isBusy}>
                                {statusOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                              </select>
                            </div>
                          </td>
                          <td className="admin-notes-cell">{booking.notes || '-'}</td>
                          <td>{formatBookingTime(booking.createdAt)}</td>
                          <td>
                            <button type="button" className="admin-danger-btn" onClick={() => handleDeleteBooking(booking._id)} disabled={isBusy}>Delete</button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="admin-card-list">
                {filtered.map((booking, index) => {
                  const status = normalizeStatus(booking.status)
                  const isBusy = busyBookingId === booking._id
                  return (
                    <article className="admin-card" key={booking._id}>
                      <div className="admin-card-header">
                        <div>
                          <p className="admin-card-name">{booking.fullName || 'Unnamed'}</p>
                          <span className="admin-card-time">{formatBookingTime(booking.createdAt)}</span>
                        </div>
                        <span className="admin-card-index">{index + 1}</span>
                      </div>
                      <div className="admin-card-grid">
                        {[['Phone', <a href={`tel:${booking.phone}`} className="admin-phone-link admin-card-value">{booking.phone || '-'}</a>],
                          ['Pickup', booking.pickup || '-'],
                          ['Destination', booking.destination || '-'],
                          ['Date', booking.date || '-'],
                          ['Vehicle', booking.vehicle || '-'],
                          ['Notes', booking.notes || '-'],
                        ].map(([label, val]) => (
                          <div className="admin-card-row" key={label}>
                            <span className="admin-card-label">{label}</span>
                            {typeof val === 'string' ? <span className="admin-card-value">{val}</span> : val}
                          </div>
                        ))}
                        <div className="admin-card-row">
                          <span className="admin-card-label">Status</span>
                          <div className="admin-status-stack">
                            <span className={`admin-status-badge admin-status-${status}`}>{status}</span>
                            <select className="admin-status-select" value={status} onChange={(e) => handleStatusChange(booking._id, e.target.value)} disabled={isBusy}>
                              {statusOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="admin-card-actions">
                        <button type="button" className="admin-danger-btn" onClick={() => handleDeleteBooking(booking._id)} disabled={isBusy}>Delete Record</button>
                      </div>
                    </article>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* ── FLEET TAB ── */}
      {activeTab === 'fleet' && (
        <>
          <div className="fleet-header">
            <div>
              <p style={{ color: '#888', fontSize: 14, margin: '0 0 4px' }}>
                Changes here reflect on the live website instantly. Hidden vehicles won't appear to customers.
              </p>
            </div>
            <button type="button" className="admin-primary-btn" onClick={() => setModalVehicle({})}>
              + Add Vehicle
            </button>
          </div>

          {vehicleMessage && <p className="admin-success-banner" style={{ marginBottom: 16 }}>{vehicleMessage}</p>}
          {vehiclesError && <p className="admin-error-banner" style={{ marginBottom: 16 }}>{vehiclesError}</p>}
          {vehiclesLoading && <p className="admin-info">Loading fleet…</p>}

          {!vehiclesLoading && vehicleList.length === 0 && (
            <div className="fleet-empty">
              <p>No vehicles added yet.</p>
              <p style={{ marginTop: 8, color: '#888', fontSize: 14 }}>
                Click "Add Vehicle" to add your first vehicle. The landing page currently uses its built-in list until you add vehicles here.
              </p>
            </div>
          )}

          {!vehiclesLoading && vehicleList.length > 0 && (
            <div className="fleet-grid">
              {vehicleList.map((v) => {
                const isBusy = busyVehicleId === v._id
                return (
                  <article className={`fleet-card ${v.visible ? '' : 'fleet-card-hidden'}`} key={v._id}>
                    <div className="fleet-card-top">
                      <span className="fleet-category">{v.category}</span>
                      <span className={`fleet-visibility ${v.visible ? 'fleet-visible' : 'fleet-hidden'}`}>
                        {v.visible ? '● Live' : '○ Hidden'}
                      </span>
                    </div>
                    <h3 className="fleet-name">{v.name}</h3>
                    <p className="fleet-note">{v.note || '—'}</p>
                    <div className="fleet-meta">
                      <span>{v.seats}</span>
                      <span>{v.air}</span>
                      <span className="fleet-rate">{v.rate}</span>
                    </div>
                    <div className="fleet-actions">
                      <button type="button" className="admin-secondary-btn" style={{ flex: 1, fontSize: 13 }} onClick={() => setModalVehicle(v)} disabled={isBusy}>
                        Edit
                      </button>
                      <button type="button" className="admin-ghost-btn" style={{ flex: 1, fontSize: 13 }} onClick={() => handleToggleVisible(v)} disabled={isBusy}>
                        {v.visible ? 'Hide' : 'Show'}
                      </button>
                      <button type="button" className="admin-danger-btn" style={{ fontSize: 13 }} onClick={() => handleDeleteVehicle(v)} disabled={isBusy}>
                        Delete
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
