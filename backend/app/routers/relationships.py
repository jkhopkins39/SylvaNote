from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from uuid import UUID
from ..database import get_session
from ..models import RelationshipEdge
from ..schemas import RelationshipBase

router = APIRouter(prefix="/relationships", tags=["relationships"])

def model_to_schema(rel: RelationshipEdge) -> RelationshipBase:
    return RelationshipBase(
        id=rel.id,
        fromId=rel.fromId,
        toId=rel.toId,
        type=rel.type,
        startDate=rel.startDate,
        endDate=rel.endDate,
        notes=rel.notes
    )

@router.post("/", response_model=RelationshipBase)
def create_relationship(rel_in: RelationshipBase, session: Session = Depends(get_session)):
    rel_db = RelationshipEdge(
        id=rel_in.id,
        fromId=rel_in.fromId,
        toId=rel_in.toId,
        type=rel_in.type,
        startDate=rel_in.startDate,
        endDate=rel_in.endDate,
        notes=rel_in.notes
    )
    session.add(rel_db)
    session.commit()
    session.refresh(rel_db)
    return model_to_schema(rel_db)

@router.get("/{rel_id}", response_model=RelationshipBase)
def read_relationship(rel_id: UUID, session: Session = Depends(get_session)):
    rel = session.get(RelationshipEdge, rel_id)
    if not rel:
        raise HTTPException(status_code=404, detail="Relationship not found")
    return model_to_schema(rel)

@router.get("/", response_model=List[RelationshipBase])
def read_relationships(session: Session = Depends(get_session)):
    rels = session.exec(select(RelationshipEdge)).all()
    return [model_to_schema(r) for r in rels]

@router.put("/{rel_id}", response_model=RelationshipBase)
def update_relationship(rel_id: UUID, rel_in: RelationshipBase, session: Session = Depends(get_session)):
    rel_db = session.get(RelationshipEdge, rel_id)
    if not rel_db:
        raise HTTPException(status_code=404, detail="Relationship not found")
    
    rel_db.fromId = rel_in.fromId
    rel_db.toId = rel_in.toId
    rel_db.type = rel_in.type
    rel_db.startDate = rel_in.startDate
    rel_db.endDate = rel_in.endDate
    rel_db.notes = rel_in.notes
    
    session.add(rel_db)
    session.commit()
    session.refresh(rel_db)
    return model_to_schema(rel_db)

@router.delete("/{rel_id}")
def delete_relationship(rel_id: UUID, session: Session = Depends(get_session)):
    rel = session.get(RelationshipEdge, rel_id)
    if not rel:
        raise HTTPException(status_code=404, detail="Relationship not found")
    session.delete(rel)
    session.commit()
    return {"ok": True}

