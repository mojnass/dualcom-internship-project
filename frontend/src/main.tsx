import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'

const query = new QueryClient();

createRoot(document.getElementById('root')!).render(

  <StrictMode>
    <QueryClientProvider client={query}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
