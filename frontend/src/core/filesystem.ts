import { promises as fs } from 'fs';
import path from 'path';
import { Serialization } from './serialization';
import { SylvaGraph, Person, Event, Relationship, RelationshipSchema } from './types';
import { GraphEngine } from './graph';

export class FileSystemAdapter {
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  private getPeoplePath() { return path.join(this.basePath, 'people'); }
  private getEventsPath() { return path.join(this.basePath, 'events'); }
  private getRelationshipsPath() { return path.join(this.basePath, 'relationships.json'); }

  async initialize() {
    await fs.mkdir(this.basePath, { recursive: true });
    await fs.mkdir(this.getPeoplePath(), { recursive: true });
    await fs.mkdir(this.getEventsPath(), { recursive: true });
  }

  // --- Load All Data ---
  async loadGraph(): Promise<SylvaGraph> {
    const nodes: Record<string, Person | Event> = {};
    
    // Load People
    try {
      const personFiles = await fs.readdir(this.getPeoplePath());
      for (const file of personFiles) {
        if (!file.endsWith('.md')) continue;
        const content = await fs.readFile(path.join(this.getPeoplePath(), file), 'utf-8');
        const result = Serialization.parsePerson(content);
        if (result.success) {
          nodes[result.data.id] = result.data;
        } else {
          console.error(`Failed to parse person ${file}:`, result.error);
        }
      }
    } catch (e) {
        console.warn("No people directory found or empty.");
    }

    // Load Events
    try {
        const eventFiles = await fs.readdir(this.getEventsPath());
        for (const file of eventFiles) {
          if (!file.endsWith('.md')) continue;
          const content = await fs.readFile(path.join(this.getEventsPath(), file), 'utf-8');
          const result = Serialization.parseEvent(content);
          if (result.success) {
            nodes[result.data.id] = result.data;
          } else {
            console.error(`Failed to parse event ${file}:`, result.error);
          }
        }
    } catch (e) {
        console.warn("No events directory found or empty.");
    }

    // Load Relationships
    let edges: Relationship[] = [];
    try {
      const edgesData = await fs.readFile(this.getRelationshipsPath(), 'utf-8');
      const json = JSON.parse(edgesData);
      if (Array.isArray(json)) {
          // Validate each edge
          edges = json.map(e => {
              const parse = RelationshipSchema.safeParse(e);
              return parse.success ? parse.data : null;
          }).filter(Boolean) as Relationship[];
      }
    } catch (e) {
      // If file doesn't exist, that's fine, we start empty
    }

    return { nodes, edges };
  }

  // --- Save Operations ---

  async savePerson(person: Person) {
    const markdown = Serialization.serializePerson(person);
    // Use name or ID for filename. ID is safer for uniqueness.
    // We could append name for readability: "ID_Name.md"
    const filename = `${person.id}.md`;
    await fs.writeFile(path.join(this.getPeoplePath(), filename), markdown, 'utf-8');
  }

  async saveEvent(event: Event) {
    const markdown = Serialization.serializeEvent(event);
    const filename = `${event.id}.md`;
    await fs.writeFile(path.join(this.getEventsPath(), filename), markdown, 'utf-8');
  }

  async saveRelationships(edges: Relationship[]) {
    await fs.writeFile(
        this.getRelationshipsPath(), 
        JSON.stringify(edges, null, 2), 
        'utf-8'
    );
  }
}

