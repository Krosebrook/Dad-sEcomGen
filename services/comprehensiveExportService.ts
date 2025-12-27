import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
import * as Papa from 'papaparse';
import JSZip from 'jszip';

export interface ExportRequest {
  ventureId: string;
  exportType: 'products' | 'documents' | 'analytics' | 'full' | 'custom';
  format: 'pdf' | 'csv' | 'json' | 'xlsx' | 'zip';
  filters?: Record<string, any>;
}

export async function createExport(request: ExportRequest, userId: string) {
  const { data, error } = await supabase
    .from('exports')
    .insert({
      venture_id: request.ventureId,
      export_type: request.exportType,
      format: request.format,
      filters: request.filters || {},
      status: 'pending',
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listExports(ventureId: string) {
  const { data, error } = await supabase
    .from('exports')
    .select('*')
    .eq('venture_id', ventureId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function generateExport(exportId: string) {
  const { data: exportRecord } = await supabase
    .from('exports')
    .select('*')
    .eq('id', exportId)
    .single();

  if (!exportRecord) throw new Error('Export not found');

  await supabase
    .from('exports')
    .update({ status: 'processing' })
    .eq('id', exportId);

  try {
    let fileBlob: Blob;

    switch (exportRecord.export_type) {
      case 'products':
        fileBlob = await exportProducts(exportRecord);
        break;
      case 'documents':
        fileBlob = await exportDocuments(exportRecord);
        break;
      case 'analytics':
        fileBlob = await exportAnalytics(exportRecord);
        break;
      case 'full':
        fileBlob = await exportFull(exportRecord);
        break;
      default:
        throw new Error('Unsupported export type');
    }

    await supabase
      .from('exports')
      .update({
        status: 'completed',
        file_size: fileBlob.size,
      })
      .eq('id', exportId);

    return fileBlob;
  } catch (error) {
    await supabase
      .from('exports')
      .update({ status: 'failed' })
      .eq('id', exportId);

    throw error;
  }
}

async function exportProducts(exportRecord: any): Promise<Blob> {
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('venture_id', exportRecord.venture_id);

  if (!products) throw new Error('No products found');

  switch (exportRecord.format) {
    case 'csv':
      return exportProductsAsCSV(products);
    case 'json':
      return new Blob([JSON.stringify(products, null, 2)], {
        type: 'application/json',
      });
    case 'pdf':
      return exportProductsAsPDF(products);
    default:
      throw new Error('Unsupported format');
  }
}

function exportProductsAsCSV(products: any[]): Blob {
  const csv = Papa.unparse(products);
  return new Blob([csv], { type: 'text/csv' });
}

function exportProductsAsPDF(products: any[]): Blob {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  pdf.setFontSize(20);
  pdf.text('Product Catalog', margin, y);
  y += 15;

  pdf.setFontSize(10);
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, y);
  y += 10;

  for (const product of products) {
    if (y > 270) {
      pdf.addPage();
      y = 20;
    }

    pdf.setFontSize(14);
    pdf.text(product.name, margin, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.text(`SKU: ${product.sku || 'N/A'}`, margin, y);
    y += 6;
    pdf.text(`Price: $${product.price}`, margin, y);
    y += 6;
    pdf.text(`Inventory: ${product.inventory_count}`, margin, y);
    y += 6;

    if (product.description) {
      const lines = pdf.splitTextToSize(product.description, pageWidth - 2 * margin);
      for (const line of lines) {
        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(line, margin, y);
        y += 6;
      }
    }

    y += 5;
  }

  return pdf.output('blob');
}

async function exportDocuments(exportRecord: any): Promise<Blob> {
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('venture_id', exportRecord.venture_id);

  if (!documents) throw new Error('No documents found');

  switch (exportRecord.format) {
    case 'json':
      return new Blob([JSON.stringify(documents, null, 2)], {
        type: 'application/json',
      });
    case 'zip':
      return await exportDocumentsAsZip(documents);
    default:
      throw new Error('Unsupported format');
  }
}

async function exportDocumentsAsZip(documents: any[]): Promise<Blob> {
  const zip = new JSZip();

  for (const doc of documents) {
    const fileName = `${doc.title.replace(/[^a-z0-9]/gi, '_')}_${doc.id}.json`;
    zip.file(fileName, JSON.stringify(doc, null, 2));
  }

  return await zip.generateAsync({ type: 'blob' });
}

async function exportAnalytics(exportRecord: any): Promise<Blob> {
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('venture_id', exportRecord.venture_id);

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('venture_id', exportRecord.venture_id);

  const analytics = {
    generatedAt: new Date().toISOString(),
    products: {
      total: products?.length || 0,
      active: products?.filter((p) => p.status === 'active').length || 0,
      totalValue: products?.reduce((sum, p) => sum + p.price * p.inventory_count, 0) || 0,
    },
    documents: {
      total: documents?.length || 0,
      byType: documents?.reduce((acc, d) => {
        acc[d.type] = (acc[d.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
    },
  };

  return new Blob([JSON.stringify(analytics, null, 2)], {
    type: 'application/json',
  });
}

async function exportFull(exportRecord: any): Promise<Blob> {
  const zip = new JSZip();

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('venture_id', exportRecord.venture_id);

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('venture_id', exportRecord.venture_id);

  const { data: scrapedData } = await supabase
    .from('scraped_data')
    .select('*')
    .eq('venture_id', exportRecord.venture_id);

  if (products) {
    const productsCsv = Papa.unparse(products);
    zip.file('products.csv', productsCsv);
    zip.file('products.json', JSON.stringify(products, null, 2));
  }

  if (documents) {
    zip.file('documents.json', JSON.stringify(documents, null, 2));
  }

  if (scrapedData) {
    zip.file('scraped_data.json', JSON.stringify(scrapedData, null, 2));
  }

  zip.file('README.txt', generateReadme());

  return await zip.generateAsync({ type: 'blob' });
}

function generateReadme(): string {
  return `
Business Data Export
===================

Generated: ${new Date().toISOString()}

This package contains a complete export of your business data:

Files Included:
- products.csv: Product catalog in CSV format
- products.json: Product catalog in JSON format
- documents.json: All generated documents
- scraped_data.json: Market research and scraped data

File Formats:
- CSV: Comma-separated values, compatible with Excel and Google Sheets
- JSON: JavaScript Object Notation, compatible with most programming languages

For support, please contact your system administrator.
`;
}

export async function downloadExport(exportId: string) {
  const blob = await generateExport(exportId);

  const { data: exportRecord } = await supabase
    .from('exports')
    .select('*')
    .eq('id', exportId)
    .single();

  if (!exportRecord) throw new Error('Export not found');

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `export_${exportRecord.export_type}_${Date.now()}.${exportRecord.format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
