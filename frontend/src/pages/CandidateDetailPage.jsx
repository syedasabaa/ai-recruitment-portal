import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getCandidate, updateCandidate, deleteCandidate } from '../api/candidates'
import { listJobDescriptions } from '../api/jobDescription'
import { analyzeCandidate, updateEvaluationRating } from '../api/evaluations'
import { generateInterviewQuestions, getQuestionsForCandidate } from '../api/interviewQuestions'

const STATUS_STYLES = {
  pending: 'bg-surface-container-high text-on-surface-variant',
  shortlisted: 'bg-secondary-fixed text-on-secondary-fixed',
  rejected: 'bg-error-container text-on-error-container',
}

function Field({ label, value }) {
  return (
    <div>
      <p className="font-mono text-label-sm text-on-surface-variant uppercase">{label}</p>
      <p className="font-body text-body-md text-on-surface mt-[2px]">{value || '—'}</p>
    </div>
  )
}

function CandidateDetailPage() {
  const { candidateId } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()

  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [saving, setSaving] = useState(false)

  const [jobDescriptions, setJobDescriptions] = useState([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [evaluation, setEvaluation] = useState(null)
  const [analysisError, setAnalysisError] = useState('')

  const [ratings, setRatings] = useState({
    recruiter_rating: '',
    technical_rating: '',
    hr_rating: '',
    final_recommendation: ''
  })
  const [savingRating, setSavingRating] = useState(false)

  const [questions, setQuestions] = useState([])
  const [generatingQuestions, setGeneratingQuestions] = useState(false)
  const [questionsError, setQuestionsError] = useState('')

  useEffect(() => { loadCandidate() }, [candidateId, token])

  useEffect(() => {
    listJobDescriptions(token).then(setJobDescriptions).catch(() => {})
  }, [token])

  useEffect(() => {
    getQuestionsForCandidate(token, candidateId)
      .then((data) => setQuestions(data.questions))
      .catch(() => {})
  }, [candidateId, token])

  async function loadCandidate() {
    setLoading(true)
    try {
      const data = await getCandidate(token, candidateId)
      setCandidate(data)
      setFormData({
        name: data.name,
        email: data.email || '',
        phone: data.phone || '',
        experience_years: data.experience_years,
        education: data.education || '',
        status: data.status
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleFieldChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const updated = await updateCandidate(token, candidateId, formData)
      setCandidate((prev) => ({ ...prev, ...updated }))
      setIsEditing(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm('Delete this candidate? This cannot be undone.')
    if (!confirmed) return
    try {
      await deleteCandidate(token, candidateId)
      navigate('/candidates')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleAnalyze() {
    if (!selectedJobId) return
    setAnalyzing(true)
    setAnalysisError('')
    try {
      const result = await analyzeCandidate(token, candidateId, parseInt(selectedJobId))
      setEvaluation(result)
      setRatings({
        recruiter_rating: result.recruiter_rating ?? '',
        technical_rating: result.technical_rating ?? '',
        hr_rating: result.hr_rating ?? '',
        final_recommendation: result.final_recommendation ?? ''
      })
    } catch (err) {
      setAnalysisError(err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  function handleRatingChange(field, value) {
    setRatings((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSaveRating() {
    setSavingRating(true)
    const payload = {}
    if (ratings.recruiter_rating !== '') payload.recruiter_rating = parseFloat(ratings.recruiter_rating)
    if (ratings.technical_rating !== '') payload.technical_rating = parseFloat(ratings.technical_rating)
    if (ratings.hr_rating !== '') payload.hr_rating = parseFloat(ratings.hr_rating)
    if (ratings.final_recommendation !== '') payload.final_recommendation = ratings.final_recommendation

    try {
      const updated = await updateEvaluationRating(token, evaluation.id, payload)
      setEvaluation(updated)
    } catch (err) {
      setAnalysisError(err.message)
    } finally {
      setSavingRating(false)
    }
  }

  async function handleGenerateQuestions() {
    if (!selectedJobId) return
    setGeneratingQuestions(true)
    setQuestionsError('')
    try {
      const result = await generateInterviewQuestions(token, candidateId, parseInt(selectedJobId))
      setQuestions(result.questions)
    } catch (err) {
      setQuestionsError(err.message)
    } finally {
      setGeneratingQuestions(false)
    }
  }

  function questionsByType(type) {
    return questions.filter((q) => q.question_type === type)
  }

  if (loading) return <p className="font-body text-body-md text-on-surface-variant">Loading candidate...</p>
  if (error) return <p className="font-body text-body-sm text-error">{error}</p>
  if (!candidate) return null

  const initial = candidate.name.charAt(0).toUpperCase()

  return (
    <div className="space-y-lg pb-xl">
      <button onClick={() => navigate('/candidates')} className="flex items-center gap-xs font-mono text-label-md text-on-surface-variant">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Candidates
      </button>

      <div className="bg-surface-container-lowest rounded-2xl p-lg shadow-card border border-outline-variant/10">
        <div className="flex items-start justify-between gap-md">
          <div className="flex items-center gap-md">
            <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary font-headline font-bold text-headline-md">
              {initial}
            </div>
            <div>
              <h1 className="font-headline text-headline-md text-on-surface">{candidate.name}</h1>
              <span className={`font-mono text-label-sm uppercase px-sm py-[2px] rounded-full inline-block mt-[4px] ${STATUS_STYLES[candidate.status] || STATUS_STYLES.pending}`}>
                {candidate.status}
              </span>
            </div>
          </div>
          <div className="flex gap-xs shrink-0">
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="h-9 px-sm rounded-lg border border-outline-variant/30 font-mono text-label-sm text-on-surface flex items-center gap-[4px]">
                <span className="material-symbols-outlined text-[16px]">edit</span>
                Edit
              </button>
            )}
            <button onClick={handleDelete} className="h-9 px-sm rounded-lg border border-error/30 font-mono text-label-sm text-error flex items-center gap-[4px]">
              <span className="material-symbols-outlined text-[16px]">delete</span>
              Delete
            </button>
          </div>
        </div>

        {!isEditing ? (
          <div className="grid grid-cols-2 gap-md mt-lg">
            <Field label="Email" value={candidate.email} />
            <Field label="Phone" value={candidate.phone} />
            <Field label="Experience" value={`${candidate.experience_years} years`} />
            <Field label="Education" value={candidate.education} />
            <div className="col-span-2">
              <Field label="Skills" value={candidate.skills} />
            </div>
            <div className="col-span-2">
              <Field label="Certifications" value={candidate.certifications} />
            </div>
            <div className="col-span-2">
              <Field label="Projects" value={candidate.projects} />
            </div>
          </div>
        ) : (
          <div className="space-y-md mt-lg">
            <div className="space-y-xs">
              <label className="font-mono text-label-sm text-on-surface-variant uppercase">Name</label>
              <input value={formData.name} onChange={(e) => handleFieldChange('name', e.target.value)} className="w-full h-11 px-md bg-surface-container-low border border-outline-variant/30 rounded-lg font-body text-body-md outline-none focus:border-secondary" />
            </div>
            <div className="space-y-xs">
              <label className="font-mono text-label-sm text-on-surface-variant uppercase">Status</label>
              <select value={formData.status} onChange={(e) => handleFieldChange('status', e.target.value)} className="w-full h-11 px-md bg-surface-container-low border border-outline-variant/30 rounded-lg font-body text-body-md outline-none focus:border-secondary">
                <option value="pending">Pending</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="space-y-xs">
              <label className="font-mono text-label-sm text-on-surface-variant uppercase">Email</label>
              <input value={formData.email} onChange={(e) => handleFieldChange('email', e.target.value)} className="w-full h-11 px-md bg-surface-container-low border border-outline-variant/30 rounded-lg font-body text-body-md outline-none focus:border-secondary" />
            </div>
            <div className="space-y-xs">
              <label className="font-mono text-label-sm text-on-surface-variant uppercase">Phone</label>
              <input value={formData.phone} onChange={(e) => handleFieldChange('phone', e.target.value)} className="w-full h-11 px-md bg-surface-container-low border border-outline-variant/30 rounded-lg font-body text-body-md outline-none focus:border-secondary" />
            </div>
            <div className="space-y-xs">
              <label className="font-mono text-label-sm text-on-surface-variant uppercase">Experience (years)</label>
              <input type="number" step="0.5" value={formData.experience_years} onChange={(e) => handleFieldChange('experience_years', parseFloat(e.target.value))} className="w-full h-11 px-md bg-surface-container-low border border-outline-variant/30 rounded-lg font-body text-body-md outline-none focus:border-secondary" />
            </div>
            <div className="space-y-xs">
              <label className="font-mono text-label-sm text-on-surface-variant uppercase">Education</label>
              <input value={formData.education} onChange={(e) => handleFieldChange('education', e.target.value)} className="w-full h-11 px-md bg-surface-container-low border border-outline-variant/30 rounded-lg font-body text-body-md outline-none focus:border-secondary" />
            </div>

            <div className="flex gap-sm pt-xs">
              <button onClick={handleSave} disabled={saving} className="h-11 px-lg bg-secondary text-on-secondary rounded-lg font-headline text-body-md disabled:opacity-60">
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setIsEditing(false)} className="h-11 px-lg rounded-lg border border-outline-variant/30 font-body text-body-md text-on-surface">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-surface-container-lowest rounded-2xl p-lg shadow-card border border-outline-variant/10">
        <h2 className="font-headline text-headline-md text-on-surface mb-md">AI Resume Analysis</h2>

        <div className="flex gap-sm">
          <select value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)} className="flex-grow h-11 px-md bg-surface-container-low border border-outline-variant/30 rounded-lg font-body text-body-md outline-none focus:border-secondary">
            <option value="">Select a job description...</option>
            {jobDescriptions.map((job) => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
          <button onClick={handleAnalyze} disabled={!selectedJobId || analyzing} className="h-11 px-lg bg-secondary text-on-secondary rounded-lg font-headline text-body-md disabled:opacity-50 shrink-0">
            {analyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>

        {analysisError && <p className="font-body text-body-sm text-error mt-sm">{analysisError}</p>}

        {evaluation && (
          <div className="mt-lg space-y-lg">
            <div className="flex items-center gap-lg">
              <div className="relative w-24 h-24 shrink-0">
                <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#e0e3e5" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="42" fill="none" stroke="#712ae2" strokeWidth="10"
                    strokeDasharray={`${(evaluation.match_score / 100) * 264} 264`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-headline text-headline-md font-bold text-secondary">{Math.round(evaluation.match_score)}</span>
                  <span className="font-mono text-label-sm text-on-surface-variant">MATCH</span>
                </div>
              </div>
              <div className="border border-dashed border-secondary bg-[#f5f3ff] p-md rounded-xl flex-grow">
                <p className="font-mono text-label-sm text-secondary font-bold uppercase mb-xs">AI Recommendation</p>
                <p className="font-body text-body-sm text-on-surface-variant">{evaluation.ai_recommendation}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-md">
              <Field label="Matching Skills" value={evaluation.matching_skills} />
              <Field label="Missing Skills" value={evaluation.missing_skills} />
              <Field label="Experience Gap" value={evaluation.experience_gap} />
            </div>

            <div>
              <h3 className="font-headline text-body-lg font-semibold text-on-surface mb-sm">Human Ratings</h3>
              <div className="grid grid-cols-3 gap-sm">
                <div className="space-y-xs">
                  <label className="font-mono text-label-sm text-on-surface-variant uppercase">Recruiter</label>
                  <input type="number" min="0" max="10" step="0.5" value={ratings.recruiter_rating} onChange={(e) => handleRatingChange('recruiter_rating', e.target.value)} className="w-full h-10 px-sm bg-surface-container-low border border-outline-variant/30 rounded-lg font-body text-body-sm outline-none focus:border-secondary" />
                </div>
                <div className="space-y-xs">
                  <label className="font-mono text-label-sm text-on-surface-variant uppercase">Technical</label>
                  <input type="number" min="0" max="10" step="0.5" value={ratings.technical_rating} onChange={(e) => handleRatingChange('technical_rating', e.target.value)} className="w-full h-10 px-sm bg-surface-container-low border border-outline-variant/30 rounded-lg font-body text-body-sm outline-none focus:border-secondary" />
                </div>
                <div className="space-y-xs">
                  <label className="font-mono text-label-sm text-on-surface-variant uppercase">HR</label>
                  <input type="number" min="0" max="10" step="0.5" value={ratings.hr_rating} onChange={(e) => handleRatingChange('hr_rating', e.target.value)} className="w-full h-10 px-sm bg-surface-container-low border border-outline-variant/30 rounded-lg font-body text-body-sm outline-none focus:border-secondary" />
                </div>
              </div>

              <div className="space-y-xs mt-sm">
                <label className="font-mono text-label-sm text-on-surface-variant uppercase">Final Recommendation</label>
                <select value={ratings.final_recommendation} onChange={(e) => handleRatingChange('final_recommendation', e.target.value)} className="w-full h-11 px-md bg-surface-container-low border border-outline-variant/30 rounded-lg font-body text-body-md outline-none focus:border-secondary">
                  <option value="">Not decided</option>
                  <option value="Hire">Hire</option>
                  <option value="Reject">Reject</option>
                  <option value="Consider for other roles">Consider for other roles</option>
                </select>
              </div>

              <button onClick={handleSaveRating} disabled={savingRating} className="mt-sm h-11 px-lg bg-secondary text-on-secondary rounded-lg font-headline text-body-md disabled:opacity-60">
                {savingRating ? 'Saving...' : 'Save Ratings'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-surface-container-lowest rounded-2xl p-lg shadow-card border border-outline-variant/10">
        <h2 className="font-headline text-headline-md text-on-surface mb-md">Interview Questions</h2>

        <button onClick={handleGenerateQuestions} disabled={!selectedJobId || generatingQuestions} className="h-11 px-lg bg-secondary text-on-secondary rounded-lg font-headline text-body-md disabled:opacity-50">
          {generatingQuestions ? 'Generating...' : 'Generate Questions'}
        </button>

        {questionsError && <p className="font-body text-body-sm text-error mt-sm">{questionsError}</p>}

        {questions.length > 0 && (
          <div className="mt-lg space-y-lg">
            <div>
              <p className="font-mono text-label-sm text-secondary uppercase mb-xs">Technical</p>
              <ol className="space-y-xs list-decimal list-inside">
                {questionsByType('technical').map((q) => (
                  <li key={q.id} className="font-body text-body-sm text-on-surface">{q.question_text}</li>
                ))}
              </ol>
            </div>
            <div>
              <p className="font-mono text-label-sm text-secondary uppercase mb-xs">Scenario</p>
              <ol className="space-y-xs list-decimal list-inside">
                {questionsByType('scenario').map((q) => (
                  <li key={q.id} className="font-body text-body-sm text-on-surface">{q.question_text}</li>
                ))}
              </ol>
            </div>
            <div>
              <p className="font-mono text-label-sm text-secondary uppercase mb-xs">Coding</p>
              <ol className="space-y-xs list-decimal list-inside">
                {questionsByType('coding').map((q) => (
                  <li key={q.id} className="font-body text-body-sm text-on-surface">{q.question_text}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CandidateDetailPage