const express = require('express')
const Booking = require('../models/BookingModel')
const requireAdmin = require('../middleware/requireAdmin')

const router = express.Router()
const allowedFields = ['fullName', 'phone', 'pickup', 'destination', 'date', 'vehicle', 'notes']
const allowedAdminFields = [...allowedFields, 'status']

function pickFields(source, fields) {
  return fields.reduce((result, field) => {
    if (source[field] !== undefined) {
      result[field] = source[field]
    }

    return result
  }, {})
}

router.post('/', async (req, res) => {
  try {
    const bookingData = pickFields(req.body, allowedFields)
    const booking = new Booking(bookingData)
    await booking.save()
    res.status(201).json({ message: 'Booking saved successfully' })
  } catch (error) {
    res.status(400).json({ message: 'Failed to save booking', error: error.message })
  }
})

router.get('/', requireAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 })
    res.json(bookings)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: error.message })
  }
})

router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const updates = pickFields(req.body, allowedAdminFields)
    updates.updatedAt = new Date()

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true },
    )

    if (!booking) {
      res.status(404).json({ message: 'Booking not found' })
      return
    }

    res.json(booking)
  } catch (error) {
    res.status(400).json({ message: 'Failed to update booking', error: error.message })
  }
})

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id)

    if (!booking) {
      res.status(404).json({ message: 'Booking not found' })
      return
    }

    res.json({ message: 'Booking deleted successfully' })
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete booking', error: error.message })
  }
})

module.exports = router
