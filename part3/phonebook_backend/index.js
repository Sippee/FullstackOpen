const express = require('express')
const path = require('path')
const morgan = require('morgan')
const cors = require('cors')
require('./db')
const Person = require('./models/person')
const app = express()

app.use(cors())
app.use(express.json())

morgan.token('body', request => {
  return request.method === 'POST' ? JSON.stringify(request.body) : ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.static(path.join(__dirname, 'dist')))

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    response.status(400).json({ error: 'name or number missing' })
    return
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      response.status(201).json(savedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
  Person.countDocuments({}).then(count => {
    const requestTime = new Date()
    response.send(`
      <p>Phonebook has info for ${count} people</p>
      <p>${requestTime}</p>
    `)
  })
})

app.get(/^(?!\/api).*$/, (request, response) => {
  response.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'Error') {
    return response.status(400).send({ error: 'error' })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})