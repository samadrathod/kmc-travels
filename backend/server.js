const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const bookingRoutes = require('./routes/bookings')
console.log('bookingRoutes:', bookingRoutes)

const app = express()

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/bookings', bookingRoutes)

app.get('/', (req, res) => {
  res.send('KMC Travels API is running')
})

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message)
  })