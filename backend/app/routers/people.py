from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from uuid import UUID
from ..database import get_session
from ..models import Person
from ..schemas import PersonBase, PersonName

router = APIRouter(prefix="/people", tags=["people"])

def model_to_schema(person: Person) -> PersonBase:
    return PersonBase(
        id=person.id,
        createdAt=person.createdAt,
        updatedAt=person.updatedAt,
        tags=person.tags,
        name=PersonName(
            first=person.first_name,
            middle=person.middle_name,
            last=person.last_name,
            maiden=person.maiden_name,
            nickname=person.nickname
        ),
        birthDate=person.birthDate,
        deathDate=person.deathDate,
        gender=person.gender,
        bio=person.bio,
        attributes=person.attributes
    )

@router.post("/", response_model=PersonBase)
def create_person(person_in: PersonBase, session: Session = Depends(get_session)):
    person_db = Person(
        id=person_in.id,
        createdAt=person_in.createdAt,
        updatedAt=person_in.updatedAt,
        tags=person_in.tags,
        first_name=person_in.name.first,
        middle_name=person_in.name.middle,
        last_name=person_in.name.last,
        maiden_name=person_in.name.maiden,
        nickname=person_in.name.nickname,
        birthDate=person_in.birthDate,
        deathDate=person_in.deathDate,
        gender=person_in.gender,
        bio=person_in.bio,
        attributes=person_in.attributes or {}
    )
    session.add(person_db)
    session.commit()
    session.refresh(person_db)
    return model_to_schema(person_db)

@router.get("/{person_id}", response_model=PersonBase)
def read_person(person_id: UUID, session: Session = Depends(get_session)):
    person = session.get(Person, person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    return model_to_schema(person)

@router.get("/", response_model=List[PersonBase])
def read_people(session: Session = Depends(get_session)):
    people = session.exec(select(Person)).all()
    return [model_to_schema(p) for p in people]

@router.put("/{person_id}", response_model=PersonBase)
def update_person(person_id: UUID, person_in: PersonBase, session: Session = Depends(get_session)):
    person_db = session.get(Person, person_id)
    if not person_db:
        raise HTTPException(status_code=404, detail="Person not found")
    
    person_db.first_name = person_in.name.first
    person_db.middle_name = person_in.name.middle
    person_db.last_name = person_in.name.last
    person_db.maiden_name = person_in.name.maiden
    person_db.nickname = person_in.name.nickname
    person_db.birthDate = person_in.birthDate
    person_db.deathDate = person_in.deathDate
    person_db.gender = person_in.gender
    person_db.bio = person_in.bio
    person_db.attributes = person_in.attributes or {}
    person_db.tags = person_in.tags
    
    session.add(person_db)
    session.commit()
    session.refresh(person_db)
    return model_to_schema(person_db)

@router.delete("/{person_id}")
def delete_person(person_id: UUID, session: Session = Depends(get_session)):
    person = session.get(Person, person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    session.delete(person)
    session.commit()
    return {"ok": True}

