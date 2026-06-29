import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
<<<<<<< HEAD
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
=======
import App from './App'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element "#root" was not found in the document.')
}

createRoot(rootElement).render(
>>>>>>> 5ea9b1e782c7236c1ad35783b7053dc05cee4797
  <StrictMode>
    <App />
  </StrictMode>,
)
