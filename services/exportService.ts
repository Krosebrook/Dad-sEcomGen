import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ExportOptions {
  type: 'pdf' | 'components' | 'assets' | 'storyboard' | 'full_package';
  format: 'pdf' | 'png' | 'svg' | 'zip' | 'json';
  includeAnnotations?: boolean;
  includeMetadata?: boolean;
  quality?: number;
  scale?: number;
  paperSize?: 'a4' | 'letter' | 'legal';
  orientation?: 'portrait' | 'landscape';
}

export interface ExportMetadata {
  exportType: string;
  exportFormat: string;
  fileSize: number;
  assetCount: number;
  settings: Record<string, any>;
  timestamp: string;
}

export interface ExportHistory {
  id: string;
  user_id: string;
  venture_id?: string;
  export_type: string;
  export_format: string;
  file_size: number;
  asset_count: number;
  metadata: Record<string, any>;
  download_url?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  created_at: string;
  expires_at?: string;
}

export interface ExportTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  export_type: string;
  settings: Record<string, any>;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export class ExportService {
  static async captureElement(
    elementId: string,
    options: Partial<ExportOptions> = {}
  ): Promise<HTMLCanvasElement> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    const canvas = await html2canvas(element, {
      scale: options.scale || 2,
      useCORS: true,
      logging: false,
      backgroundColor: null,
    });

    return canvas;
  }

  static async captureMultipleElements(
    elementIds: string[],
    options: Partial<ExportOptions> = {}
  ): Promise<HTMLCanvasElement[]> {
    const canvases: HTMLCanvasElement[] = [];

    for (const id of elementIds) {
      const canvas = await this.captureElement(id, options);
      canvases.push(canvas);
    }

    return canvases;
  }

  static async exportToPDF(
    canvases: HTMLCanvasElement[],
    filename: string,
    options: Partial<ExportOptions> = {}
  ): Promise<Blob> {
    const orientation = options.orientation || 'portrait';
    const paperSize = options.paperSize || 'a4';
    const pdf = new jsPDF(orientation, 'mm', paperSize);

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    pdf.setFontSize(24);
    pdf.text(filename, pageWidth / 2, 20, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, {
      align: 'center',
    });
    pdf.setFontSize(10);
    pdf.text('Powered by E-commerce Plan Generator', pageWidth / 2, pageHeight - 10, {
      align: 'center',
    });

    for (let i = 0; i < canvases.length; i++) {
      const canvas = canvases[i];
      const imgData = canvas.toDataURL('image/png', options.quality || 0.95);

      const availableWidth = pageWidth - (2 * margin);
      const availableHeight = pageHeight - 50;
      const imgWidth = availableWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addPage();

      if (options.includeAnnotations) {
        pdf.setFontSize(14);
        pdf.text(`Scene ${i + 1}`, margin, margin + 5);
      }

      const yPosition = options.includeAnnotations ? margin + 10 : margin;

      if (imgHeight > availableHeight) {
        let remainingHeight = imgHeight;
        let sourceY = 0;

        while (remainingHeight > 0) {
          const sliceHeight = Math.min(availableHeight, remainingHeight);
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = (sliceHeight / imgWidth) * canvas.width;

          const ctx = sliceCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(
              canvas,
              0,
              (sourceY / imgHeight) * canvas.height,
              canvas.width,
              sliceCanvas.height,
              0,
              0,
              sliceCanvas.width,
              sliceCanvas.height
            );

            const sliceData = sliceCanvas.toDataURL('image/png');
            pdf.addImage(sliceData, 'PNG', margin, yPosition, imgWidth, sliceHeight);
          }

          remainingHeight -= sliceHeight;
          sourceY += sliceHeight;

          if (remainingHeight > 0) {
            pdf.addPage();
          }
        }
      } else {
        pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
      }
    }

    return pdf.output('blob');
  }

  static async exportAsImages(
    canvases: HTMLCanvasElement[],
    baseFilename: string,
    options: Partial<ExportOptions> = {}
  ): Promise<Blob[]> {
    const blobs: Blob[] = [];

    for (let i = 0; i < canvases.length; i++) {
      const canvas = canvases[i];
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          'image/png',
          options.quality || 0.95
        );
      });

      blobs.push(blob);
    }

    return blobs;
  }

  static downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async createZipBundle(
    files: Array<{ name: string; blob: Blob }>,
    zipFilename: string
  ): Promise<void> {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    for (const file of files) {
      zip.file(file.name, file.blob);
    }

    const metadata = {
      generated: new Date().toISOString(),
      fileCount: files.length,
      totalSize: files.reduce((sum, f) => sum + f.blob.size, 0),
    };

    zip.file('metadata.json', JSON.stringify(metadata, null, 2));

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    this.downloadBlob(zipBlob, zipFilename);
  }

  static async trackExport(
    userId: string,
    exportType: string,
    exportFormat: string,
    fileSize: number,
    assetCount: number,
    metadata: Record<string, any> = {},
    ventureId?: string
  ): Promise<ExportHistory | null> {
    try {
      const { data, error } = await supabase
        .from('export_history')
        .insert({
          user_id: userId,
          venture_id: ventureId,
          export_type: exportType,
          export_format: exportFormat,
          file_size: fileSize,
          asset_count: assetCount,
          metadata,
          status: 'completed',
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Failed to track export:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to track export:', error);
      return null;
    }
  }

  static async getExportHistory(
    userId: string,
    limit: number = 50
  ): Promise<ExportHistory[]> {
    try {
      const { data, error } = await supabase
        .from('export_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to fetch export history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch export history:', error);
      return [];
    }
  }

  static async deleteExportHistory(exportId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('export_history')
        .delete()
        .eq('id', exportId);

      if (error) {
        console.error('Failed to delete export:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete export:', error);
      return false;
    }
  }

  static async saveTemplate(
    userId: string,
    name: string,
    exportType: string,
    settings: Record<string, any>,
    description?: string,
    isDefault: boolean = false
  ): Promise<ExportTemplate | null> {
    try {
      if (isDefault) {
        await supabase
          .from('export_templates')
          .update({ is_default: false })
          .eq('user_id', userId)
          .eq('export_type', exportType);
      }

      const { data, error } = await supabase
        .from('export_templates')
        .insert({
          user_id: userId,
          name,
          description,
          export_type: exportType,
          settings,
          is_default: isDefault,
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Failed to save template:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to save template:', error);
      return null;
    }
  }

  static async getTemplates(
    userId: string,
    exportType?: string
  ): Promise<ExportTemplate[]> {
    try {
      let query = supabase
        .from('export_templates')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (exportType) {
        query = query.eq('export_type', exportType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch templates:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      return [];
    }
  }

  static async deleteTemplate(templateId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('export_templates')
        .delete()
        .eq('id', templateId);

      if (error) {
        console.error('Failed to delete template:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete template:', error);
      return false;
    }
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  static async getExportAnalytics(userId: string): Promise<{
    totalExports: number;
    exportsByType: Record<string, number>;
    exportsByFormat: Record<string, number>;
    totalSize: number;
    recentExports: ExportHistory[];
  }> {
    try {
      const history = await this.getExportHistory(userId, 100);

      const exportsByType: Record<string, number> = {};
      const exportsByFormat: Record<string, number> = {};
      let totalSize = 0;

      history.forEach((exp) => {
        exportsByType[exp.export_type] = (exportsByType[exp.export_type] || 0) + 1;
        exportsByFormat[exp.export_format] = (exportsByFormat[exp.export_format] || 0) + 1;
        totalSize += exp.file_size;
      });

      return {
        totalExports: history.length,
        exportsByType,
        exportsByFormat,
        totalSize,
        recentExports: history.slice(0, 10),
      };
    } catch (error) {
      console.error('Failed to get export analytics:', error);
      return {
        totalExports: 0,
        exportsByType: {},
        exportsByFormat: {},
        totalSize: 0,
        recentExports: [],
      };
    }
  }
}
