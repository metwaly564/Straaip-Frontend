import { Routes, Route, Link, useLocation } from 'react-router-dom'
import CategoriesPage from './pages/CategoriesPage'
import VideosPage from './pages/VideosPage'
import VerificationPage from './pages/VerificationPage'
import BusinessCategoriesPage from './pages/BusinessCategoriesPage'
import RegistrationFlow from './pages/RegistrationFlow'
import ActivityTypesPage from './pages/ActivityTypesPage'
import ReportsPage from './pages/ReportsPage'
import UsersPage from './pages/UsersPage'
import './App.css'

/**
 * Main Layout with Fixed Sidebar
 */

function App() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/categories', label: 'Video Categories', icon: '📁' },
    { path: '/business-categories', label: 'Biz Categories', icon: '💼' },
    { path: '/activity-types', label: 'Activity Types', icon: '🏷️' },
    { path: '/verification', label: 'Verification', icon: '✔️' },
    { path: '/users', label: 'Users', icon: '👥' },
    { path: '/videos', label: 'All Videos', icon: '🎬' },
    { path: '/reports', label: 'Reports', icon: '🚩' },
    { path: '/register', label: 'Bizz Register', icon: '✨' },
  ];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">S</div>
          <span className="logo-text">Straaiv Admin</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-status">
            <div className="status-indicator"></div>
            <span>System Online</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        <header className="page-header-global glass">
          <div className="breadcrumb">
            Admin / {navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}
          </div>
          <div className="user-profile">
            <span className="badge-admin">Root Admin</span>
          </div>
        </header>

        <main className="content-area">
          <Routes>
            <Route path="/" element={
              <div className="dashboard-home">
                <div className="welcome-banner">
                  <h1>Welcome to Straaiv Admin</h1>
                  <p>Comprehensive management for your business network.</p>
                </div>
                
                <div className="stats-grid">
                  <div className="stat-card premium-card">
                    <div className="stat-value">2.4k</div>
                    <div className="stat-label">Total Users</div>
                  </div>
                  <div className="stat-card premium-card">
                    <div className="stat-value">158</div>
                    <div className="stat-label">Pending Verification</div>
                  </div>
                  <div className="stat-card premium-card">
                    <div className="stat-value">$12.5k</div>
                    <div className="stat-label">Revenue</div>
                  </div>
                </div>

                <div className="quick-access-grid">
                  {navItems.slice(1).map(item => (
                    <Link to={item.path} key={item.path} className="quick-card premium-card">
                      <span className="quick-icon">{item.icon}</span>
                      <h3>{item.label}</h3>
                      <p>Manage and configure {item.label.toLowerCase()} settings.</p>
                    </Link>
                  ))}
                </div>
              </div>
            } />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/business-categories" element={<BusinessCategoriesPage />} />
            <Route path="/activity-types" element={<ActivityTypesPage />} />
            <Route path="/verification" element={<VerificationPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/videos" element={<VideosPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/register" element={<RegistrationFlow />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
