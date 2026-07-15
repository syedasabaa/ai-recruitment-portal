import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listJobDescriptions, createJobDescription } from '../api/jobDescription'

function JobDescriptionsPage() {
  const { token } = useAuth()
  const navigate = useNavigate()

  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [requiredSkills, setRequiredSkills] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => { loadJobs() }, [token])

  async function loadJobs() {
    setLoading(true)
    try {
      const data = await listJobDescriptions(token)
      setJobs(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(event) {
    event.preventDefault()
    setSubmitting(true)
    setFormError('')

    try {
      const newJob = await createJobDescription(token, {
        title,
        description,
        required_skills: requiredSkills || null
      })
      setJobs((prev) => [newJob, ...prev])
      setTitle('')
      setDescription('')
      setRequiredSkills('')
      setShowForm(false)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-lg pb-xl">
      <div className="flex items-center justify-between gap-sm">
        <div>
          <p className="font-mono text-label-sm text-secondary uppercase tracking-widest">Hiring Needs</p>
          <h1 className="font-headline text-headline-lg text-on-surface">Job Descriptions</h1>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="h-9 px-sm rounded-lg border border-outline-variant/30 font-mono text-label-sm text-on-surface shrink-0"
        >
          Dashboard
        </button>
      </div>

      <button
        onClick={() => setShowForm((prev) => !prev)}
        className="w-full h-12 bg-secondary text-on-secondary rounded-lg font-headline text-body-lg flex items-center justify-center gap-xs"
      >
        <span className="material-symbols-outlined">{showForm ? 'close' : 'add'}</span>
        {showForm ? 'Cancel' : 'New Job Description'}
      </button>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-surface-container-lowest rounded-2xl p-lg shadow-card border border-outline-variant/10 space-y-md">
          <div className="space-y-xs">
            <label className="font-mono text-label-sm text-on-surface-variant uppercase">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Senior Backend Developer"
              className="w-full h-11 px-md bg-surface-container-low border border-outline-variant/30 rounded-lg font-body text-body-md outline-none focus:border-secondary"
            />
          </div>

          <div className="space-y-xs">
            <label className="font-mono text-label-sm text-on-surface-variant uppercase">Description</label>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Full job description..."
              className="w-full px-md py-sm bg-surface-container-low border border-outline-variant/30 rounded-lg font-body text-body-md outline-none focus:border-secondary resize-none"
            />
          </div>

          <div className="space-y-xs">
            <label className="font-mono text-label-sm text-on-surface-variant uppercase">Required Skills (optional)</label>
            <input
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              placeholder="Python, FastAPI, PostgreSQL"
              className="w-full h-11 px-md bg-surface-container-low border border-outline-variant/30 rounded-lg font-body text-body-md outline-none focus:border-secondary"
            />
          </div>

          {formError && (
            <p className="font-body text-body-sm text-error bg-error-container/40 px-md py-xs rounded-lg">{formError}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 bg-secondary text-on-secondary rounded-lg font-headline text-body-lg disabled:opacity-60"
          >
            {submitting ? 'Creating...' : 'Create Job Description'}
          </button>
        </form>
      )}

      {loading && <p className="font-body text-body-md text-on-surface-variant">Loading job descriptions...</p>}
      {error && <p className="font-body text-body-sm text-error">{error}</p>}
      {!loading && jobs.length === 0 && (
        <p className="font-body text-body-md text-on-surface-variant text-center py-xl">No job descriptions yet.</p>
      )}

      <div className="space-y-md">
        {jobs.map((job) => (
          <div key={job.id} className="bg-surface-container-lowest rounded-2xl p-md shadow-card border border-outline-variant/10">
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-secondary">work</span>
              <h3 className="font-headline text-body-lg font-semibold text-on-surface">{job.title}</h3>
            </div>
            <p className="font-body text-body-sm text-on-surface-variant mt-xs line-clamp-3">{job.description}</p>
            {job.required_skills && (
              <p className="font-mono text-label-sm text-secondary uppercase mt-sm">{job.required_skills}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default JobDescriptionsPage