const API_BASE_URL = 'http://127.0.0.1:8000'

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` }
}

export async function generateInterviewQuestions(token, candidateId, jobDescriptionId) {
  const response = await fetch(`${API_BASE_URL}/interview-questions/generate`, {
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
    throw new Error(errorData.detail || 'Failed to generate questions')
  }

  return response.json()
}

export async function getQuestionsForCandidate(token, candidateId) {
  const response = await fetch(`${API_BASE_URL}/interview-questions/candidate/${candidateId}`, {
    headers: authHeaders(token)
  })

  if (!response.ok) throw new Error('Failed to load questions')
  return response.json()
}