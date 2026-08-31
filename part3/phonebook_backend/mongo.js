const mongoose = require('mongoose')
const Person = require('./models/person')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://testuser1:${password}@cluster1.s5mpz.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)

mongoose.connect(url)
  .then(() => {
    if (process.argv.length === 3) {
      return Person.find({}).then(result => {
        console.log('phonebook:')
        result.forEach(person => {
          console.log(`${person.name} ${person.number}`)
        })
      })
    }

    const name = process.argv[3]
    const number = process.argv[4]

    const person = new Person({ name, number })
    return person.save().then(() => {
      console.log(`added ${name} number ${number} to phonebook`)
    })
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })
  .finally(() => {
    mongoose.connection.close()
  })
