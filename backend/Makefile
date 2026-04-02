.PHONY: help install migrate run test clean docker-build docker-up docker-down

# macOS 등에서는 `python` 이 없고 `python3` 만 있는 경우가 많음 — override 가능: make PYTHON=./venv/bin/python import-seed
PYTHON ?= python3

help:
	@echo "AI Career Path Backend - Available Commands"
	@echo ""
	@echo "Development:"
	@echo "  make install        - Install dependencies"
	@echo "  make migrate        - Run database migrations"
	@echo "  make run            - Run development server"
	@echo "  make superuser      - Create superuser"
	@echo "  make shell          - Open Django shell"
	@echo ""
	@echo "Data Import:"
	@echo "  make import-riasec  - Import RIASEC reports"
	@echo "  make import-quiz    - Import quiz questions"
	@echo "  make import-jobs    - Import jobs data (legacy frontend paths)"
	@echo "  make import-seed    - Build + import explore + career path seed JSON"
	@echo "                        (uses python3; venv: make import-seed PYTHON=./venv/bin/python)"
	@echo "  make openapi-export - OpenAPI 3 JSON → postman/openapi.json (Postman Import)"
	@echo ""
	@echo "Testing:"
	@echo "  make test           - Run tests"
	@echo "  make lint           - Run linters"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-build   - Build Docker images"
	@echo "  make docker-up      - Start Docker containers"
	@echo "  make docker-down    - Stop Docker containers"
	@echo "  make docker-logs    - View Docker logs"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean          - Remove cache and build files"

install:
	pip install --upgrade pip
	pip install -r requirements/local.txt

migrate:
	$(PYTHON) manage.py makemigrations
	$(PYTHON) manage.py migrate

run:
	$(PYTHON) manage.py runserver

superuser:
	$(PYTHON) manage.py createsuperuser

shell:
	$(PYTHON) manage.py shell_plus

import-riasec:
	$(PYTHON) manage.py import_riasec_reports

import-quiz:
	$(PYTHON) manage.py import_quiz_questions --json-path ../frontend/data/quiz-questions.json

import-jobs:
	$(PYTHON) manage.py import_job_categories --json-path ../frontend/data/kingdoms.json
	$(PYTHON) manage.py import_jobs --json-path ../frontend/data/jobs.json
	$(PYTHON) manage.py import_job_details --json-path ../frontend/data/job-career-routes.json

import-seed:
	$(PYTHON) scripts/build_seed_data.py
	$(PYTHON) manage.py import_job_categories --json-path data/seed/kingdoms.json
	$(PYTHON) manage.py import_jobs --json-path data/seed/jobs.json
	$(PYTHON) manage.py import_job_details --json-path data/seed/job_career_routes.json
	$(PYTHON) manage.py import_career_path_templates --json-path data/seed/career_path_templates.json

openapi-export:
	@mkdir -p postman
	$(PYTHON) manage.py spectacular --format openapi-json --file postman/openapi.json
	@echo "Wrote postman/openapi.json — Postman: Import → 파일 선택 또는 Raw OpenAPI"

test:
	pytest

lint:
	black --check .
	flake8 .
	isort --check-only .

format:
	black .
	isort .

docker-build:
	docker-compose build

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f django

docker-migrate:
	docker-compose exec django python manage.py migrate

docker-superuser:
	docker-compose exec django python manage.py createsuperuser

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.log" -delete
	rm -rf .pytest_cache
	rm -rf .coverage
	rm -rf htmlcov
	rm -rf dist
	rm -rf build
	rm -rf *.egg-info
