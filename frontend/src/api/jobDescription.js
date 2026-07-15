const API_BASE_URL = 'http://127.0.0.1:8000'

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` }
}

export async function listJobDescriptions(token) {
  const response = await fetch(`${API_BASE_URL}/job-descriptions/`, {
    headers: authHeaders(token)
  })

  if (!response.ok) throw new Error('Failed to load job descriptions')
  return response.json()
}

export async function createJobDescription(token, jobData) {
  const response = await fetch(`${API_BASE_URL}/job-descriptions/`, {
    method: 'POST',
    headers: {
      ...authHeaders(token),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(jobData)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || 'Failed to create job description')
  }

  return response.json()
}