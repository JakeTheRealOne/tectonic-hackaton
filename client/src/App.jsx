import { useEffect, useState } from 'react'

export default function App() {
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false

    fetch('/api/hello')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API responded with ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        if (!cancelled) {
          setMessage(data.message)
          setStatus('ready')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main>
      <p className="stack">MongoDB · Express · React · Node</p>
      <h1>
        {status === 'ready' ? message : status === 'error' ? 'API unavailable' : 'Loading…'}
      </h1>
      <p className="detail">
        {status === 'ready'
          ? 'Stored in MongoDB and served by the Express API.'
          : status === 'error'
            ? 'The page is up, but the API did not respond.'
            : 'Loading the greeting from the API.'}
      </p>
    </main>
  )
}
