import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    axios.get('/api/test')
      .then(res => setMessage(res.data.message))
      .catch(() => setMessage('Failed to connect to backend'))
  }, [])

  return (
    <div>
      <h1>Listify</h1>
      <p>{message}</p>
    </div>
  )
}

export default App