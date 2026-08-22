import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BlueprintProvider } from '@blueprintjs/core'
// normalize first, then the X52 token layer (which pulls in Blueprint's CSS).
import 'normalize.css/normalize.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BlueprintProvider>
      <App />
    </BlueprintProvider>
  </StrictMode>,
)
