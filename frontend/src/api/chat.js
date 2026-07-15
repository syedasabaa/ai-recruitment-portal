const API_BASE_URL = 'http://127.0.0.1:8000'

export async function sendChatMessage(token, message) {
  const response = await fetch(`${API_BASE_URL}/chat/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message })
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || 'Chat request failed')
  }

  return response.json()
}