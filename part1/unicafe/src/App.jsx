import { useState } from 'react'

const Button = (props) => (
  <button onClick={props.onClick}>
    {props.text}
  </button>
)

const StatisticLine = (props) => (
  <div>{props.text} {props.value}</div>
)

const Statistics = (props) => (
      <div>
        <h1>statistics</h1>

        {props.good + props.neutral + props.bad === 0
          ? <div>No feedback given</div>
          : <>
              <StatisticLine text="good" value={props.good} />
              <StatisticLine text="neutral" value={props.neutral} />
              <StatisticLine text="bad" value={props.bad} />
              <StatisticLine text="all" value={props.good + props.neutral + props.bad} />
              <StatisticLine text="average" value={(props.good - props.bad) / (props.good + props.neutral + props.bad) || 0} />
              <StatisticLine text="positive" value={props.good / (props.good + props.neutral + props.bad) || 0} />
            </>}
      </div>
)

const App = () => {
  // save clicks of each button to its own state
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)

  return (
    <div>
      <h1>give feedback</h1>

      <Button onClick={() => setGood(good + 1)} text="good"/>

      <Button onClick={() => setNeutral(neutral + 1)} text="neutral" />

      <Button onClick={() => setBad(bad + 1)} text="bad" />

      <Statistics good={good} neutral={neutral} bad={bad} />
    </div>
  )
}

export default App