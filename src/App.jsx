import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AdminPanel from "./pages/AdminPanel";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin" element={<AdminPanel />} />
    </Routes>
  )
}

export default App