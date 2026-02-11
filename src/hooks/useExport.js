import { useCallback, useRef } from 'react';
import { electronAPI } from '../utils/ipc';
import { exportPNG, exportJPG, exportSVG, exportPDF } from '../utils/exporters';
import { downloadFile } from '../utils/helpers';

export function useExport(reactFlowRef) {
  const isExporting = useRef(false);

  const exportImage = useCallback(
    async (format) => {
      if (isExporting.current) {
        console.warn('Export already in progress');
        return { success: false, error: 'Export in progress' };
      }

      isExporting.current = true;

      try {
        let result;

        switch (format) {
          case 'png':
            result = await exportPNG(reactFlowRef);
            break;
          case 'jpg':
            result = await exportJPG(reactFlowRef);
            break;
          case 'svg':
            result = await exportSVG(reactFlowRef);
            break;
          case 'pdf':
            result = await exportPDF(reactFlowRef);
            break;
          default:
            return { success: false, error: 'Unsupported format' };
        }

        if (!result.success) {
          return result;
        }

        // Save using Electron or download in browser
        if (electronAPI.isAvailable()) {
          const saveResult = await electronAPI.exportImage(
            result.data,
            result.filename,
            format
          );
          isExporting.current = false;
          return saveResult;
        } else {
          // Download in browser
          const link = document.createElement('a');
          link.download = result.filename;
          link.href = result.data;
          link.click();
          isExporting.current = false;
          return { success: true };
        }
      } catch (error) {
        console.error('Error exporting image:', error);
        isExporting.current = false;
        return { success: false, error: error.message };
      }
    },
    [reactFlowRef]
  );

  return {
    exportImage,
  };
}
