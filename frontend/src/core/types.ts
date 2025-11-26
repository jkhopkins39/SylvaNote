import { z } from 'zod';

// --- Enums ---

export const RelationshipType = z.enum([
  'PARENT_OF',
  'SPOUSE_OF',
  'ADOPTED_PARENT_OF',
  'DIVORCED_SPOUSE_OF', // Important for history
]);
export type RelationshipType = z.infer<typeof RelationshipType>;

// --- Schemas ---

// 1. Base Node Schema
const BaseNodeSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  tags: z.array(z.string()).default([]),
});

// 2. Person Schema
export const PersonSchema = BaseNodeSchema.extend({
  type: z.literal('person').default('person'),
  name: z.object({
    first: z.string(),
    middle: z.string().optional(),
    last: z.string(),
    maiden: z.string().optional(),
    nickname: z.string().optional(),
  }),
  birthDate: z.string().optional(), // ISO Date string or flexible format
  deathDate: z.string().optional(),
  gender: z.string().optional(),
  bio: z.string().optional(),
  // "Bubbles" as flexible attributes
  attributes: z.record(z.string(), z.union([z.string(), z.array(z.string())])).optional(), 
});

export type Person = z.infer<typeof PersonSchema>;

// 3. Event Schema
export const EventSchema = BaseNodeSchema.extend({
  type: z.literal('event').default('event'),
  title: z.string(),
  date: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  participants: z.array(z.string().uuid()).default([]), // List of Person IDs
});

export type Event = z.infer<typeof EventSchema>;

// 4. Relationship (Edge) Schema
// Note: In a file-based system, these might be stored in the "From" person's file
// or in a central "edges.json". For now, defining the structure.
export const RelationshipSchema = z.object({
  id: z.string().uuid(),
  fromId: z.string().uuid(),
  toId: z.string().uuid(),
  type: RelationshipType,
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

export type Relationship = z.infer<typeof RelationshipSchema>;

// 5. File/Graph container
export const SylvaGraphSchema = z.object({
  nodes: z.record(z.string(), z.union([PersonSchema, EventSchema])),
  edges: z.array(RelationshipSchema),
});

export type SylvaGraph = z.infer<typeof SylvaGraphSchema>;

