from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from uuid import UUID
from ..database import get_session
from ..models import Event
from ..schemas import EventBase

router = APIRouter(prefix="/events", tags=["events"])

def model_to_schema(event: Event) -> EventBase:
    return EventBase(
        id=event.id,
        createdAt=event.createdAt,
        updatedAt=event.updatedAt,
        tags=event.tags,
        title=event.title,
        date=event.date,
        description=event.description,
        location=event.location,
        participants=event.participants
    )

@router.post("/", response_model=EventBase)
def create_event(event_in: EventBase, session: Session = Depends(get_session)):
    event_db = Event(
        id=event_in.id,
        createdAt=event_in.createdAt,
        updatedAt=event_in.updatedAt,
        tags=event_in.tags,
        title=event_in.title,
        date=event_in.date,
        description=event_in.description,
        location=event_in.location,
        participants=event_in.participants
    )
    session.add(event_db)
    session.commit()
    session.refresh(event_db)
    return model_to_schema(event_db)

@router.get("/{event_id}", response_model=EventBase)
def read_event(event_id: UUID, session: Session = Depends(get_session)):
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return model_to_schema(event)

@router.get("/", response_model=List[EventBase])
def read_events(session: Session = Depends(get_session)):
    events = session.exec(select(Event)).all()
    return [model_to_schema(e) for e in events]

@router.put("/{event_id}", response_model=EventBase)
def update_event(event_id: UUID, event_in: EventBase, session: Session = Depends(get_session)):
    event_db = session.get(Event, event_id)
    if not event_db:
        raise HTTPException(status_code=404, detail="Event not found")
    
    event_db.title = event_in.title
    event_db.date = event_in.date
    event_db.description = event_in.description
    event_db.location = event_in.location
    event_db.participants = event_in.participants
    event_db.tags = event_in.tags
    
    session.add(event_db)
    session.commit()
    session.refresh(event_db)
    return model_to_schema(event_db)

@router.delete("/{event_id}")
def delete_event(event_id: UUID, session: Session = Depends(get_session)):
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    session.delete(event)
    session.commit()
    return {"ok": True}

