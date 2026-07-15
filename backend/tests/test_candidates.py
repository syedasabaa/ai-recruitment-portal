def test_list_candidates_empty(client, auth_headers):
    response = client.get("/candidates/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["candidates"] == []


def test_get_candidate_detail(client, auth_headers, sample_candidate):
    response = client.get(f"/candidates/{sample_candidate.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Ahmed Khalid"
    assert data["skills"] == "Python, FastAPI, PostgreSQL"


def test_get_nonexistent_candidate_returns_404(client, auth_headers):
    response = client.get("/candidates/9999", headers=auth_headers)
    assert response.status_code == 404


def test_update_candidate_status(client, auth_headers, sample_candidate):
    response = client.put(
        f"/candidates/{sample_candidate.id}",
        json={"status": "shortlisted"},
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["status"] == "shortlisted"


def test_update_candidate_partial_preserves_other_fields(client, auth_headers, sample_candidate):
    response = client.put(
        f"/candidates/{sample_candidate.id}",
        json={"status": "rejected"},
        headers=auth_headers
    )
    data = response.json()
    assert data["status"] == "rejected"
    assert data["name"] == "Ahmed Khalid"


def test_delete_candidate(client, auth_headers, sample_candidate):
    response = client.delete(f"/candidates/{sample_candidate.id}", headers=auth_headers)
    assert response.status_code == 204

    follow_up = client.get(f"/candidates/{sample_candidate.id}", headers=auth_headers)
    assert follow_up.status_code == 404


def test_candidates_require_authentication(client):
    response = client.get("/candidates/")
    assert response.status_code in (401, 403)