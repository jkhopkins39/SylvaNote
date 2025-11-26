# Infrastructure Setup

This project is containerized using Docker and Docker Compose.

## Prerequisites

- Docker Desktop
- Docker Compose

## Running the Project

1. **Build and Start Containers:**
   ```bash
   docker-compose up --build
   ```

2. **Access the Applications:**
   - **Frontend:** http://localhost:3000
   - **Backend API:** http://localhost:8000
   - **API Docs:** http://localhost:8000/docs

## Data Persistence

Data is stored in the `./data` directory on your host machine, which is mounted to `/data` inside the containers.
- **Database:** `database.db` (SQLite)
- **Markdown Files:** (Future implementation will store people/events here)

## Environment Variables

Configuration is managed via environment variables in `docker-compose.yml`.
See `example.env` for reference values.

