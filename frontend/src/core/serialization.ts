import matter from 'gray-matter';
import { Person, PersonSchema, Event, EventSchema } from './types';
import { v4 as uuidv4 } from 'uuid';

// Generic wrapper for deserialization result
type ParseResult<T> = 
  | { success: true; data: T; content: string }
  | { success: false; error: unknown };

export const Serialization = {
  // --- Person ---

  serializePerson: (person: Person): string => {
    // We use the 'bio' field as the main markdown content (body).
    // All other fields go into frontmatter.
    const { bio, ...metadata } = person;
    
    // Ensure bio is undefined in frontmatter so it doesn't duplicate
    // matter.stringify(content, data)
    return matter.stringify(bio || '', metadata);
  },

  parsePerson: (markdown: string): ParseResult<Person> => {
    try {
      const { data, content } = matter(markdown);
      
      // The markdown body (content) is mapped to 'bio'
      const personData = {
        ...data,
        bio: content,
      };

      const result = PersonSchema.safeParse(personData);
      
      if (result.success) {
        return { success: true, data: result.data, content };
      } else {
        return { success: false, error: result.error };
      }
    } catch (e) {
      return { success: false, error: e };
    }
  },

  // --- Event ---

  serializeEvent: (event: Event): string => {
    const { description, ...metadata } = event;
    return matter.stringify(description || '', metadata);
  },

  parseEvent: (markdown: string): ParseResult<Event> => {
    try {
      const { data, content } = matter(markdown);
      const eventData = {
        ...data,
        description: content,
      };

      const result = EventSchema.safeParse(eventData);
      
      if (result.success) {
        return { success: true, data: result.data, content };
      } else {
        return { success: false, error: result.error };
      }
    } catch (e) {
      return { success: false, error: e };
    }
  },

  // --- Helpers ---
  generateId: (): string => uuidv4(),
};
