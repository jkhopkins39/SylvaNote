import yaml
import io
import zipfile
from typing import List
from ..models import Person, Event, RelationshipEdge
from ..routers.people import model_to_schema as person_to_schema
from ..routers.events import model_to_schema as event_to_schema
from ..routers.relationships import model_to_schema as rel_to_schema

def person_to_markdown(person: Person) -> str:
    schema = person_to_schema(person)
    data = schema.model_dump(exclude={'bio'})
    # Clean up None values for cleaner YAML if desired, but keeping them is fine too.
    # Convert enums/UUIDs to strings if needed (Pydantic .dict()/.model_dump() usually handles basic types well, but UUIDs might remain UUID objects)
    # yaml.dump handles basic types, but we might need to ensure string UUIDs.
    
    data_clean = normalize_for_yaml(data)
    
    frontmatter = yaml.dump(data_clean, sort_keys=False)
    content = person.bio or ""
    
    return f"---\n{frontmatter}---\n{content}"

def event_to_markdown(event: Event) -> str:
    schema = event_to_schema(event)
    data = schema.model_dump(exclude={'description'})
    data_clean = normalize_for_yaml(data)
    
    frontmatter = yaml.dump(data_clean, sort_keys=False)
    content = event.description or ""
    
    return f"---\n{frontmatter}---\n{content}"

def normalize_for_yaml(data):
    """Recursively convert UUIDs and Enums to strings for YAML serialization"""
    if isinstance(data, dict):
        return {k: normalize_for_yaml(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [normalize_for_yaml(v) for v in data]
    elif hasattr(data, 'hex'):  # UUID
        return str(data)
    elif hasattr(data, 'value'): # Enum
        return data.value
    else:
        return data

def generate_zip(people: List[Person], events: List[Event], relationships: List[RelationshipEdge]) -> io.BytesIO:
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        # Add people
        for p in people:
            md = person_to_markdown(p)
            filename = f"people/{p.id}.md"
            zip_file.writestr(filename, md)
            
        # Add events
        for e in events:
            md = event_to_markdown(e)
            filename = f"events/{e.id}.md"
            zip_file.writestr(filename, md)
            
        # Add relationships
        import json
        rels_data = [rel_to_schema(r).model_dump(mode='json') for r in relationships]
        zip_file.writestr("relationships.json", json.dumps(rels_data, indent=2))
        
    zip_buffer.seek(0)
    return zip_buffer

