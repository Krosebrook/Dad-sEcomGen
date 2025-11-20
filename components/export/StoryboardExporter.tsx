import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useTheme } from '../../contexts/SafeThemeContext';

interface StoryboardExporterProps {
  sceneIds: string[];
  onExportComplete?: () => void;
}

export function StoryboardExporter({ sceneIds, onExportComplete }: StoryboardExporterProps) {
  const { theme } = useTheme();
  const [isExporting, setIsExporting] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const exportToPDF = async () => {
    setIsExporting(true);
    setProgress(0);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.setFontSize(24);
      pdf.text('UI/UX Storyboard', pageWidth / 2, 20, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, {
        align: 'center',
      });

      for (let i = 0; i < sceneIds.length; i++) {
        const element = document.getElementById(sceneIds[i]);
        if (!element) continue;

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addPage();
        pdf.text(`Scene ${i + 1}: ${sceneIds[i]}`, 10, 10);
        pdf.addImage(imgData, 'PNG', 10, 20, imgWidth, Math.min(imgHeight, pageHeight - 30));

        setProgress(((i + 1) / sceneIds.length) * 100);
      }

      pdf.save('storyboard.pdf');
      onExportComplete?.();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };

  const exportAsImages = async () => {
    setIsExporting(true);
    setProgress(0);

    try {
      for (let i = 0; i < sceneIds.length; i++) {
        const element = document.getElementById(sceneIds[i]);
        if (!element) continue;

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
        });

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `scene-${i + 1}-${sceneIds[i]}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
          }
        });

        setProgress(((i + 1) / sceneIds.length) * 100);
      }

      onExportComplete?.();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };

  return (
    <div
      className="p-6 rounded-xl space-y-4"
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: '1px',
      }}
    >
      <h3 className="text-xl font-bold" style={{ color: theme.colors.text }}>
        Export Storyboard
      </h3>

      <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
        Export your UI workflow as a PDF document or individual images
      </p>

      {isExporting && (
        <div className="space-y-2">
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: theme.colors.border }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                backgroundColor: theme.colors.primary,
                width: `${progress}%`,
              }}
            />
          </div>
          <p className="text-sm text-center" style={{ color: theme.colors.textSecondary }}>
            Exporting... {Math.round(progress)}%
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={exportToPDF}
          disabled={isExporting}
          className="flex-1 px-4 py-3 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: theme.colors.primary,
            color: '#ffffff',
          }}
        >
          Export as PDF
        </button>

        <button
          onClick={exportAsImages}
          disabled={isExporting}
          className="flex-1 px-4 py-3 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'transparent',
            color: theme.colors.primary,
            borderColor: theme.colors.primary,
            borderWidth: '2px',
          }}
        >
          Export as Images
        </button>
      </div>
    </div>
  );
}
