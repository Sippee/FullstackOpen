const mongoose = require('mongoose')
const app = require('./app')

const mongoUrl = process.env.NODE_ENV === 'test'
  ? 'mongodb://localhost/bloglist_test'
  : 'mongodb://localhost/bloglist'

mongoose.connect(mongoUrl, { family: 4 })

const PORT = 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})