// Export utilities for various formats
import { toPng, toJpeg, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { getFormattedDate } from './helpers';

// Export to JSON
export const exportJSON = (nodes, edges, metadata = {}) => {
  const data = {
    version: '1.0',
    metadata: {
      name: metadata.name || 'Untitled Diagram',
      created: metadata.created || new Date().toISOString(),
      ...metadata,
    },
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      label: edge.label || '',
      animated: edge.animated || false,
      type: edge.type || 'custom',
      markerEnd: edge.markerEnd,
      markerStart: edge.markerStart,
      style: edge.style,
      data: edge.data || {}, // Includes requestLabel, responseLabel, requestParameters, responseParameters, etc.
    })),
  };

  return JSON.stringify(data, null, 2);
};

// Export to XML
export const exportXML = (nodes, edges, metadata = {}) => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<diagram version="1.0">\n';

  // Metadata
  xml += '  <metadata>\n';
  xml += `    <name>${escapeXml(metadata.name || 'Untitled Diagram')}</name>\n`;
  xml += `    <created>${new Date().toISOString()}</created>\n`;
  xml += '  </metadata>\n';

  // Nodes
  xml += '  <nodes>\n';
  nodes.forEach((node) => {
    xml += `    <node id="${node.id}" type="${node.type}">\n`;
    xml += `      <position x="${node.position.x}" y="${node.position.y}"/>\n`;
    xml += '      <data>\n';
    xml += `        <name>${escapeXml(node.data.name)}</name>\n`;
    xml += `        <color>${node.data.color}</color>\n`;
    if (node.data.attributes && node.data.attributes.length > 0) {
      xml += '        <attributes>\n';
      node.data.attributes.forEach((attr) => {
        xml += `          <attribute key="${escapeXml(attr.key)}" value="${escapeXml(attr.value)}"/>\n`;
      });
      xml += '        </attributes>\n';
    }
    xml += '      </data>\n';
    xml += '    </node>\n';
  });
  xml += '  </nodes>\n';

  // Edges
  xml += '  <edges>\n';
  edges.forEach((edge) => {
    xml += `    <edge id="${edge.id}" source="${edge.source}" target="${edge.target}"`;
    if (edge.sourceHandle) {
      xml += ` sourceHandle="${edge.sourceHandle}"`;
    }
    if (edge.targetHandle) {
      xml += ` targetHandle="${edge.targetHandle}"`;
    }
    if (edge.label) {
      xml += ` label="${escapeXml(edge.label)}"`;
    }
    xml += ` animated="${edge.animated || false}"`;
    xml += ` type="${edge.type || 'custom'}"`;
    xml += '>\n';

    // Marker configuration (arrows)
    if (edge.markerEnd) {
      xml += '      <markerEnd>\n';
      xml += `        <type>${edge.markerEnd.type}</type>\n`;
      if (edge.markerEnd.width) xml += `        <width>${edge.markerEnd.width}</width>\n`;
      if (edge.markerEnd.height) xml += `        <height>${edge.markerEnd.height}</height>\n`;
      if (edge.markerEnd.color) xml += `        <color>${edge.markerEnd.color}</color>\n`;
      xml += '      </markerEnd>\n';
    }

    if (edge.markerStart) {
      xml += '      <markerStart>\n';
      xml += `        <type>${edge.markerStart.type}</type>\n`;
      if (edge.markerStart.width) xml += `        <width>${edge.markerStart.width}</width>\n`;
      if (edge.markerStart.height) xml += `        <height>${edge.markerStart.height}</height>\n`;
      if (edge.markerStart.color) xml += `        <color>${edge.markerStart.color}</color>\n`;
      xml += '      </markerStart>\n';
    }

    // Edge style
    if (edge.style) {
      xml += '      <style>\n';
      Object.entries(edge.style).forEach(([key, value]) => {
        xml += `        <${key}>${escapeXml(String(value))}</${key}>\n`;
      });
      xml += '      </style>\n';
    }

    // Edge data (requestParameters, responseParameters, etc.)
    if (edge.data) {
      xml += '      <data>\n';
      if (edge.data.type) {
        xml += `        <visualType>${escapeXml(edge.data.type)}</visualType>\n`;
      }
      if (edge.data.directionType) {
        xml += `        <directionType>${escapeXml(edge.data.directionType)}</directionType>\n`;
      }
      if (edge.data.connectionType) {
        xml += `        <connectionType>${escapeXml(edge.data.connectionType)}</connectionType>\n`;
      }
      if (edge.data.requestLabel) {
        xml += `        <requestLabel>${escapeXml(edge.data.requestLabel)}</requestLabel>\n`;
      }
      if (edge.data.responseLabel) {
        xml += `        <responseLabel>${escapeXml(edge.data.responseLabel)}</responseLabel>\n`;
      }

      // Request parameters
      if (edge.data.requestParameters && edge.data.requestParameters.length > 0) {
        xml += '        <requestParameters>\n';
        edge.data.requestParameters.forEach((param) => {
          xml += `          <parameter>${escapeXml(param)}</parameter>\n`;
        });
        xml += '        </requestParameters>\n';
      }

      // Response parameters
      if (edge.data.responseParameters && edge.data.responseParameters.length > 0) {
        xml += '        <responseParameters>\n';
        edge.data.responseParameters.forEach((param) => {
          xml += `          <parameter>${escapeXml(param)}</parameter>\n`;
        });
        xml += '        </responseParameters>\n';
      }

      xml += '      </data>\n';
    }

    xml += '    </edge>\n';
  });
  xml += '  </edges>\n';

  xml += '</diagram>';

  return xml;
};

