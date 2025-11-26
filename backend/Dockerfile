FROM python:3.11-slim

WORKDIR /app

# Install system dependencies if needed (e.g. for building some python packages)
# RUN apt-get update && apt-get install -y gcc

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

