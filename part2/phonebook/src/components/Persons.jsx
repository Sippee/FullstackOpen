const Filter = (props) => (
  <div>
    filter shown with: <input value={props.value} onChange={props.onChange} />
  </div>
)

const PersonForm = (props) => (
  <form onSubmit={props.onSubmit}>
    <div>
      name: <input value={props.name} onChange={props.onNameChange} />
    </div>
    <div>
      number: <input value={props.number} onChange={props.onNumberChange} />
    </div>
    <div>
      <button type="submit">add</button>
    </div>
  </form>
)

const Persons = (props) => (
  <ul>
    {props.persons.map(person => (
      <li key={person.id}>
        {person.name} {person.number}
        <button onClick={() => props.onDelete(person.id, person.name)}>delete</button>
      </li>
    ))}
  </ul>
)

export { Filter, PersonForm, Persons }