import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './lib/i18n'
import App from './App.tsx'
import { isMockMode } from './mock'
import { env } from './env'

function setDocumentTitle() {
  const titlePrefix: Record<string, string> = {
    local: '[LOCAL]',
    dev: '[DEV]',
    test: '[TEST]',
    preprod: '[PREPROD]',
  };
  const prefix = titlePrefix[env.APP_ENV];
  if (prefix) {
    document.title = `${prefix} Flowlee`;
  }
}

async function bootstrap() {
  if (isMockMode()) {
    await import('./mock/setup');
  }

  setDocumentTitle();

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
