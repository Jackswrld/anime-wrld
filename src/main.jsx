
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Worlds from './Animepg/Worlds.jsx'
import Catalogue from './components/Catalogue/Catalogue.jsx'
import Animes from '../src/Animepg/Anime.jsx'
import Navbar from './components/Navbar.jsx'
import { Route, BrowserRouter, Routes } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Navbar />
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/catalogue" element={<Catalogue />} />
      <Route path="/worlds" element={<Worlds />} />
      <Route path="/anime" element={<Animes />} />
    </Routes>
  </BrowserRouter>
)
