import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listCandidates, deleteCandidate } from '../api/candidates'

const STATUS_STYLES = {
  pending: 'bg-surface-container-high text-on-surface-variant',
  shortlisted: 'bg-secondary-fixed text-on-secondary-fixed',
  rejected: 'bg-error-container text-on-error-container',
}

function CandidatesPage() {
  const { token } = useAuth()
  const navigate = useNavigate()

  const [candidates, setCandidates] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [skill, setSkill] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => {
    async function fetchCandidates() {
      setLoading(true)
      try {
        const data = await listCandidates(token, {
          search,
          status,
          skill,
          page,
          page_size: pageSize
        })
        setCandidates(data.candidates)
        setTotal(data.total)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCandidates()
  }, [token, search, status, skill, page])

  async function handleDelete(candidateId) {
    const confirmed = window.confirm('Delete this candidate? This cannot be undone.')
    if (!confirmed) return

    try {
      await deleteCandidate(token, candidateId)
      setCandidates((prev) => prev.filter((c) => c.id !== candidateId))
      setTotal((prev) => prev - 1)
      setSelectedIds((prev) => prev.filter((id) => id !== candidateId))
    } catch (err) {
      alert(err.message)
    }
  }

  function toggleSelect(candidateId) {
    setSelectedIds((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    )
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-lg pb-xl">
      <div>
        <p className="font-mono text-label-sm text-secondary uppercase tracking-widest">Talent Pipeline</p>
        <h1 className="font-headline text-headline-lg text-on-surface">Candidates</h1>
      </div>

      <div className="relative">
        <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search by name or email..."
          className="w-full h-12 pl-[44px] pr-md bg-surface-container-low border border-outline-variant/30 rounded-lg font-body text-body-md focus:bg-white focus:border-secondary outline-none transition-all"
        />
      </div>

      <div className="flex gap-sm overflow-x-auto pb-xs">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="h-10 px-md bg-surface-container-lowest border border-outline-variant/30 rounded-full font-mono text-label-md text-on-surface-variant outline-none focus:border-secondary shrink-0"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="rejected">Rejected</option>
        </select>

        <input
          type="text"
          value={skill}
          onChange={(e) => { setSkill(e.target.value); setPage(1) }}
          placeholder="Filter by skill..."
          className="h-10 px-md bg-surface-container-lowest border border-outline-variant/30 rounded-full font-mono text-label-md text-on-surface-variant outline-none focus:border-secondary shrink-0 w-[180px]"
        />
      </div>

      {selectedIds.length >= 2 && (
        <button
          onClick={() => navigate('/compare', { state: { candidateIds: selectedIds } })}
          className="w-full h-12 bg-secondary text-on-secondary rounded-lg font-headline text-body-lg flex items-center justify-center gap-xs"
        >
          Compare Selected ({selectedIds.length})
        </button>
      )}

      {error && <p className="font-body text-body-sm text-error">{error}</p>}
      {loading && <p className="font-body text-body-md text-on-surface-variant">Loading candidates...</p>}
      {!loading && candidates.length === 0 && (
        <p className="font-body text-body-md text-on-surface-variant text-center py-xl">No candidates found.</p>
      )}

      <div className="space-y-md">
        {candidates.map((candidate) => {
          const initial = candidate.name.charAt(0).toUpperCase()
          return (
            <div
              key={candidate.id}
              className="bg-surface-container-lowest rounded-2xl p-md shadow-card border border-outline-variant/10 flex items-start gap-md"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(candidate.id)}
                onChange={() => toggleSelect(candidate.id)}
                className="mt-1 w-4 h-4 rounded border-outline-variant text-secondary shrink-0"
              />

              <div className="w-11 h-11 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary font-headline font-bold text-body-lg shrink-0">
                {initial}
              </div>

              <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between gap-sm">
                  <Link
                    to={`/candidates/${candidate.id}`}
                    className="font-headline text-body-lg font-semibold text-on-surface hover:text-secondary transition-colors truncate"
                  >
                    {candidate.name}
                  </Link>
                  <span className={`font-mono text-label-sm uppercase px-sm py-[2px] rounded-full shrink-0 ${STATUS_STYLES[candidate.status] || STATUS_STYLES.pending}`}>
                    {candidate.status}
                  </span>
                </div>
                <p className="font-body text-body-sm text-on-surface-variant mt-[2px]">
                  {candidate.experience_years} yrs experience
                </p>
                <p className="font-body text-body-sm text-on-surface-variant truncate">
                  {candidate.email || 'No email on file'}
                </p>

                <button
                  onClick={() => handleDelete(candidate.id)}
                  className="mt-xs font-mono text-label-sm text-error hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {total > 0 && (
        <div className="flex items-center justify-between pt-sm">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="h-10 px-md rounded-lg border border-outline-variant/30 font-mono text-label-md text-on-surface disabled:opacity-40"
          >
            Previous
          </button>
          <span className="font-body text-body-sm text-on-surface-variant">
            Page {page} of {totalPages || 1} · {total} total
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="h-10 px-md rounded-lg border border-outline-variant/30 font-mono text-label-md text-on-surface disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default CandidatesPage