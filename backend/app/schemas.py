from typing import List, Optional, Dict, Union, Literal
from enum import Enum
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field

# --- Enums ---

class RelationshipType(str, Enum):
    PARENT_OF = 'PARENT_OF'
    SPOUSE_OF = 'SPOUSE_OF'
    ADOPTED_PARENT_OF = 'ADOPTED_PARENT_OF'
    DIVORCED_SPOUSE_OF = 'DIVORCED_SPOUSE_OF'

# --- Schemas ---

class BaseNode(BaseModel):
    id: UUID
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    tags: List[str] = []

class PersonName(BaseModel):
    first: str
    middle: Optional[str] = None
    last: str
    maiden: Optional[str] = None
    nickname: Optional[str] = None

class PersonBase(BaseNode):
    type: Literal['person'] = 'person'
    name: PersonName
    birthDate: Optional[str] = None
    deathDate: Optional[str] = None
    gender: Optional[str] = None
    bio: Optional[str] = None
    attributes: Optional[Dict[str, Union[str, List[str]]]] = None

class EventBase(BaseNode):
    type: Literal['event'] = 'event'
    title: str
    date: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    participants: List[UUID] = []

class RelationshipBase(BaseModel):
    id: UUID
    fromId: UUID
    toId: UUID
    type: RelationshipType
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    notes: Optional[str] = None

class SylvaGraph(BaseModel):
    nodes: Dict[str, Union[PersonBase, EventBase]]
    edges: List[RelationshipBase]

