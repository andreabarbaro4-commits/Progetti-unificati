import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './lib/i18n'
import App from './App.tsx'
import { isMockMode } from './mock'

async function bootstrap() {
  if (isMockMode()) {
    await import('./mock/setup');
  }

  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Root element "#root" was not found in the document.')
  }

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

bootstrap();
