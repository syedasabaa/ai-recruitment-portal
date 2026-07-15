import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { useAuth } from '../context/AuthContext'
import {
  getDashboardSummary,
  getSkillsDistribution,
  getExperienceDistribution,
  getUploadStats
} from '../api/dashboard'

const SKILL_COLORS = ['#712ae2', '#8a4cfc', '#191c1e', '#76777d', '#c6c6cd']

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-md shadow-card border border-outline-variant/10">
      <p className="font-mono text-label-sm text-on-surface-variant uppercase">{label}</p>
      <p className={`font-headline text-headline-lg mt-xs ${accent ? 'text-secondary' : 'text-on-surface'}`}>
        {value}
      </p>
    </div>
  )
}

function DashboardPage() {
  const { token, user } = useAuth()
  const navigate = useNavigate()

  const [summary, setSummary] = useState(null)
  const [skills, setSkills] = useState([])
  const [experience, setExperience] = useState([])
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [summaryData, skillsData, experienceData, uploadsData] = await Promise.all([
          getDashboardSummary(token),
          getSkillsDistribution(token),
          getExperienceDistribution(token),
          getUploadStats(token)
        ])

        setSummary(summaryData)
        setSkills(skillsData.skills.slice(0, 5))
        setExperience(experienceData.buckets)
        setUploads([...uploadsData.uploads_by_date].reverse())
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [token])

  if (loading) return <p className="font-body text-body-md text-on-surface-variant">Loading dashboard...</p>
  if (error) return <p className="font-body text-body-sm text-error">{error}</p>

  const totalExperience = experience.reduce((sum, b) => sum + b.count, 0)

  return (
    <div className="space-y-lg pb-xl">
      <div>
        <p className="font-mono text-label-sm text-secondary uppercase tracking-widest">System Overview</p>
        <h1 className="font-headline text-headline-lg text-on-surface">
          Welcome, {user?.full_name || user?.username}
        </h1>
      </div>

      <button
        onClick={() => navigate('/upload')}
        className="w-full h-14 bg-secondary text-on-secondary rounded-lg font-headline text-headline-md flex items-center justify-center gap-xs transition-all hover:shadow-[0_0_15px_rgba(113,42,226,0.4)] active:scale-[0.98]"
      >
        <span className="material-symbols-outlined">cloud_upload</span>
        Upload Resume
      </button>

      <div className="grid grid-cols-2 gap-md">
        <StatCard label="Total Candidates" value={summary.total_candidates} />
        <StatCard label="Shortlisted" value={summary.shortlisted} accent />
        <StatCard label="Rejected" value={summary.rejected} />
        <StatCard label="Pending" value={summary.pending} />
      </div>

      <div className="grid grid-cols-2 gap-md">
        <button
          onClick={() => navigate('/job-descriptions')}
          className="bg-surface-container-lowest rounded-2xl p-md shadow-card border border-outline-variant/10 flex items-center gap-sm text-left"
        >
          <span className="material-symbols-outlined text-secondary">work</span>
          <span className="font-body text-body-sm text-on-surface font-semibold">Job Descriptions</span>
        </button>
        <button
          onClick={() => navigate('/chat')}
          className="bg-surface-container-lowest rounded-2xl p-md shadow-card border border-outline-variant/10 flex items-center gap-sm text-left"
        >
          <span className="material-symbols-outlined text-secondary">forum</span>
          <span className="font-body text-body-sm text-on-surface font-semibold">Chat Assistant</span>
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl p-lg shadow-card border border-outline-variant/10">
        <h2 className="font-headline text-headline-md text-on-surface mb-md">Skills Distribution</h2>

        {skills.length === 0 ? (
          <p className="font-body text-body-sm text-on-surface-variant">No skills data yet.</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={skills}
                  dataKey="count"
                  nameKey="skill"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {skills.map((entry, index) => (
                    <Cell key={entry.skill} fill={SKILL_COLORS[index % SKILL_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 gap-xs mt-md">
              {skills.map((s, index) => (
                <div key={s.skill} className="flex items-center gap-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: SKILL_COLORS[index % SKILL_COLORS.length] }}
                  />
                  <span className="font-body text-body-sm text-on-surface-variant">
                    {s.skill} ({s.count})
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="bg-surface-container-lowest rounded-2xl p-lg shadow-card border border-outline-variant/10">
        <h2 className="font-headline text-headline-md text-on-surface mb-md">Experience Distribution</h2>

        {experience.every((b) => b.count === 0) ? (
          <p className="font-body text-body-sm text-on-surface-variant">No experience data yet.</p>
        ) : (
          <div className="space-y-sm">
            {experience.map((bucket) => {
              const percent = totalExperience > 0 ? Math.round((bucket.count / totalExperience) * 100) : 0
              return (
                <div key={bucket.range_label}>
                  <div className="flex justify-between font-body text-body-sm text-on-surface-variant mb-[2px]">
                    <span>{bucket.range_label}</span>
                    <span>{bucket.count} · {percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="bg-surface-container-lowest rounded-2xl p-lg shadow-card border border-outline-variant/10">
        <h2 className="font-headline text-headline-md text-on-surface mb-md">Resume Uploads</h2>

        {uploads.length === 0 ? (
          <p className="font-body text-body-sm text-on-surface-variant">No uploads yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={uploads}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#76777d' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#76777d' }} />
              <Tooltip />
              <Bar dataKey="count" fill="#712ae2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export default DashboardPage