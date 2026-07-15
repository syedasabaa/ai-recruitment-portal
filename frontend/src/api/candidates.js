const API_BASE_URL = 'http://127.0.0.1:8000'

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` }
}

export async function listCandidates(token, filters = {}) {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params.append(key, value)
    }
  })

  const response = await fetch(`${API_BASE_URL}/candidates/?${params.toString()}`, {
    headers: authHeaders(token)
  })

  if (!response.ok) throw new Error('Failed to load candidates')
  return response.json()
}

export async function getCandidate(token, candidateId) {
  const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}`, {
    headers: authHeaders(token)
  })

  if (!response.ok) throw new Error('Failed to load candidate')
  return response.json()
}

export async function updateCandidate(token, candidateId, updates) {
  const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}`, {
    method: 'PUT',
    headers: {
      ...authHeaders(token),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || 'Failed to update candidate')
  }

  return response.json()
}

export async function deleteCandidate(token, candidateId) {
  const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}`, {
    method: 'DELETE',
    headers: authHeaders(token)
  })

  if (!response.ok) throw new Error('Failed to delete candidate')
}

export async function compareCandidates(token, candidateIds) {
  const response = await fetch(`${API_BASE_URL}/candidates/compare`, {
    method: 'POST',
    headers: {
      ...authHeaders(token),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ candidate_ids: candidateIds })
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || 'Comparison failed')
  }

  return response.json()
}