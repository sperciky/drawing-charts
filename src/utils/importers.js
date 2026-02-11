// Import parsers for JSON and XML formats

export const parseJSON = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);

    if (!data.nodes || !data.edges) {
      throw new Error('Invalid diagram format: missing nodes or edges');
    }

    // Ensure attributes have IDs
    const nodes = data.nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        attributes: (node.data.attributes || []).map((attr, idx) => ({
          ...attr,
          id: attr.id || `attr-${node.id}-${idx}`,
        })),
      },
    }));

    return {
      success: true,
      nodes,
      edges: data.edges,
      metadata: data.metadata || {},
    };
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const parseXML = (xmlString) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Invalid XML format');
    }

    const nodes = [];
    const edges = [];
    const metadata = {};

    // Parse metadata
    const metadataNode = xmlDoc.querySelector('metadata');
    if (metadataNode) {
      const nameNode = metadataNode.querySelector('name');
      if (nameNode) {
        metadata.name = nameNode.textContent;
      }
    }

    // Parse nodes
    const nodeElements = xmlDoc.querySelectorAll('nodes > node');
    nodeElements.forEach((nodeEl) => {
      const id = nodeEl.getAttribute('id');
      const type = nodeEl.getAttribute('type') || 'platform';

      const positionEl = nodeEl.querySelector('position');
      const position = {
        x: parseFloat(positionEl?.getAttribute('x') || 0),
        y: parseFloat(positionEl?.getAttribute('y') || 0),
      };

      const dataEl = nodeEl.querySelector('data');
      const nameEl = dataEl?.querySelector('name');
      const colorEl = dataEl?.querySelector('color');

      const attributes = [];
      const attributeElements = dataEl?.querySelectorAll('attributes > attribute') || [];
      attributeElements.forEach((attrEl, idx) => {
        attributes.push({
          id: `attr-${id}-${idx}`,
          key: attrEl.getAttribute('key'),
          value: attrEl.getAttribute('value'),
        });
      });

      nodes.push({
        id,
        type,
        position,
        data: {
          name: nameEl?.textContent || 'Unnamed',
          color: colorEl?.textContent || '#3b82f6',
          attributes,
        },
      });
    });

    // Parse edges
    const edgeElements = xmlDoc.querySelectorAll('edges > edge');
    edgeElements.forEach((edgeEl) => {
      edges.push({
        id: edgeEl.getAttribute('id'),
        source: edgeEl.getAttribute('source'),
        target: edgeEl.getAttribute('target'),
        label: edgeEl.getAttribute('label') || '',
        animated: edgeEl.getAttribute('animated') === 'true',
        type: edgeEl.getAttribute('type') || 'smoothstep',
      });
    });

    return {
      success: true,
      nodes,
      edges,
      metadata,
    };
  } catch (error) {
    console.error('Error parsing XML:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Detect format and parse
export const importDiagram = (content, format = 'auto') => {
  if (format === 'auto') {
    // Auto-detect format
    const trimmed = content.trim();
    if (trimmed.startsWith('<')) {
      format = 'xml';
    } else if (trimmed.startsWith('{')) {
      format = 'json';
    }
  }

  if (format === 'json') {
    return parseJSON(content);
  } else if (format === 'xml') {
    return parseXML(content);
  } else {
    return {
      success: false,
      error: 'Unknown format',
    };
  }
};
