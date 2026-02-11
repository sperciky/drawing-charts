// Generate a unique ID
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Generate a unique node ID
export const generateNodeId = (nodes) => {
  const maxId = nodes.reduce((max, node) => {
    const id = parseInt(node.id);
    return isNaN(id) ? max : Math.max(max, id);
  }, 0);
  return (maxId + 1).toString();
};

// Generate a unique edge ID
export const generateEdgeId = (source, target) => {
  return `e${source}-${target}`;
};

// Get node dimensions
export const getNodeDimensions = (node) => {
  const baseHeight = 120;
  const attributeHeight = 28;
  const padding = 40;

  const attributeCount = node.data?.attributes?.length || 0;
  const height = baseHeight + (attributeCount * attributeHeight) + padding;

  return {
    width: 250,
    height: Math.max(height, 150),
  };
};

// Check if two rectangles overlap
export const checkOverlap = (rect1, rect2, padding = 20) => {
  return !(
    rect1.x + rect1.width + padding < rect2.x ||
    rect2.x + rect2.width + padding < rect1.x ||
    rect1.y + rect1.height + padding < rect2.y ||
    rect2.y + rect2.height + padding < rect1.y
  );
};

// Resolve collision by pushing node away
export const resolveCollision = (movingNode, allNodes, padding = 20) => {
  const nodeDimensions = getNodeDimensions(movingNode);
  let position = { ...movingNode.position };
  let hasCollision = true;
  let maxIterations = 50;
  let iteration = 0;

  while (hasCollision && iteration < maxIterations) {
    hasCollision = false;

    for (const node of allNodes) {
      if (node.id === movingNode.id) continue;

      const otherDimensions = getNodeDimensions(node);
      const overlap = checkOverlap(
        { x: position.x, y: position.y, ...nodeDimensions },
        { x: node.position.x, y: node.position.y, ...otherDimensions },
        padding
      );

      if (overlap) {
        hasCollision = true;
        const dx = position.x - node.position.x;
        const dy = position.y - node.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

        position.x += (dx / distance) * 20;
        position.y += (dy / distance) * 20;
      }
    }
    iteration++;
  }

  return position;
};

// Download file to disk
export const downloadFile = (content, filename, mimeType = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Format date for filename
export const getFormattedDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Check if running in Electron
export const isElectron = () => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
};
