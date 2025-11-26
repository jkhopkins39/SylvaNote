import { 
  Person, 
  Event, 
  Relationship, 
  RelationshipType, 
  SylvaGraph 
} from './types';

export class GraphEngine {
  private persons: Map<string, Person> = new Map();
  private events: Map<string, Event> = new Map();
  // Store edges: key = id, value = Relationship
  private edges: Map<string, Relationship> = new Map();
  
  // Indices for fast lookups
  // personId -> outgoing edges []
  private outgoingEdges: Map<string, Relationship[]> = new Map();
  // personId -> incoming edges []
  private incomingEdges: Map<string, Relationship[]> = new Map();

  constructor(initialData?: SylvaGraph) {
    if (initialData) {
      this.importData(initialData);
    }
  }

  // --- Mutations ---

  addPerson(person: Person) {
    this.persons.set(person.id, person);
  }

  addEvent(event: Event) {
    this.events.set(event.id, event);
  }

  addRelationship(rel: Relationship) {
    this.edges.set(rel.id, rel);
    
    // Update indices
    const out = this.outgoingEdges.get(rel.fromId) || [];
    out.push(rel);
    this.outgoingEdges.set(rel.fromId, out);

    const inc = this.incomingEdges.get(rel.toId) || [];
    inc.push(rel);
    this.incomingEdges.set(rel.toId, inc);
  }

  // --- Queries ---

  getPerson(id: string): Person | undefined {
    return this.persons.get(id);
  }

  // Get all immediate family members
  getImmediateFamily(personId: string) {
    const parents = this.getParents(personId);
    const children = this.getChildren(personId);
    const spouses = this.getSpouses(personId);
    const siblings = this.getSiblings(personId); // Logic: share at least one parent

    return { parents, children, spouses, siblings };
  }

  getParents(childId: string): Person[] {
    // Parents are those who have a PARENT_OF edge pointing TO childId
    // relationship: from (parent) -> to (child)
    // So look at INCOMING edges to childId where type is PARENT_OF
    const incoming = this.incomingEdges.get(childId) || [];
    return incoming
      .filter(r => r.type === 'PARENT_OF' || r.type === 'ADOPTED_PARENT_OF')
      .map(r => this.persons.get(r.fromId)!)
      .filter(Boolean);
  }

  getChildren(parentId: string): Person[] {
    // Children are those who have a PARENT_OF edge pointing FROM parentId
    const outgoing = this.outgoingEdges.get(parentId) || [];
    return outgoing
      .filter(r => r.type === 'PARENT_OF' || r.type === 'ADOPTED_PARENT_OF')
      .map(r => this.persons.get(r.toId)!)
      .filter(Boolean);
  }

  getSpouses(personId: string): Person[] {
    // Spouses can be in either direction: A -> SPOUSE_OF -> B or B -> SPOUSE_OF -> A
    const outgoing = this.outgoingEdges.get(personId) || [];
    const incoming = this.incomingEdges.get(personId) || [];

    const spousesIds = new Set<string>();

    outgoing
      .filter(r => r.type === 'SPOUSE_OF')
      .forEach(r => spousesIds.add(r.toId));
    
    incoming
      .filter(r => r.type === 'SPOUSE_OF')
      .forEach(r => spousesIds.add(r.fromId));

    return Array.from(spousesIds)
      .map(id => this.persons.get(id)!)
      .filter(Boolean);
  }

  getSiblings(personId: string): Person[] {
    const parents = this.getParents(personId);
    if (parents.length === 0) return [];

    const siblingIds = new Set<string>();
    
    parents.forEach(parent => {
      const kids = this.getChildren(parent.id);
      kids.forEach(k => {
        if (k.id !== personId) siblingIds.add(k.id);
      });
    });

    return Array.from(siblingIds)
      .map(id => this.persons.get(id)!)
      .filter(Boolean);
  }

  // --- Graph Traversals ---

  // BFS for ancestors
  getAncestors(personId: string): Person[] {
    const ancestors = new Set<string>();
    const queue = [personId];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      if (currentId !== personId) {
        ancestors.add(currentId);
      }

      const parents = this.getParents(currentId);
      parents.forEach(p => queue.push(p.id));
    }

    return Array.from(ancestors)
      .map(id => this.persons.get(id)!)
      .filter(Boolean);
  }

  // --- Import/Export ---

  importData(data: SylvaGraph) {
    Object.values(data.nodes).forEach(node => {
      if (node.type === 'person') this.addPerson(node as Person);
      else if (node.type === 'event') this.addEvent(node as Event);
    });
    data.edges.forEach(edge => this.addRelationship(edge));
  }

  getAllNodes() {
    return Array.from(this.persons.values());
  }

  getAllEdges() {
    return Array.from(this.edges.values());
  }
}

