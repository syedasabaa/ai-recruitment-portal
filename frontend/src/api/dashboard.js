const API_BASE_URL = 'http://127.0.0.1:8000'

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`
  }
}

export async function getDashboardSummary(token) {
  const response = await fetch(`${API_BASE_URL}/dashboard/summary`, {
    headers: authHeaders(token)
  })
  if (!response.ok) throw new Error('Failed to load summary')
  return response.json()
}

export async function getSkillsDistribution(token) {
  const response = await fetch(`${API_BASE_URL}/dashboard/skills-distribution`, {
    headers: authHeaders(token)
  })
  if (!response.ok) throw new Error('Failed to load skills distribution')
  return response.json()
}

export async function getExperienceDistribution(token) {
  const response = await fetch(`${API_BASE_URL}/dashboard/experience-distribution`, {
    headers: authHeaders(token)
  })
  if (!response.ok) throw new Error('Failed to load experience distribution')
  return response.json()
}

export async function getUploadStats(token) {
  const response = await fetch(`${API_BASE_URL}/dashboard/upload-stats`, {
    headers: authHeaders(token)
  })
  if (!response.ok) throw new Error('Failed to load upload stats')
  return response.json()
}