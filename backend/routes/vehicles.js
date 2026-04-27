const express = require('express')
const Vehicle = require('../models/VehicleModel')
const requireAdmin = require('../middleware/requireAdmin')

const router = express.Router()

const allowedFields = ['name', 'category', 'seats', 'air', 'rate', 'note', 'visible', 'order']

function pickFields(source, fields) {
  return fields.reduce((result, field) => {
    if (source[field] !== undefined) {
      result[field] = source[field]
    }

    return result
  }, {})
}

router.get('/', async (req, res, next) => {
  if (req.query.all === '1') {
    return requireAdmin(req, res, next)
  }

  next()
}, async (req, res) => {
  try {
    const filter = req.query.all === '1' ? {} : { visible: true }
    const vehicles = await Vehicle.find(filter).sort({ order: 1, createdAt: 1 })
    res.json(vehicles)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch vehicles', error: error.message })
  }
})

router.post('/', requireAdmin, async (req, res) => {
  try {
    const data = pickFields(req.body, allowedFields)
    const vehicle = new Vehicle(data)
    await vehicle.save()
    res.status(201).json(vehicle)
  } catch (error) {
    res.status(400).json({ message: 'Failed to create vehicle', error: error.message })
  }
})

router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const updates = pickFields(req.body, allowedFields)
    updates.updatedAt = new Date()

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true },
    )

    if (!vehicle) {
      res.status(404).json({ message: 'Vehicle not found' })
      return
    }

    res.json(vehicle)
  } catch (error) {
    res.status(400).json({ message: 'Failed to update vehicle', error: error.message })
  }
})

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id)

    if (!vehicle) {
      res.status(404).json({ message: 'Vehicle not found' })
      return
    }

    res.json({ message: 'Vehicle deleted' })
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete vehicle', error: error.message })
  }
})

module.exports = router
