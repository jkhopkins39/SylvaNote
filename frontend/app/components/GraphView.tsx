"use client";

import React, { useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { Person, Relationship, SylvaGraph } from '@/src/core/types';

// --- Layout Helper ---
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const PERSON_NODE_WIDTH = 172;
const PERSON_NODE_HEIGHT = 36;
const UNION_NODE_SIZE = 20;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    if (node.type === 'union') {
        dagreGraph.setNode(node.id, { width: UNION_NODE_SIZE, height: UNION_NODE_SIZE });
    } else {
        dagreGraph.setNode(node.id, { width: PERSON_NODE_WIDTH, height: PERSON_NODE_HEIGHT });
    }
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = direction === 'LR' ? Position.Left : Position.Top;
    node.sourcePosition = direction === 'LR' ? Position.Right : Position.Bottom;

    const width = node.type === 'union' ? UNION_NODE_SIZE : PERSON_NODE_WIDTH;
    const height = node.type === 'union' ? UNION_NODE_SIZE : PERSON_NODE_HEIGHT;

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - width / 2,
      y: nodeWithPosition.y - height / 2,
    };
  });

  return { nodes, edges };
};

// --- Component ---

interface GraphViewProps {
  data: SylvaGraph;
}

export default function GraphView({ data }: GraphViewProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!data || !data.nodes || !data.edges) {
        return { nodes: [], edges: [] };
    }
    
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // 1. Convert Persons to Nodes
    Object.values(data.nodes).forEach((node) => {
        if (node.type === 'person') {
            const p = node as Person;
            nodes.push({
                id: p.id,
                data: { label: `${p.name.first} ${p.name.last}` },
                position: { x: 0, y: 0 }, // Set by dagre
            });
        }
    });

    // 2. Analyze Relationships to Find Parent Groups
    // Map: childId -> Set of parentIds
    const childToParents: Record<string, Set<string>> = {};
    
    // Map to track which spouse relationships we should hide (if they are part of a union)
    const unitedParents = new Set<string>();

    data.edges.forEach((rel) => {
        if (rel.type === 'PARENT_OF' || rel.type === 'ADOPTED_PARENT_OF') {
            if (!childToParents[rel.toId]) {
                childToParents[rel.toId] = new Set();
            }
            childToParents[rel.toId].add(rel.fromId);
        }
    });

    // 3. Create Union Nodes and Edges
    // We group children by their specific *set* of parents.
    // key: sorted parent IDs string, value: list of children IDs
    const parentSetToChildren: Record<string, string[]> = {};

    Object.entries(childToParents).forEach(([childId, parentSet]) => {
        const parents = Array.from(parentSet).sort();
        if (parents.length > 1) {
            const key = parents.join('|');
            if (!parentSetToChildren[key]) {
                parentSetToChildren[key] = [];
            }
            parentSetToChildren[key].push(childId);
            
            // Mark these parents as united so we might treat their direct spouse edge differently
            parents.forEach(p => unitedParents.add(p));
        } else {
            // Single parent case - add direct edge immediately
            const parentId = parents[0];
            edges.push({
                id: `edge-${parentId}-${childId}`,
                source: parentId,
                target: childId,
                animated: true,
            });
        }
    });

    // Generate Unions
    Object.entries(parentSetToChildren).forEach(([key, childrenIds]) => {
        const parents = key.split('|');
        const unionId = `union-${key}`;

        // Create Union Node
        nodes.push({
            id: unionId,
            type: 'union', // Custom type or just use default with styling
            data: { label: '' }, // Empty label for dot
            position: { x: 0, y: 0 },
            style: { 
                width: UNION_NODE_SIZE, 
                height: UNION_NODE_SIZE, 
                borderRadius: '50%', 
                backgroundColor: '#555',
                border: 'none'
            },
        });

        // Edges: Parents -> Union
        parents.forEach(parentId => {
            edges.push({
                id: `edge-${parentId}-${unionId}`,
                source: parentId,
                target: unionId,
                animated: false,
                style: { stroke: '#555' },
            });
        });

        // Edges: Union -> Children
        childrenIds.forEach(childId => {
            edges.push({
                id: `edge-${unionId}-${childId}`,
                source: unionId,
                target: childId,
                animated: true,
            });
        });
    });

    // 4. Add Spouse Relationships
    // We only add SPOUSE_OF edges if they are NOT "united" parents (to reduce clutter),
    // OR we can add them but make them different.
    // User requested: "Hide to reduce clutter" for parents moving as one entity.
    
    // However, we need to be careful. If A and B are spouses but have NO children,
    // we MUST show the edge. If they have children (and thus a union node),
    // the union node visually connects them effectively.
    
    // Let's check if a pair is fully "covered" by a union.
    // A union covers a specific pair.
    // But 'unitedParents' is just a set of individuals.
    // We need to check the specific pair.

    const unionPairs = new Set<string>();
    Object.keys(parentSetToChildren).forEach(key => unionPairs.add(key));

    data.edges.forEach((rel) => {
        if (rel.type === 'SPOUSE_OF') {
            const pair = [rel.fromId, rel.toId].sort().join('|');
            if (!unionPairs.has(pair)) {
                edges.push({
                    id: rel.id,
                    source: rel.fromId,
                    target: rel.toId,
                    label: 'Married',
                    animated: false,
                    style: { strokeDasharray: '5,5' },
                });
            }
        }
    });

    return getLayoutedElements(nodes, edges);
  }, [data]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update layout if data changes (optional, simplified for now)
  useEffect(() => {
      // Only run layout if we actually have nodes/edges
      if (initialNodes.length === 0 && initialEdges.length === 0) {
        setNodes([]);
        setEdges([]);
        return;
      }
      
      const layouted = getLayoutedElements(initialNodes, initialEdges);
      setNodes(layouted.nodes);
      setEdges(layouted.edges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);


  return (
    <div style={{ width: '100%', height: '600px', border: '1px solid #ccc' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
