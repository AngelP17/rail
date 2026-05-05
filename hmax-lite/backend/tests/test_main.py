"""
HMAX-Lite Backend API Tests
============================

Basic smoke tests for the FastAPI backend endpoints.
Run with: pytest -v
"""

import pytest


def test_health_check(client):
    """Health endpoint returns 200 and expected fields."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "hmax-lite-backend"
    assert "timestamp" in data


def test_get_lines(client):
    """Lines endpoint returns all three metro lines."""
    response = client.get("/api/lines")
    assert response.status_code == 200
    data = response.json()
    assert "lines" in data
    assert len(data["lines"]) == 3
    line_ids = {line["id"] for line in data["lines"]}
    assert line_ids == {"line1", "line2", "line3"}


def test_get_stations(client):
    """Stations endpoint returns station list."""
    response = client.get("/api/stations")
    assert response.status_code == 200
    data = response.json()
    assert "all_stations" in data
    assert len(data["all_stations"]) > 0


def test_get_trains(client):
    """Trains endpoint returns active train statuses."""
    response = client.get("/api/trains")
    assert response.status_code == 200
    data = response.json()
    assert "trains" in data
    assert len(data["trains"]) > 0
    # Verify expected fields on first train
    train = data["trains"][0]
    assert "id" in train
    assert "line" in train
    assert "telemetry" in train
    assert "speed_kmh" in train["telemetry"]


def test_get_train_by_id(client):
    """Single train endpoint returns specific train data."""
    # First get a valid train ID
    all_trains = client.get("/api/trains").json()
    train_id = all_trains["trains"][0]["id"]

    response = client.get(f"/api/trains/{train_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == train_id


def test_get_train_not_found(client):
    """Requesting a non-existent train returns 404."""
    response = client.get("/api/trains/NONEXISTENT")
    assert response.status_code == 404


def test_get_line_stations(client):
    """Line-specific stations endpoint returns correct line data."""
    response = client.get("/api/lines/line3/stations")
    assert response.status_code == 200
    data = response.json()
    assert "line" in data
    assert data["line"]["id"] == "line3"
    assert "stations" in data
    assert len(data["stations"]) > 0


def test_get_line_stations_not_found(client):
    """Requesting stations for a non-existent line returns 404."""
    response = client.get("/api/lines/line99/stations")
    assert response.status_code == 404
