import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login(username, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <header className="fixed top-0 w-full z-50 bg-surface border-b border-outline-variant/10 flex items-center px-margin-mobile md:px-margin-desktop h-16">
        <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          bolt
        </span>
        <span className="font-headline text-headline-md font-bold text-on-surface tracking-tight ml-xs">
          TalentPulse AI
        </span>
      </header>

      <main className="flex-grow flex items-center justify-center px-margin-mobile pt-20 pb-12">
        <div className="w-full max-w-[440px] flex flex-col gap-lg">
          <div className="text-center space-y-base">
            <h1 className="font-headline text-headline-lg text-on-surface">Welcome Back</h1>
            <p className="font-body text-body-md text-on-surface-variant">
              Access your intelligence-driven talent pipeline.
            </p>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-xl shadow-card border border-outline-variant/10">
            <form onSubmit={handleSubmit} className="space-y-lg">
              <div className="space-y-xs">
                <label htmlFor="username" className="font-mono text-label-md text-on-surface-variant flex items-center gap-xs uppercase">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="your username"
                  className="w-full h-12 px-md bg-surface-container-low border border-outline-variant/30 rounded-lg font-body text-body-md focus:bg-white focus:border-secondary outline-none transition-all"
                />
              </div>

              <div className="space-y-xs">
                <label htmlFor="password" className="font-mono text-label-md text-on-surface-variant flex items-center gap-xs uppercase">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full h-12 px-md bg-surface-container-low border border-outline-variant/30 rounded-lg font-body text-body-md focus:bg-white focus:border-secondary outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-md top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {error && (
                <p className="font-body text-body-sm text-error bg-error-container/40 px-md py-xs rounded-lg">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-secondary text-on-secondary rounded-lg font-headline text-headline-md flex items-center justify-center gap-xs transition-all hover:shadow-[0_0_15px_rgba(113,42,226,0.4)] active:scale-[0.98] disabled:opacity-60"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>
          </div>

          <p className="text-center font-body text-body-sm text-on-surface-variant">
            Don't have an account?{' '}
            <Link to="/register" className="text-secondary font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export default LoginPage