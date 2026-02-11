import { useMemo } from 'react';
import { forceSimulation, forceCollide, forceX, forceY } from 'd3-force';

/**
 * Hook to detect and resolve collisions between edge labels
 * Uses D3-force simulation to adjust positions
 */
export const useEdgeLabelCollision = (labels, options = {}) => {
  const {
    iterations = 120,
    collisionPadding = 15,
    centerStrength = 0.3,
  } = options;

  const adjustedLabels = useMemo(() => {
    if (!labels || labels.length === 0) {
      return [];
    }

    // Create a copy of labels for the simulation
    const nodes = labels.map((label) => ({
      ...label,
      // Store original position
      originalX: label.x,
      originalY: label.y,
    }));

    // Create force simulation
    const simulation = forceSimulation(nodes)
      // Collision force - prevent overlaps
      .force(
        'collision',
        forceCollide()
          .radius((d) => {
            // Calculate radius based on box dimensions
            const maxDim = Math.max(d.width || 100, d.height || 60);
            return maxDim / 2 + collisionPadding;
          })
          .strength(1)
      )
      // X force - pull toward original X position
      .force(
        'x',
        forceX()
          .x((d) => d.originalX)
          .strength(centerStrength)
      )
      // Y force - pull toward original Y position
      .force(
        'y',
        forceY()
          .y((d) => d.originalY)
          .strength(centerStrength)
      )
      // Stop the simulation (we'll run it manually)
      .stop();

    // Run simulation for fixed number of iterations
    for (let i = 0; i < iterations; i++) {
      simulation.tick();
    }

    // Return adjusted positions
    return nodes.map((node) => ({
      id: node.id,
      x: node.x,
      y: node.y,
      originalX: node.originalX,
      originalY: node.originalY,
      moved: Math.abs(node.x - node.originalX) > 1 || Math.abs(node.y - node.originalY) > 1,
    }));
  }, [labels, iterations, collisionPadding, centerStrength]);

  return adjustedLabels;
};

/**
 * Simpler version for just two labels (request/response on same edge)
 */
export const adjustTwoLabels = (label1, label2, options = {}) => {
  const {
    minDistance = 80,
    iterations = 100,
  } = options;

  // Calculate current distance
  const dx = label2.x - label1.x;
  const dy = label2.y - label1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // If already far enough apart, no adjustment needed
  if (distance >= minDistance) {
    return {
      label1: { x: label1.x, y: label1.y },
      label2: { x: label2.x, y: label2.y },
    };
  }

  // Use D3 force simulation
  const nodes = [
    { id: 'label1', x: label1.x, y: label1.y, width: label1.width || 120, height: label1.height || 60 },
    { id: 'label2', x: label2.x, y: label2.y, width: label2.width || 120, height: label2.height || 60 },
  ];

  const simulation = forceSimulation(nodes)
    .force(
      'collision',
      forceCollide()
        .radius((d) => Math.max(d.width, d.height) / 2 + 10)
        .strength(1)
    )
    .force('x', forceX((d) => d.x).strength(0.1))
    .force('y', forceY((d) => d.y).strength(0.1))
    .stop();

  // Run simulation
  for (let i = 0; i < iterations; i++) {
    simulation.tick();
  }

  return {
    label1: { x: nodes[0].x, y: nodes[0].y },
    label2: { x: nodes[1].x, y: nodes[1].y },
  };
};
