function requireAdmin(req, res, next) {
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    res.status(500).json({ message: 'ADMIN_PASSWORD is not configured on the server.' })
    return
  }

  if (req.get('x-admin-password') !== adminPassword) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  next()
}

module.exports = requireAdmin
