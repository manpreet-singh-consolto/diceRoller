import { useState } from 'react'

function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1
}

export function DiceRoller() {
  const [value, setValue] = useState<number>(() => rollDie())

  return (
    <div className="dice-roller">
      <div className="die-face" data-testid="die-face">
        {value}
      </div>
      <button onClick={() => setValue(rollDie())}>Roll</button>
    </div>
  )
}
