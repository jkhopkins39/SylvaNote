from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import create_db_and_tables
from .routers import people, events, relationships, graph, export

app = FastAPI(title="SylvaNote Backend")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

app.include_router(people.router)
app.include_router(events.router)
app.include_router(relationships.router)
app.include_router(graph.router)
app.include_router(export.router)

@app.get("/")
def root():
    return {"message": "Welcome to SylvaNote API"}

