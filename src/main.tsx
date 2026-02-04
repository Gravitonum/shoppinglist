import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ShoppingListApp from './App.tsx'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ShoppingListApp />
  </StrictMode>,
)
