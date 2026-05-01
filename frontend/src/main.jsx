import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Note: React StrictMode removed intentionally.
// StrictMode double-invokes useEffect in development, causing every API call
// to fire twice. This was confirmed in server logs showing duplicate GET requests.
createRoot(document.getElementById('root')).render(<App />)