// Helper to escape XML special characters
const escapeXml = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

// Export to PNG
export const exportPNG = async (elementRef, filename = `diagram-${getFormattedDate()}.png`) => {
  try {
    const element = elementRef.current;
    if (!element) {
      throw new Error('Element not found');
    }

    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: 2, // Higher resolution
      backgroundColor: '#ffffff',
    });

    return { success: true, data: dataUrl, filename };
  } catch (error) {
    console.error('Error exporting PNG:', error);
    return { success: false, error: error.message };
  }
};

// Export to JPG
export const exportJPG = async (elementRef, filename = `diagram-${getFormattedDate()}.jpg`) => {
  try {
    const element = elementRef.current;
    if (!element) {
      throw new Error('Element not found');
    }

    const dataUrl = await toJpeg(element, {
      cacheBust: true,
      pixelRatio: 2,
      quality: 0.95,
      backgroundColor: '#ffffff',
    });

    return { success: true, data: dataUrl, filename };
  } catch (error) {
    console.error('Error exporting JPG:', error);
    return { success: false, error: error.message };
  }
};

// Export to SVG
export const exportSVG = async (elementRef, filename = `diagram-${getFormattedDate()}.svg`) => {
  try {
    const element = elementRef.current;
    if (!element) {
      throw new Error('Element not found');
    }

    const dataUrl = await toSvg(element, {
      cacheBust: true,
      backgroundColor: '#ffffff',
    });

    return { success: true, data: dataUrl, filename };
  } catch (error) {
    console.error('Error exporting SVG:', error);
    return { success: false, error: error.message };
  }
};

// Export to PDF
export const exportPDF = async (elementRef, filename = `diagram-${getFormattedDate()}.pdf`) => {
  try {
    const element = elementRef.current;
    if (!element) {
      throw new Error('Element not found');
    }

    // First convert to image
    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    });

    // Get element dimensions
    const width = element.offsetWidth;
    const height = element.offsetHeight;

    // Create PDF with appropriate size
    const pdf = new jsPDF({
      orientation: width > height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [width, height],
    });

    pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);

    // Convert to data URL
    const pdfDataUrl = pdf.output('dataurlstring');

    return { success: true, data: pdfDataUrl, filename };
  } catch (error) {
    console.error('Error exporting PDF:', error);
    return { success: false, error: error.message };
  }
};
