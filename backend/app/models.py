from typing import List, Optional, Dict, Union
from uuid import UUID, uuid4
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON
from .schemas import RelationshipType

class Person(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    createdAt: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Name fields flattened
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    maiden_name: Optional[str] = None
    nickname: Optional[str] = None
    
    birthDate: Optional[str] = None
    deathDate: Optional[str] = None
    gender: Optional[str] = None
    bio: Optional[str] = None
    
    # JSON fields
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    attributes: Dict[str, Union[str, List[str]]] = Field(default_factory=dict, sa_column=Column(JSON))

class Event(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    createdAt: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    title: str
    date: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    participants: List[UUID] = Field(default_factory=list, sa_column=Column(JSON))

class RelationshipEdge(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    fromId: UUID = Field(index=True)
    toId: UUID = Field(index=True)
    type: RelationshipType
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    notes: Optional[str] = None

