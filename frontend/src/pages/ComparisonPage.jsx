import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { compareCandidates } from '../api/candidates'

const STATUS_STYLES = {
  pending: 'bg-surface-container-high text-on-surface-variant',
  shortlisted: 'bg-secondary-fixed text-on-secondary-fixed',
  rejected: 'bg-error-container text-on-error-container',
}

function CandidateComparisonCard({ candidate, commonSkills }) {
  const initial = candidate.name.charAt(0).toUpperCase()
  const score = candidate.latest_match_score

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-lg shadow-card border border-outline-variant/10">
      <div className="flex items-center gap-md">
        <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary font-headline font-bold text-body-lg shrink-0">
          {initial}
        </div>
        <div className="min-w-0">
          <h3 className="font-headline text-body-lg font-semibold text-on-surface truncate">{candidate.name}</h3>
          <span className={`font-mono text-label-sm uppercase px-sm py-[2px] rounded-full inline-block mt-[2px] ${STATUS_STYLES[candidate.status] || STATUS_STYLES.pending}`}>
            {candidate.status}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-md mt-md">
        {score !== null && score !== undefined ? (
          <div className="relative w-16 h-16 shrink-0">
            <svg viewBox="0 0 100 100" className="w-16 h-16 -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#e0e3e5" strokeWidth="10" />
              <circle
                cx="50" cy="50" r="42" fill="none" stroke="#712ae2" strokeWidth="10"
                strokeDasharray={`${(score / 100) * 264} 264`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-headline text-body-md font-bold text-secondary">{Math.round(score)}</span>
            </div>
          </div>
        ) : (
          <p className="font-body text-body-sm text-on-surface-variant">Not yet analyzed</p>
        )}
        <p className="font-body text-body-sm text-on-surface-variant">{candidate.experience_years} yrs experience</p>
      </div>

      <div className="mt-md">
        <p className="font-mono text-label-sm text-on-surface-variant uppercase mb-xs">Skills</p>
        <div className="flex flex-wrap gap-[6px]">
          {candidate.skills.length === 0 && (
            <span className="font-body text-body-sm text-on-surface-variant">No skills on file</span>
          )}
          {candidate.skills.map((skill) => (
            <span
              key={skill}
              className={`font-mono text-label-sm px-sm py-[2px] rounded-full ${
                commonSkills.includes(skill)
                  ? 'bg-secondary text-on-secondary'
                  : 'bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function ComparisonPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const candidateIds = location.state?.candidateIds || []

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (candidateIds.length < 2) {
      setError('Select at least 2 candidates from the Candidates page to compare.')
      setLoading(false)
      return
    }

    async function fetchComparison() {
      try {
        const data = await compareCandidates(token, candidateIds)
        setResult(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchComparison()
  }, [])

  if (loading) return <p className="font-body text-body-md text-on-surface-variant">Loading comparison...</p>

  if (error) {
    return (
      <div className="space-y-md">
        <p className="font-body text-body-sm text-error bg-error-container/40 px-md py-sm rounded-lg">{error}</p>
        <button
          onClick={() => navigate('/candidates')}
          className="h-11 px-lg bg-secondary text-on-secondary rounded-lg font-headline text-body-md"
        >
          Back to Candidates
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-lg pb-xl">
      <button onClick={() => navigate('/candidates')} className="flex items-center gap-xs font-mono text-label-md text-on-surface-variant">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Candidates
      </button>

      <div>
        <p className="font-mono text-label-sm text-secondary uppercase tracking-widest">Side by Side</p>
        <h1 className="font-headline text-headline-lg text-on-surface">Candidate Comparison</h1>
      </div>

      {result.common_skills.length > 0 && (
        <div className="border border-dashed border-secondary bg-[#f5f3ff] p-md rounded-xl flex gap-md items-start">
          <span className="material-symbols-outlined text-secondary shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
            auto_awesome
          </span>
          <div>
            <p className="font-mono text-label-sm text-secondary font-bold uppercase mb-xs">Common Skills</p>
            <p className="font-body text-body-sm text-on-surface-variant">{result.common_skills.join(', ')}</p>
          </div>
        </div>
      )}

      <div className="space-y-md">
        {result.candidates.map((candidate) => (
          <CandidateComparisonCard
            key={candidate.candidate_id}
            candidate={candidate}
            commonSkills={result.common_skills}
          />
        ))}
      </div>
    </div>
  )
}

export default ComparisonPage