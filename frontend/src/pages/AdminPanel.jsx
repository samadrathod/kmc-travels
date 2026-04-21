import { useDeferredValue, useEffect, useState } from 'react'
import axios from 'axios'
import { buildAdminHeaders, buildApiUrl } from '../lib/api'
import './AdminPanel.css'

const ADMIN_STORAGE_KEY = 'kmc_admin_password'
const bookingDateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
const statusOptions = ['pending', 'confirmed', 'done']

async function requestBookings(password) {
  const res = await axios.get(buildApiUrl('/api/bookings'), {
    headers: buildAdminHeaders(password),
  })

  return res.data
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

function formatBookingTime(createdAt) {
  if (!createdAt) {
    return '-'
  }

  return bookingDateFormatter.format(new Date(createdAt))
}

function normalizeStatus(status) {
  return statusOptions.includes(status) ? status : 'pending'
}

export default function AdminPanel() {
  const [adminPassword, setAdminPassword] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [busyBookingId, setBusyBookingId] = useState('')
  const deferredSearch = useDeferredValue(search)

  useEffect(() => {
    const savedPassword = sessionStorage.getItem(ADMIN_STORAGE_KEY)
    if (savedPassword) {
      setAdminPassword(savedPassword)
    }
  }, [])

  useEffect(() => {
    if (adminPassword) {
      const loadBookings = async () => {
        try {
          setLoading(true)
          const nextBookings = await requestBookings(adminPassword)
          setBookings(nextBookings)
          setError('')
          setPasswordError('')
        } catch (requestError) {
          if (requestError.response?.status === 401) {
            sessionStorage.removeItem(ADMIN_STORAGE_KEY)
            setAdminPassword('')
            setBookings([])
            setPasswordError('Incorrect password.')
            return
          }

          setError('Failed to load bookings. Make sure the backend is running and the API URL is correct.')
        } finally {
          setLoading(false)
        }
      }

      loadBookings()
    }
  }, [adminPassword])

  async function fetchBookings(password = adminPassword) {
    try {
      setLoading(true)
      const nextBookings = await requestBookings(password)
      setBookings(nextBookings)
      setError('')
      setPasswordError('')
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        sessionStorage.removeItem(ADMIN_STORAGE_KEY)
        setAdminPassword('')
        setBookings([])
        setPasswordError('Incorrect password.')
        return
      }

      setError('Failed to load bookings. Make sure the backend is running and the API URL is correct.')
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordSubmit() {
    const trimmedPassword = passwordInput.trim()

    if (!trimmedPassword) {
      setPasswordError('Enter the admin password.')
      return
    }

    try {
      setLoading(true)
      const nextBookings = await requestBookings(trimmedPassword)
      sessionStorage.setItem(ADMIN_STORAGE_KEY, trimmedPassword)
      setAdminPassword(trimmedPassword)
      setBookings(nextBookings)
      setPasswordInput('')
      setPasswordError('')
      setError('')
      setActionMessage('')
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        setPasswordError('Incorrect password.')
      } else {
        setPasswordError('Could not reach the admin portal.')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(ADMIN_STORAGE_KEY)
    setAdminPassword('')
    setPasswordInput('')
    setBookings([])
    setSearch('')
    setPasswordError('')
    setError('')
    setActionMessage('')
    setBusyBookingId('')
  }

  async function handleStatusChange(bookingId, nextStatus) {
    try {
      setBusyBookingId(bookingId)
      const updatedBooking = await updateBooking(adminPassword, bookingId, { status: nextStatus })
      setBookings((current) => current.map((booking) => (
        booking._id === bookingId ? updatedBooking : booking
      )))
      setActionMessage(`Status updated to ${nextStatus}.`)
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update booking status.')
    } finally {
      setBusyBookingId('')
    }
  }

  async function handleDelete(bookingId) {
    const confirmed = window.confirm('Delete this booking record permanently?')
    if (!confirmed) {
      return
    }

    try {
      setBusyBookingId(bookingId)
      await deleteBooking(adminPassword, bookingId)
      setBookings((current) => current.filter((booking) => booking._id !== bookingId))
      setActionMessage('Booking deleted successfully.')
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete booking.')
    } finally {
      setBusyBookingId('')
    }
  }

  const normalizedSearch = deferredSearch.trim().toLowerCase()
  const filtered = bookings.filter((booking) => {
    if (!normalizedSearch) {
      return true
    }

    return (
      booking.fullName?.toLowerCase().includes(normalizedSearch) ||
      booking.phone?.toLowerCase().includes(normalizedSearch) ||
      booking.pickup?.toLowerCase().includes(normalizedSearch) ||
      booking.destination?.toLowerCase().includes(normalizedSearch)
    )
  })

  const pendingCount = bookings.filter((booking) => normalizeStatus(booking.status) === 'pending').length
  const confirmedCount = bookings.filter((booking) => normalizeStatus(booking.status) === 'confirmed').length
  const doneCount = bookings.filter((booking) => normalizeStatus(booking.status) === 'done').length

  if (!adminPassword) {
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
              onChange={(event) => setPasswordInput(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handlePasswordSubmit()}
            />
          </label>
          {passwordError && <p className="admin-error" aria-live="polite">{passwordError}</p>}
          <button type="button" onClick={handlePasswordSubmit} className="admin-primary-btn" disabled={loading}>
            {loading ? 'Checking...' : 'Enter Portal'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <div>
          <p className="admin-kicker">KMC Operations</p>
          <h1 className="admin-title">Booking Management Console</h1>
          <p className="admin-subtitle">Track enquiries, move them through the workflow, and manage records securely.</p>
        </div>
        <div className="admin-topbar-actions">
          <button type="button" onClick={() => fetchBookings()} className="admin-secondary-btn" disabled={loading}>
            Refresh
          </button>
          <button type="button" onClick={handleLogout} className="admin-ghost-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <span className="admin-stat-num">{bookings.length}</span>
          <span className="admin-stat-label">Total Enquiries</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-num">{pendingCount}</span>
          <span className="admin-stat-label">Pending</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-num">{confirmedCount}</span>
          <span className="admin-stat-label">Confirmed</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-num">{doneCount}</span>
          <span className="admin-stat-label">Done</span>
        </div>
      </div>

      <div className="admin-toolbar">
        <label className="admin-field admin-search">
          <span className="admin-field-label">Search Enquiries</span>
          <input
            className="admin-input"
            type="search"
            name="searchBookings"
            autoComplete="off"
            placeholder="Search by name, phone, pickup or destination..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        {actionMessage && <p className="admin-success-banner" aria-live="polite">{actionMessage}</p>}
      </div>

      {loading && <p className="admin-info" aria-live="polite">Loading bookings...</p>}
      {error && <p className="admin-error-banner" aria-live="polite">{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className="admin-info">No bookings found.</p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  {['#', 'Name', 'Phone', 'Pickup', 'Destination', 'Date', 'Vehicle', 'Status', 'Trip Notes', 'Submitted', 'Actions'].map((heading) => (
                    <th key={heading}>
                      {heading}
                    </th>
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
                      <td>
                        <a href={`tel:${booking.phone}`} className="admin-phone-link">
                          {booking.phone || '-'}
                        </a>
                      </td>
                      <td>{booking.pickup || '-'}</td>
                      <td>{booking.destination || '-'}</td>
                      <td>{booking.date || '-'}</td>
                      <td>{booking.vehicle || '-'}</td>
                      <td>
                        <div className="admin-status-cell">
                          <span className={`admin-status-badge admin-status-${status}`}>{status}</span>
                          <select
                            className="admin-status-select"
                            value={status}
                            onChange={(event) => handleStatusChange(booking._id, event.target.value)}
                            disabled={isBusy}
                          >
                            {statusOptions.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="admin-notes-cell">{booking.notes || '-'}</td>
                      <td>{formatBookingTime(booking.createdAt)}</td>
                      <td>
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            className="admin-danger-btn"
                            onClick={() => handleDelete(booking._id)}
                            disabled={isBusy}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="admin-card-list">
            {filtered.map((booking, index) => {
              const status = normalizeStatus(booking.status)
              const isBusy = busyBookingId === booking._id

              return (
                <article className="admin-card" key={booking._id}>
                  <div className="admin-card-header">
                    <div>
                      <p className="admin-card-name">{booking.fullName || 'Unnamed Booking'}</p>
                      <span className="admin-card-time">{formatBookingTime(booking.createdAt)}</span>
                    </div>
                    <span className="admin-card-index">{index + 1}</span>
                  </div>
                  <div className="admin-card-grid">
                    <div className="admin-card-row">
                      <span className="admin-card-label">Phone</span>
                      <a href={`tel:${booking.phone}`} className="admin-phone-link admin-card-value">
                        {booking.phone || '-'}
                      </a>
                    </div>
                    <div className="admin-card-row">
                      <span className="admin-card-label">Pickup</span>
                      <span className="admin-card-value">{booking.pickup || '-'}</span>
                    </div>
                    <div className="admin-card-row">
                      <span className="admin-card-label">Destination</span>
                      <span className="admin-card-value">{booking.destination || '-'}</span>
                    </div>
                    <div className="admin-card-row">
                      <span className="admin-card-label">Date</span>
                      <span className="admin-card-value">{booking.date || '-'}</span>
                    </div>
                    <div className="admin-card-row">
                      <span className="admin-card-label">Vehicle</span>
                      <span className="admin-card-value">{booking.vehicle || '-'}</span>
                    </div>
                    <div className="admin-card-row">
                      <span className="admin-card-label">Status</span>
                      <div className="admin-status-stack">
                        <span className={`admin-status-badge admin-status-${status}`}>{status}</span>
                        <select
                          className="admin-status-select"
                          value={status}
                          onChange={(event) => handleStatusChange(booking._id, event.target.value)}
                          disabled={isBusy}
                        >
                          {statusOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="admin-card-row">
                      <span className="admin-card-label">Trip Notes</span>
                      <span className="admin-card-value">{booking.notes || '-'}</span>
                    </div>
                  </div>
                  <div className="admin-card-actions">
                    <button
                      type="button"
                      className="admin-danger-btn"
                      onClick={() => handleDelete(booking._id)}
                      disabled={isBusy}
                    >
                      Delete Record
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
