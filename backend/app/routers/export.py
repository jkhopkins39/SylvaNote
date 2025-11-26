from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select
from ..database import get_session
from ..models import Person, Event, RelationshipEdge
from ..services.export import generate_zip

router = APIRouter(prefix="/export", tags=["export"])

@router.get("/", response_class=StreamingResponse)
def export_data(session: Session = Depends(get_session)):
    people = session.exec(select(Person)).all()
    events = session.exec(select(Event)).all()
    relationships = session.exec(select(RelationshipEdge)).all()
    
    zip_buffer = generate_zip(people, events, relationships)
    
    return StreamingResponse(
        zip_buffer, 
        media_type="application/zip", 
        headers={"Content-Disposition": "attachment; filename=sylvanote_export.zip"}
    )

