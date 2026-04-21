const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
  fullName:    { type: String, required: true },
  phone:       { type: String, required: true },
  pickup:      { type: String, required: true },
  destination: { type: String, required: true },
  date:        { type: String },
  vehicle:     { type: String },
  notes:       { type: String },
  status:      { type: String, enum: ['pending', 'confirmed', 'done'], default: 'pending' },
  createdAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now },
})

module.exports = mongoose.model('Booking', bookingSchema)
