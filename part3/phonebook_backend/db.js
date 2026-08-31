const mongoose = require('mongoose')

const password = process.env.MONGODB_PASSWORD
const url = `mongodb+srv://testuser1:${password}@cluster1.s5mpz.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)

mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })
