import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'grid_view' },
  { to: '/candidates', label: 'Candidates', icon: 'group' },
  { to: '/upload', label: 'Upload', icon: 'cloud_upload' },
]

function Layout({ children }) {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const initial = (user?.full_name || user?.username || '?').charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="fixed top-0 w-full z-40 bg-surface border-b border-outline-variant/20 flex items-center justify-between px-margin-mobile h-16">
        <div className="flex items-center gap-xs">
          <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            bolt
          </span>
          <span className="font-headline text-headline-md font-bold text-on-surface tracking-tight">
            TalentPulse AI
          </span>
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary font-mono text-label-md"
          >
            {initial}
          </button>

          {menuOpen && (
            <div className="absolute top-12 right-0 bg-surface-container-lowest border border-outline-variant/20 rounded-lg shadow-card overflow-hidden min-w-[160px]">
              <div className="px-md py-sm border-b border-outline-variant/10">
                <p className="font-body text-body-sm text-on-surface font-semibold truncate">
                  {user?.full_name || user?.username}
                </p>
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-md py-sm font-body text-body-sm text-error hover:bg-error-container/20 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow pt-20 pb-24 px-margin-mobile max-w-[720px] w-full mx-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 w-full z-40 bg-surface-container-lowest border-t border-outline-variant/20 flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-[2px] px-md py-xs rounded-lg font-mono text-label-sm transition-colors ${
                isActive ? 'text-secondary bg-secondary-fixed' : 'text-outline'
              }`
            }
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default Layout