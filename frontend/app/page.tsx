"use client";

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import GraphView from './components/GraphView';
import { PersonForm } from './components/PersonForm';
import { SylvaGraph, Person, Relationship } from '@/src/core/types';

// Helper to create dummy person
const createPerson = (first: string, last: string, id: string = uuidv4()): Person => ({
  id,
  type: 'person',
  name: { first, last },
  tags: [],
});

// Helper to create dummy relationship
const createRel = (from: string, to: string, type: Relationship['type']): Relationship => ({
  id: uuidv4(),
  fromId: from,
  toId: to,
  type,
});

export default function Home() {
  // Initial Dummy Data
  const [data, setData] = useState<SylvaGraph>(() => {
    const p1 = createPerson("Arthur", "Weasley");
    const p2 = createPerson("Molly", "Weasley");
    const c1 = createPerson("Bill", "Weasley");
    const c2 = createPerson("Charlie", "Weasley");
    const c3 = createPerson("Percy", "Weasley");
    const c4 = createPerson("Fred", "Weasley");
    const c5 = createPerson("George", "Weasley");
    const c6 = createPerson("Ron", "Weasley");
    const c7 = createPerson("Ginny", "Weasley");

    const nodes: Record<string, Person> = {};
    [p1, p2, c1, c2, c3, c4, c5, c6, c7].forEach(p => nodes[p.id] = p);

    const edges: Relationship[] = [
      createRel(p1.id, p2.id, 'SPOUSE_OF'),
      // Arthur is parent of all
      createRel(p1.id, c1.id, 'PARENT_OF'),
      createRel(p1.id, c2.id, 'PARENT_OF'),
      createRel(p1.id, c3.id, 'PARENT_OF'),
      createRel(p1.id, c4.id, 'PARENT_OF'),
      createRel(p1.id, c5.id, 'PARENT_OF'),
      createRel(p1.id, c6.id, 'PARENT_OF'),
      createRel(p1.id, c7.id, 'PARENT_OF'),
      // Molly is parent of all
      createRel(p2.id, c1.id, 'PARENT_OF'),
      createRel(p2.id, c2.id, 'PARENT_OF'),
      createRel(p2.id, c3.id, 'PARENT_OF'),
      createRel(p2.id, c4.id, 'PARENT_OF'),
      createRel(p2.id, c5.id, 'PARENT_OF'),
      createRel(p2.id, c6.id, 'PARENT_OF'),
      createRel(p2.id, c7.id, 'PARENT_OF'),
    ];

    return { nodes, edges };
  });

  const [showForm, setShowForm] = useState(false);

  const handleAddPerson = (person: Person) => {
    setData(prev => ({
      ...prev,
      nodes: {
        ...prev.nodes,
        [person.id]: person
      }
    }));
    setShowForm(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="z-10 max-w-5xl w-full flex items-center justify-between font-mono text-sm mb-8">
        <h1 className="text-4xl font-bold">SylvaNote Prototype</h1>
        <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
            {showForm ? 'Close Form' : 'Add Person'}
        </button>
      </div>

      {/* Conditional Form Rendering */}
      {showForm && (
          <div className="w-full max-w-2xl mb-8">
              <PersonForm 
                onSubmit={handleAddPerson} 
                onCancel={() => setShowForm(false)} 
              />
          </div>
      )}

      <div className="w-full h-[600px] bg-white rounded-lg shadow-xl overflow-hidden text-black border border-gray-200">
        <GraphView data={data} />
      </div>

      <div className="mt-8 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
            Phase 1: Core{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Schemas and Serialization logic implemented.
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
            Phase 2: Graph{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            In-memory graph engine for traversals.
          </p>
        </div>
      </div>
    </main>
  );
}
