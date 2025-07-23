import { PDFExporter } from './pdfExporter';
import { FDXExporter } from './fdxExporter';

export interface ExportOptions {
  title?: string;
  author?: string;
  format?: 'pdf' | 'fdx' | 'txt';
}

export interface ExportResult {
  blob: Blob;
  filename: string;
}

export async function exportScript(
  script: string, 
  format: 'pdf' | 'fdx' | 'txt', 
  options: ExportOptions = {}
): Promise<ExportResult> {
  const { title = 'Untitled Script', author = 'ScriptStudio User' } = options;
  const timestamp = new Date().toISOString().slice(0, 10);
  
  switch (format) {
    case 'pdf': {
      const pdfBlob = await PDFExporter.generatePDF(script, { title, author });
      return {
        blob: pdfBlob,
        filename: `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.pdf`
      };
    }
      
    case 'fdx': {
      const fdxContent = FDXExporter.convertScriptToFDX(script, { title, author });
      const fdxBlob = new Blob([fdxContent], { type: 'application/xml' });
      return {
        blob: fdxBlob,
        filename: `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.fdx`
      };
    }
      
    case 'txt':
    default: {
      const txtBlob = new Blob([script], { type: 'text/plain' });
      return {
        blob: txtBlob,
        filename: `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.txt`
      };
    }
  }
}