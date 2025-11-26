from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from ..database import get_session
from ..models import Person, Event, RelationshipEdge
from ..schemas import SylvaGraph
from .people import model_to_schema as person_to_schema
from .events import model_to_schema as event_to_schema
from .relationships import model_to_schema as rel_to_schema

router = APIRouter(prefix="/graph", tags=["graph"])

@router.get("/", response_model=SylvaGraph)
def get_graph(session: Session = Depends(get_session)):
    people = session.exec(select(Person)).all()
    events = session.exec(select(Event)).all()
    relationships = session.exec(select(RelationshipEdge)).all()
    
    nodes = {}
    for p in people:
        nodes[str(p.id)] = person_to_schema(p)
    for e in events:
        nodes[str(e.id)] = event_to_schema(e)
        
    edges = [rel_to_schema(r) for r in relationships]
    
    return SylvaGraph(nodes=nodes, edges=edges)

