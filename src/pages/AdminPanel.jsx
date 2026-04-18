import { useEffect, useState } from "react";
import axios from "axios";
 
const API = "http://localhost:5000";
 
export default function AdminPanel() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
 
  useEffect(() => {
    fetchBookings();
  }, []);
 
  async function fetchBookings() {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/bookings`);
      // newest first
      setBookings(res.data.reverse());
      setError("");
    } catch (err) {
      setError("Failed to load bookings. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }
 
  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.name?.toLowerCase().includes(q) ||
      b.phone?.toLowerCase().includes(q) ||
      b.pickup?.toLowerCase().includes(q) ||
      b.destination?.toLowerCase().includes(q)
    );
  });
 
  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>KMC Travels</h1>
          <p style={styles.subtitle}>Admin Panel — All Bookings</p>
        </div>
        <button onClick={fetchBookings} style={styles.refreshBtn}>
          ↻ Refresh
        </button>
      </div>
 
      {/* Stats bar */}
      <div style={styles.statsBar}>
        <div style={styles.statCard}>
          <span style={styles.statNum}>{bookings.length}</span>
          <span style={styles.statLabel}>Total Enquiries</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statNum}>
            {bookings.filter((b) => {
              const d = new Date(b.createdAt);
              const today = new Date();
              return d.toDateString() === today.toDateString();
            }).length}
          </span>
          <span style={styles.statLabel}>Today</span>
        </div>
      </div>
 
      {/* Search */}
      <input
        type="text"
        placeholder="Search by name, phone, pickup or destination..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.searchInput}
      />
 
      {/* States */}
      {loading && <p style={styles.info}>Loading bookings...</p>}
      {error && <p style={styles.errorText}>{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p style={styles.info}>No bookings found.</p>
      )}
 
      {/* Table */}
      {!loading && !error && filtered.length > 0 && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["#", "Name", "Phone", "Pickup", "Destination", "Date", "Return?", "Message", "Submitted"].map(
                  (h) => (
                    <th key={h} style={styles.th}>
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr key={b._id} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                  <td style={styles.td}>{i + 1}</td>
                  <td style={styles.td}>{b.name || "—"}</td>
                  <td style={styles.td}>
                    <a href={`tel:${b.phone}`} style={styles.phoneLink}>
                      {b.phone || "—"}
                    </a>
                  </td>
                  <td style={styles.td}>{b.pickup || "—"}</td>
                  <td style={styles.td}>{b.destination || "—"}</td>
                  <td style={styles.td}>{b.date || "—"}</td>
                  <td style={styles.td}>{b.returnTrip ? "Yes" : "No"}</td>
                  <td style={{ ...styles.td, maxWidth: "200px", wordBreak: "break-word" }}>
                    {b.message || "—"}
                  </td>
                  <td style={styles.td}>
                    {b.createdAt
                      ? new Date(b.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
 
const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f1117",
    color: "#e8e8e8",
    fontFamily: "'Segoe UI', sans-serif",
    padding: "32px 24px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "28px",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 700,
    color: "#f5c518",
    letterSpacing: "0.5px",
  },
  subtitle: {
    margin: "4px 0 0",
    fontSize: "14px",
    color: "#888",
  },
  refreshBtn: {
    background: "#1e2230",
    color: "#f5c518",
    border: "1px solid #f5c518",
    borderRadius: "8px",
    padding: "8px 18px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
  },
  statsBar: {
    display: "flex",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    background: "#1e2230",
    borderRadius: "10px",
    padding: "16px 28px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: "120px",
  },
  statNum: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#f5c518",
  },
  statLabel: {
    fontSize: "12px",
    color: "#888",
    marginTop: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  searchInput: {
    width: "100%",
    maxWidth: "480px",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid #2e3347",
    background: "#1e2230",
    color: "#e8e8e8",
    fontSize: "14px",
    marginBottom: "20px",
    outline: "none",
    boxSizing: "border-box",
  },
  info: {
    color: "#888",
    fontSize: "15px",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: "15px",
    background: "#2a1a1a",
    padding: "12px 16px",
    borderRadius: "8px",
  },
  tableWrapper: {
    overflowX: "auto",
    borderRadius: "12px",
    border: "1px solid #2e3347",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  th: {
    background: "#1a1e2e",
    color: "#f5c518",
    padding: "12px 16px",
    textAlign: "left",
    fontWeight: 600,
    whiteSpace: "nowrap",
    borderBottom: "1px solid #2e3347",
  },
  td: {
    padding: "11px 16px",
    borderBottom: "1px solid #1e2230",
    verticalAlign: "top",
    whiteSpace: "nowrap",
  },
  trEven: {
    background: "#13161f",
  },
  trOdd: {
    background: "#0f1117",
  },
  phoneLink: {
    color: "#4db6ff",
    textDecoration: "none",
  },
};