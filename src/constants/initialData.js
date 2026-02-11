export const initialNodes = [
  {
    id: '1',
    type: 'platform',
    position: { x: 100, y: 100 },
    data: {
      name: 'Frontend App',
      color: '#3b82f6',
      attributes: [
        { id: 'attr1', key: 'Framework', value: 'React' },
        { id: 'attr2', key: 'Port', value: '3000' },
      ],
    },
  },
  {
    id: '2',
    type: 'platform',
    position: { x: 500, y: 100 },
    data: {
      name: 'API Gateway',
      color: '#8b5cf6',
      attributes: [
        { id: 'attr3', key: 'Type', value: 'REST' },
        { id: 'attr4', key: 'Auth', value: 'JWT' },
      ],
    },
  },
  {
    id: '3',
    type: 'platform',
    position: { x: 500, y: 350 },
    data: {
      name: 'PostgreSQL',
      color: '#22c55e',
      attributes: [
        { id: 'attr5', key: 'Type', value: 'Database' },
        { id: 'attr6', key: 'Port', value: '5432' },
      ],
    },
  },
];

export const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    label: 'HTTP/REST',
    animated: true,
    type: 'smoothstep',
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    label: 'SQL Queries',
    animated: false,
    type: 'smoothstep',
  },
];
