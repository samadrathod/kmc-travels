const express = require('express')
const router = express.Router()
const Booking = require('../models/BookingModel')

// POST /api/bookings — save a new booking
router.post('/', async (req, res) => {
  try {
    const booking = new Booking(req.body)
    await booking.save()
    res.status(201).json({ message: 'Booking saved successfully' })
  } catch (error) {
    res.status(400).json({ message: 'Failed to save booking', error: error.message })
  }
})

// GET /api/bookings — get all bookings (for admin panel later)
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 })
    res.json(bookings)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: error.message })
  }
})

module.exports = router