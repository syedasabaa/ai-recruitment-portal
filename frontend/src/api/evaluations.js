const API_BASE_URL = 'http://127.0.0.1:8000'

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` }
}

export async function analyzeCandidate(token, candidateId, jobDescriptionId) {
  const response = await fetch(`${API_BASE_URL}/evaluations/analyze`, {
    method: 'POST',
    headers: {
      ...authHeaders(token),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      candidate_id: candidateId,
      job_description_id: jobDescriptionId
    })
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || 'Analysis failed')
  }

  return response.json()
}

export async function updateEvaluationRating(token, evaluationId, ratings) {
  const response = await fetch(`${API_BASE_URL}/evaluations/${evaluationId}/rating`, {
    method: 'PATCH',
    headers: {
      ...authHeaders(token),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(ratings)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || 'Failed to save rating')
  }

  return response.json()
}