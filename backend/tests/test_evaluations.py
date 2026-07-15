from unittest.mock import patch


FAKE_ANALYSIS = {
    "match_score": 82.5,
    "matching_skills": ["Python", "FastAPI"],
    "missing_skills": ["Kubernetes"],
    "experience_gap": "Meets required experience",
    "ai_recommendation": "Strong candidate for this role."
}


@patch("app.routers.evaluations.analyze_resume_match")
def test_analyze_candidate_creates_evaluation(mock_analyze, client, auth_headers, sample_candidate, sample_job):
    mock_analyze.return_value = FAKE_ANALYSIS

    response = client.post(
        "/evaluations/analyze",
        json={"candidate_id": sample_candidate.id, "job_description_id": sample_job.id},
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert data["match_score"] == 82.5
    assert "Python" in data["matching_skills"]
    assert data["candidate_id"] == sample_candidate.id


@patch("app.routers.evaluations.analyze_resume_match")
def test_analyze_nonexistent_candidate_returns_404(mock_analyze, client, auth_headers, sample_job):
    response = client.post(
        "/evaluations/analyze",
        json={"candidate_id": 9999, "job_description_id": sample_job.id},
        headers=auth_headers
    )
    assert response.status_code == 404


@patch("app.routers.evaluations.analyze_resume_match")
def test_update_evaluation_rating_partial_update(mock_analyze, client, auth_headers, sample_candidate, sample_job):
    mock_analyze.return_value = FAKE_ANALYSIS

    analyze_response = client.post(
        "/evaluations/analyze",
        json={"candidate_id": sample_candidate.id, "job_description_id": sample_job.id},
        headers=auth_headers
    )
    evaluation_id = analyze_response.json()["id"]

    rating_response = client.patch(
        f"/evaluations/{evaluation_id}/rating",
        json={"recruiter_rating": 8.5},
        headers=auth_headers
    )

    assert rating_response.status_code == 200
    data = rating_response.json()
    assert data["recruiter_rating"] == 8.5
    assert data["technical_rating"] is None