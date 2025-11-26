from sqlmodel import SQLModel, create_engine, Session
import os

sqlite_file_name = os.getenv("DATABASE_URL", "database.db")
if sqlite_file_name.startswith("sqlite:///"):
    sqlite_url = sqlite_file_name
else:
    sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, echo=True, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

