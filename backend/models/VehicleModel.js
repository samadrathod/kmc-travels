const mongoose = require('mongoose')

const vehicleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['sedan', 'suv', 'large'], required: true },
  seats: { type: String, required: true },
  air: { type: String, required: true },
  rate: { type: String, required: true },
  note: { type: String, default: '' },
  visible: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Vehicle', vehicleSchema)
