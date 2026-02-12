import { useCallback, useRef } from 'react';
import { electronAPI } from '../utils/ipc';
import { exportPNG, exportJPG, exportSVG, exportPDF } from '../utils/exporters';
import { exportToHTML } from '../utils/htmlExporter';
import { downloadFile } from '../utils/helpers';

export function useExport(reactFlowRef, nodes, edges) {
  const isExporting = useRef(false);

  const exportImage = useCallback(
    async (format) => {
      console.log('🎯 [useExport] Export requested, format:', format);

      if (isExporting.current) {
        console.warn('⚠️ [useExport] Export already in progress');
        return { success: false, error: 'Export in progress' };
      }

      isExporting.current = true;
      console.log('🔒 [useExport] Export lock acquired');

      try {
        let result;

        switch (format) {
          case 'html':
            // Export as standalone HTML viewer
            console.log('📄 [useExport] Starting HTML export...');
            console.log('📊 [useExport] Data check:', {
              nodes: nodes?.length || 0,
              edges: edges?.length || 0,
              nodesType: typeof nodes,
              edgesType: typeof edges
            });
            try {
              const filename = exportToHTML(nodes, edges, 'Diagram');
              console.log('✅ [useExport] HTML export completed:', filename);
              isExporting.current = false;
              return { success: true, filename };
            } catch (error) {
              console.error('❌ [useExport] Error exporting HTML:', error);
              console.error('❌ [useExport] Error stack:', error.stack);
              isExporting.current = false;
              return { success: false, error: error.message };
            }
          case 'png':
            console.log('🖼️ [useExport] Exporting PNG...');
            result = await exportPNG(reactFlowRef);
            break;
          case 'jpg':
            console.log('🖼️ [useExport] Exporting JPG...');
            result = await exportJPG(reactFlowRef);
            break;
          case 'svg':
            console.log('🖼️ [useExport] Exporting SVG...');
            result = await exportSVG(reactFlowRef);
            break;
          case 'pdf':
            console.log('📄 [useExport] Exporting PDF...');
            result = await exportPDF(reactFlowRef);
            break;
          default:
            console.error('❌ [useExport] Unsupported format:', format);
            return { success: false, error: 'Unsupported format' };
        }

        console.log('📦 [useExport] Export result:', result);

        if (!result.success) {
          console.error('❌ [useExport] Export failed:', result);
          isExporting.current = false;
          return result;
        }

        // Save using Electron or download in browser
        if (electronAPI.isAvailable()) {
          console.log('💻 [useExport] Using Electron API...');
          const saveResult = await electronAPI.exportImage(
            result.data,
            result.filename,
            format
          );
          console.log('✅ [useExport] Electron save result:', saveResult);
          isExporting.current = false;
          return saveResult;
        } else {
          console.log('🌐 [useExport] Using browser download...');
          // Download in browser
          const link = document.createElement('a');
          link.download = result.filename;
          link.href = result.data;
          link.click();
          console.log('✅ [useExport] Browser download triggered');
          isExporting.current = false;
          return { success: true };
        }
      } catch (error) {
        console.error('❌ [useExport] Export error caught:', error);
        console.error('❌ [useExport] Error details:', {
          message: error.message,
          stack: error.stack,
          format
        });
        isExporting.current = false;
        return { success: false, error: error.message };
      }
    },
    [reactFlowRef, nodes, edges]
  );

  return {
    exportImage,
  };
}
