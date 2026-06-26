
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Catalogue from './components/Catalogue/Catalogue.jsx'
import { Route, BrowserRouter, Routes } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/catalogue" element={<Catalogue />} />
    </Routes>
  </BrowserRouter>
)
