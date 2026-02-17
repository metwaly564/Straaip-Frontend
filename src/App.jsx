import { Routes, Route, Link } from 'react-router-dom'
import CategoriesPage from './pages/CategoriesPage'
import VideosPage from './pages/VideosPage'
import './App.css'

function App() {
  return (
    <>
      <nav className="app-nav">
        <Link to="/">Home</Link>
        <Link to="/categories">Categories</Link>
        <Link to="/videos">Videos</Link>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={
            <div className="home">
              <h1>Straaip</h1>
              <p><Link to="/categories">Manage Categories</Link></p>
              <p><Link to="/videos">Manage Videos</Link></p>
            </div>
          } />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/videos" element={<VideosPage />} />
        </Routes>
      </main>
    </>
  )
}

export default App
