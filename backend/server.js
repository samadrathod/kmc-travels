const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const bookingRoutes = require('./routes/bookings')
const vehicleRoutes = require('./routes/vehicles')

const app = express()
const port = Number(process.env.PORT) || 5000
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist')

function getAllowedOrigins() {
  const configuredOrigins = process.env.FRONTEND_URLS
    ? process.env.FRONTEND_URLS.split(',').map((origin) => origin.trim()).filter(Boolean)
    : []

  return configuredOrigins.length > 0
    ? configuredOrigins
    : ['http://localhost:5173']
}

const allowedOrigins = getAllowedOrigins()
const allowAnyOrigin = allowedOrigins.includes('*')

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowAnyOrigin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }
    callback(new Error('CORS blocked for this origin'))
  },
}))

app.use(express.json())

app.use('/api/bookings', bookingRoutes)
app.use('/api/vehicles', vehicleRoutes)

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.use(express.static(frontendDistPath))

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'))
})

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(port, () => {
      console.log(`Server running on port ${port}`)
    })
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message)
    process.exit(1)
  })