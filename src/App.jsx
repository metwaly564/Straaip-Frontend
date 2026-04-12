import { Routes, Route, Link } from 'react-router-dom'
import CategoriesPage from './pages/CategoriesPage'
import VideosPage from './pages/VideosPage'
import VerificationPage from './pages/VerificationPage'
import BusinessCategoriesPage from './pages/BusinessCategoriesPage'
import './App.css'

function App() {
  return (
    <>
      <nav className="app-nav">
        <Link to="/">Home</Link>
        <Link to="/categories">Video Categories</Link>
        <Link to="/business-categories">Biz Categories</Link>
        <Link to="/verification">Verification</Link>
        <Link to="/videos">Videos</Link>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={
            <div className="home">
              <h1>Straaiv Admin</h1>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
                <Link to="/categories" className="home-card">Video Categories</Link>
                <Link to="/business-categories" className="home-card">Business Categories</Link>
                <Link to="/verification" className="home-card">Verification Management</Link>
                <Link to="/videos" className="home-card">Videos Management</Link>
              </div>
            </div>
          } />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/business-categories" element={<BusinessCategoriesPage />} />
          <Route path="/verification" element={<VerificationPage />} />
          <Route path="/videos" element={<VideosPage />} />
        </Routes>
      </main>
    </>
  )
}


export default App
