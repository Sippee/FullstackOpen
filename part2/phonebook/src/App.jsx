import './index.css'
import { useEffect, useState } from 'react'
import { Filter, PersonForm, Persons } from './components/Persons'
import Notification from './components/Notification'
import personService from './services/persons'

const App = () => {
  const [persons, setPersons] = useState([])
  const [filter, setFilter] = useState('')
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [notificationMessage, setNotificationMessage] = useState(null)
  const [notificationType, setNotificationType] = useState('success')

  const showNotification = (message, type = 'success') => {
    setNotificationMessage(message)
    setTimeout(() => setNotificationMessage(null), 4000)
    setNotificationType(type)
  }

  useEffect(() => {
    personService.getAll().then(persons => setPersons(persons))
  }, [])

  const filteredPersons = persons.filter(person => person.name.toLowerCase().includes(filter.toLowerCase()))

  const handleFilterChange = (event) => setFilter(event.target.value)
  const handleNameChange = (event) => setNewName(event.target.value)
  const handleNumberChange = (event) => setNewNumber(event.target.value)

  const addPerson = (event) => {
    event.preventDefault()

    const existingPerson = persons.find(person => person.name === newName)

    if (existingPerson) {
      const replace = window.confirm(
        `${newName} is already added to phonebook, replace the old number with a new one?`
      )

      if (!replace) {
        return
      }

      const updatedPerson = { ...existingPerson, number: newNumber }
      personService.update(existingPerson.id, updatedPerson).then(person => {
        setPersons(persons.map(currentPerson =>
          currentPerson.id === person.id ? person : currentPerson
        ))
        setNewName('')
        setNewNumber('')
        showNotification(`${person.name}'s number was updated`)
      })
      return
    }

    const newPerson = { name: newName, number: newNumber }

    personService.create(newPerson).then(person => {
      setPersons(persons.concat(person))
      setNewName('')
      setNewNumber('')
      showNotification(`Added ${person.name}`)
    })
  }

  const handleDelete = (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) {
      return
    }

    personService.remove(id).then(() => {
      setPersons(persons.filter(person => person.id !== id))
      showNotification(`Deleted ${name}`)
    }).catch(() => {
      setPersons(persons.filter(person => person.id !== id))
      showNotification(`This ${name} was already removed from server`, 'error')
    })
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notificationMessage} type={notificationType} />
      <Filter value={filter} onChange={handleFilterChange} />
      <h3>Add a new</h3>
      <PersonForm
        name={newName}
        number={newNumber}
        onNameChange={handleNameChange}
        onNumberChange={handleNumberChange}
        onSubmit={addPerson}
      />
      <h2>Numbers</h2>
      <Persons persons={filteredPersons} onDelete={handleDelete} />
    </div>
  )
}

export default App