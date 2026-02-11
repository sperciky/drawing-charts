import { useCallback, useState } from 'react';
import { electronAPI } from '../utils/ipc';
import { exportJSON, exportXML } from '../utils/exporters';
import { importDiagram } from '../utils/importers';
import { downloadFile, getFormattedDate } from '../utils/helpers';

export function useFileOperations() {
  const [currentFilePath, setCurrentFilePath] = useState(null);
  const [diagramName, setDiagramName] = useState('Untitled Diagram');

  const saveFile = useCallback(
    async (nodes, edges, metadata = {}) => {
      const jsonData = exportJSON(nodes, edges, { ...metadata, name: diagramName });
      const defaultName = currentFilePath || `diagram-${getFormattedDate()}.json`;

      if (electronAPI.isAvailable()) {
        const result = await electronAPI.saveFile(jsonData, defaultName, [
          { name: 'JSON Files', extensions: ['json'] },
        ]);

        if (result.success) {
          setCurrentFilePath(result.filePath);
          return { success: true, filePath: result.filePath };
        }
        return result;
      } else {
        // Fallback for web browser
        downloadFile(jsonData, defaultName, 'application/json');
        return { success: true };
      }
    },
    [currentFilePath, diagramName]
  );

  const saveFileAs = useCallback(
    async (nodes, edges, metadata = {}) => {
      const jsonData = exportJSON(nodes, edges, { ...metadata, name: diagramName });
      const defaultName = `diagram-${getFormattedDate()}.json`;

      if (electronAPI.isAvailable()) {
        const result = await electronAPI.saveFile(jsonData, defaultName, [
          { name: 'JSON Files', extensions: ['json'] },
        ]);

        if (result.success) {
          setCurrentFilePath(result.filePath);
          return { success: true, filePath: result.filePath };
        }
        return result;
      } else {
        // Fallback for web browser
        downloadFile(jsonData, defaultName, 'application/json');
        return { success: true };
      }
    },
    [diagramName]
  );

  const openFile = useCallback(async () => {
    if (electronAPI.isAvailable()) {
      const result = await electronAPI.openFile([
        { name: 'Diagram Files', extensions: ['json', 'xml'] },
      ]);

      if (result.success) {
        const imported = importDiagram(result.content);
        if (imported.success) {
          setCurrentFilePath(result.filePath);
          if (imported.metadata?.name) {
            setDiagramName(imported.metadata.name);
          }
          return {
            success: true,
            nodes: imported.nodes,
            edges: imported.edges,
            metadata: imported.metadata,
          };
        }
        return { success: false, error: imported.error };
      }
      return result;
    } else {
      // Fallback for web browser - use file input
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.xml';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const content = event.target.result;
              const imported = importDiagram(content);
              if (imported.success) {
                if (imported.metadata?.name) {
                  setDiagramName(imported.metadata.name);
                }
                resolve({
                  success: true,
                  nodes: imported.nodes,
                  edges: imported.edges,
                  metadata: imported.metadata,
                });
              } else {
                resolve({ success: false, error: imported.error });
              }
            };
            reader.readAsText(file);
          } else {
            resolve({ success: false });
          }
        };
        input.click();
      });
    }
  }, []);

  const exportFile = useCallback(
    async (nodes, edges, format = 'xml') => {
      let data, defaultName, mimeType;

      if (format === 'xml') {
        data = exportXML(nodes, edges, { name: diagramName });
        defaultName = `diagram-${getFormattedDate()}.xml`;
        mimeType = 'application/xml';

        if (electronAPI.isAvailable()) {
          const result = await electronAPI.saveFile(data, defaultName, [
            { name: 'XML Files', extensions: ['xml'] },
          ]);
          return result;
        } else {
          downloadFile(data, defaultName, mimeType);
          return { success: true };
        }
      }

      return { success: false, error: 'Unsupported format' };
    },
    [diagramName]
  );

  const newFile = useCallback(() => {
    setCurrentFilePath(null);
    setDiagramName('Untitled Diagram');
  }, []);

  return {
    saveFile,
    saveFileAs,
    openFile,
    exportFile,
    newFile,
    currentFilePath,
    diagramName,
    setDiagramName,
  };
}
