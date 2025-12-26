import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { useTheme } from '../../contexts/SafeThemeContext';

interface VideoExporterProps {
  sceneIds: string[];
  fps?: number;
  duration?: number;
  onExportComplete?: () => void;
}

type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3';
type Quality = '720p' | '1080p' | '4k';

interface ExportFormat {
  aspectRatio: AspectRatio;
  quality: Quality;
  width: number;
  height: number;
}

const exportFormats: Record<string, ExportFormat> = {
  '16:9-720p': { aspectRatio: '16:9', quality: '720p', width: 1280, height: 720 },
  '16:9-1080p': { aspectRatio: '16:9', quality: '1080p', width: 1920, height: 1080 },
  '16:9-4k': { aspectRatio: '16:9', quality: '4k', width: 3840, height: 2160 },
  '9:16-720p': { aspectRatio: '9:16', quality: '720p', width: 720, height: 1280 },
  '9:16-1080p': { aspectRatio: '9:16', quality: '1080p', width: 1080, height: 1920 },
  '1:1-720p': { aspectRatio: '1:1', quality: '720p', width: 720, height: 720 },
  '1:1-1080p': { aspectRatio: '1:1', quality: '1080p', width: 1080, height: 1080 },
};

export function VideoExporter({ sceneIds, fps = 60, duration = 3, onExportComplete }: VideoExporterProps) {
  const { theme } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['16:9-1080p', '9:16-1080p']);

  const toggleFormat = (formatKey: string) => {
    setSelectedFormats(prev =>
      prev.includes(formatKey)
        ? prev.filter(f => f !== formatKey)
        : [...prev, formatKey]
    );
  };

  const captureFrame = async (element: HTMLElement, format: ExportFormat): Promise<Blob> => {
    const canvas = await html2canvas(element, {
      width: format.width,
      height: format.height,
      scale: 1,
      useCORS: true,
      logging: false,
      backgroundColor: theme.colors.background,
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/png');
    });
  };

  const exportVideoFrames = async () => {
    if (selectedFormats.length === 0) {
      alert('Please select at least one export format');
      return;
    }

    setIsExporting(true);
    setProgress(0);

    try {
      const zip = new JSZip();
      const totalFrames = sceneIds.length * selectedFormats.length * fps * duration;
      let currentFrame = 0;

      for (const formatKey of selectedFormats) {
        const format = exportFormats[formatKey];
        const formatFolder = zip.folder(`${format.aspectRatio}_${format.quality}`);

        if (!formatFolder) continue;

        formatFolder.file('metadata.json', JSON.stringify({
          aspectRatio: format.aspectRatio,
          quality: format.quality,
          width: format.width,
          height: format.height,
          fps,
          totalScenes: sceneIds.length,
          framesPerScene: fps * duration,
          description: 'Video frames exported from Dad\'s E-commerce Plan Generator storyboard',
          exportDate: new Date().toISOString(),
        }, null, 2));

        for (let sceneIndex = 0; sceneIndex < sceneIds.length; sceneIndex++) {
          const element = document.getElementById(sceneIds[sceneIndex]);
          if (!element) continue;

          const sceneFolder = formatFolder.folder(`scene_${sceneIndex + 1}_${sceneIds[sceneIndex]}`);
          if (!sceneFolder) continue;

          const frameCount = fps * duration;

          for (let frame = 0; frame < frameCount; frame++) {
            const frameBlob = await captureFrame(element, format);
            const frameNumber = String(frame).padStart(4, '0');
            sceneFolder.file(`frame_${frameNumber}.png`, frameBlob);

            currentFrame++;
            setProgress((currentFrame / totalFrames) * 100);

            if (frame % 10 === 0) {
              await new Promise(resolve => setTimeout(resolve, 1));
            }
          }
        }

        formatFolder.file('README.txt', `
Video Export Package
==================

Format: ${format.aspectRatio} @ ${format.quality}
Resolution: ${format.width}x${format.height}
Frame Rate: ${fps} FPS
Duration per scene: ${duration} seconds

To convert these frames to video, use FFmpeg:

ffmpeg -framerate ${fps} -i scene_1_splash/frame_%04d.png -c:v libx264 -pix_fmt yuv420p -crf 18 output_scene_1.mp4

Or to combine all scenes:

for scene in scene_*; do
  ffmpeg -framerate ${fps} -i $scene/frame_%04d.png -c:v libx264 -pix_fmt yuv420p -crf 18 $scene.mp4
done

ffmpeg -f concat -safe 0 -i <(for f in *.mp4; do echo "file '$PWD/$f'"; done) -c copy final_video.mp4
`);
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `storyboard-video-frames-${Date.now()}.zip`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      onExportComplete?.();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };

  return (
    <div
      className="p-6 rounded-xl space-y-6"
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: '1px',
      }}
    >
      <div>
        <h3 className="text-xl font-bold mb-2" style={{ color: theme.colors.text }}>
          Video Frame Exporter
        </h3>
        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
          Export video frames in multiple aspect ratios and resolutions. Frames can be compiled into video using FFmpeg.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-3" style={{ color: theme.colors.text }}>
          Select Export Formats:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(exportFormats).map(([key, format]) => (
            <label
              key={key}
              className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: selectedFormats.includes(key)
                  ? `${theme.colors.primary}20`
                  : theme.colors.background,
                borderColor: selectedFormats.includes(key)
                  ? theme.colors.primary
                  : theme.colors.border,
                borderWidth: '2px',
              }}
            >
              <input
                type="checkbox"
                checked={selectedFormats.includes(key)}
                onChange={() => toggleFormat(key)}
                className="w-5 h-5 rounded"
                style={{ accentColor: theme.colors.primary }}
              />
              <div className="flex-1">
                <div className="font-semibold text-sm" style={{ color: theme.colors.text }}>
                  {format.aspectRatio} • {format.quality}
                </div>
                <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                  {format.width}×{format.height}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div
        className="p-4 rounded-lg"
        style={{
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
          borderWidth: '1px',
        }}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div className="flex-1 text-sm" style={{ color: theme.colors.textSecondary }}>
            <p className="mb-2">
              <strong>Export Details:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>{sceneIds.length} scenes × {fps} FPS × {duration}s = {sceneIds.length * fps * duration} frames per format</li>
              <li>Selected formats: {selectedFormats.length}</li>
              <li>Total frames: {sceneIds.length * fps * duration * selectedFormats.length}</li>
              <li>Includes FFmpeg conversion instructions</li>
            </ul>
          </div>
        </div>
      </div>

      {isExporting && (
        <div className="space-y-2">
          <div
            className="h-3 rounded-full overflow-hidden"
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
            Exporting frames... {Math.round(progress)}%
          </p>
        </div>
      )}

      <button
        onClick={exportVideoFrames}
        disabled={isExporting || selectedFormats.length === 0}
        className="w-full px-6 py-4 rounded-lg font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: theme.colors.primary,
          color: '#ffffff',
        }}
      >
        {isExporting ? 'Exporting...' : `Export Video Frames (${selectedFormats.length} formats)`}
      </button>
    </div>
  );
}
