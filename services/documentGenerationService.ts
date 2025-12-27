import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';

export interface DocumentTemplate {
  type: 'contract' | 'invoice' | 'legal' | 'report' | 'proposal';
  title: string;
  sections: Array<{
    title: string;
    content: string;
    variables?: Record<string, string>;
  }>;
}

export interface GenerateDocumentParams {
  ventureId: string;
  type: string;
  title: string;
  content: any;
  variables?: Record<string, any>;
}

const documentTemplates: Record<string, DocumentTemplate> = {
  contract: {
    type: 'contract',
    title: 'Service Agreement',
    sections: [
      {
        title: 'Agreement Details',
        content: 'This Service Agreement ("Agreement") is entered into on {{date}} between {{party1}} and {{party2}}.',
      },
      {
        title: 'Terms and Conditions',
        content: '{{party1}} agrees to provide {{services}} to {{party2}} for the agreed upon compensation of {{amount}}.',
      },
      {
        title: 'Payment Terms',
        content: 'Payment shall be made within {{paymentTerms}} days of invoice date. Late payments will incur a {{lateFee}}% fee.',
      },
      {
        title: 'Termination',
        content: 'Either party may terminate this agreement with {{noticePeriod}} days written notice.',
      },
    ],
  },
  invoice: {
    type: 'invoice',
    title: 'Invoice',
    sections: [
      {
        title: 'Invoice Information',
        content: 'Invoice #{{invoiceNumber}} \nDate: {{date}} \nDue Date: {{dueDate}}',
      },
      {
        title: 'Bill To',
        content: '{{customerName}} \n{{customerAddress}} \n{{customerEmail}}',
      },
      {
        title: 'Items',
        content: '{{items}}',
      },
      {
        title: 'Total',
        content: 'Subtotal: ${{subtotal}} \nTax ({{taxRate}}%): ${{tax}} \nTotal: ${{total}}',
      },
    ],
  },
  legal: {
    type: 'legal',
    title: 'Terms of Service',
    sections: [
      {
        title: 'Acceptance of Terms',
        content: 'By accessing or using {{companyName}}, you agree to be bound by these Terms of Service.',
      },
      {
        title: 'User Obligations',
        content: 'Users must provide accurate information and comply with all applicable laws and regulations.',
      },
      {
        title: 'Limitation of Liability',
        content: '{{companyName}} shall not be liable for any indirect, incidental, special, or consequential damages.',
      },
      {
        title: 'Governing Law',
        content: 'These terms shall be governed by the laws of {{jurisdiction}}.',
      },
    ],
  },
  report: {
    type: 'report',
    title: 'Business Report',
    sections: [
      {
        title: 'Executive Summary',
        content: '{{summary}}',
      },
      {
        title: 'Key Findings',
        content: '{{findings}}',
      },
      {
        title: 'Recommendations',
        content: '{{recommendations}}',
      },
      {
        title: 'Conclusion',
        content: '{{conclusion}}',
      },
    ],
  },
  proposal: {
    type: 'proposal',
    title: 'Business Proposal',
    sections: [
      {
        title: 'Overview',
        content: '{{companyName}} is pleased to submit this proposal for {{projectName}}.',
      },
      {
        title: 'Scope of Work',
        content: '{{scopeOfWork}}',
      },
      {
        title: 'Timeline',
        content: 'Project Duration: {{timeline}} \nStart Date: {{startDate}} \nCompletion Date: {{completionDate}}',
      },
      {
        title: 'Investment',
        content: 'Total Investment: ${{totalCost}} \nPayment Schedule: {{paymentSchedule}}',
      },
    ],
  },
};

function replaceVariables(content: string, variables: Record<string, any>): string {
  let result = content;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  }
  return result;
}

export async function generateDocument(params: GenerateDocumentParams): Promise<any> {
  const { ventureId, type, title, content, variables = {} } = params;

  const template = documentTemplates[type] || documentTemplates.report;
  const defaultVariables = {
    date: new Date().toLocaleDateString(),
    ...variables,
  };

  const processedSections = template.sections.map((section) => ({
    title: section.title,
    content: replaceVariables(section.content, defaultVariables),
  }));

  const { data, error } = await supabase
    .from('documents')
    .insert({
      venture_id: ventureId,
      type,
      title: title || template.title,
      content: { sections: processedSections, variables: defaultVariables },
      status: 'draft',
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function generatePDF(documentId: string): Promise<Blob> {
  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (error) throw error;

  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  pdf.setFontSize(20);
  pdf.text(document.title, margin, y);
  y += 15;

  pdf.setFontSize(10);
  pdf.text(`Created: ${new Date(document.created_at).toLocaleDateString()}`, margin, y);
  y += 10;

  const sections = document.content?.sections || [];
  for (const section of sections) {
    if (y > 270) {
      pdf.addPage();
      y = 20;
    }

    pdf.setFontSize(14);
    pdf.text(section.title, margin, y);
    y += 8;

    pdf.setFontSize(10);
    const lines = pdf.splitTextToSize(section.content, pageWidth - 2 * margin);
    for (const line of lines) {
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(line, margin, y);
      y += 6;
    }
    y += 5;
  }

  return pdf.output('blob');
}

export async function listDocuments(ventureId: string) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('venture_id', ventureId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateDocument(documentId: string, updates: any) {
  const { data, error } = await supabase
    .from('documents')
    .update(updates)
    .eq('id', documentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDocument(documentId: string) {
  const { error } = await supabase.from('documents').delete().eq('id', documentId);

  if (error) throw error;
}
