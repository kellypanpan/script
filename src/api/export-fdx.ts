import { FDXExporter, FDXExportOptions } from '../utils/fdxExporter';
import { z } from 'zod';

// Request validation schema
const ExportFDXSchema = z.object({
  script: z.string().min(10, 'Script content too short'),
  title: z.string().optional(),
  author: z.string().optional(),
  includeNotes: z.boolean().optional(),
  fontSize: z.number().min(8).max(24).optional(),
});

// Response interface
interface ExportFDXResponse {
  success: boolean;
  downloadUrl?: string;
  filename?: string;
  error?: string;
  message?: string;
}

export async function POST(req: Request): Promise<Response> {
  try {
    // 1. Validate request body
    const body = await req.json();
    const parsed = ExportFDXSchema.parse(body);
    
    // 2. Check user permissions (Pro/Studio only)
    // TODO: Implement proper authentication
    const userPlan = req.headers.get('x-user-plan') || 'free';
    
    if (userPlan === 'free') {
      return Response.json({
        success: false,
        error: 'FDX export is available for Pro and Studio users only',
        message: 'Upgrade your plan to export to Final Draft format'
      } as ExportFDXResponse, { status: 403 });
    }

    // 3. Convert script to FDX
    const options: FDXExportOptions = {
      title: parsed.title,
      author: parsed.author,
      includeNotes: parsed.includeNotes,
      fontSize: parsed.fontSize,
    };

    const fdxContent = FDXExporter.convertScriptToFDX(parsed.script, options);
    
    // 4. In production, you would upload to cloud storage
    // For now, return the content directly
    const filename = FDXExporter.generateFilename(parsed.title);
    
    // Create blob URL (this would be replaced with cloud storage URL)
    const blob = new Blob([fdxContent], { type: 'application/xml' });
    
    return new Response(blob, {
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Filename': filename,
      },
    });

  } catch (error) {
    console.error('FDX export error:', error);
    
    if (error instanceof z.ZodError) {
      return Response.json({
        success: false,
        error: 'Invalid request data',
        message: error.errors.map(e => e.message).join(', ')
      } as ExportFDXResponse, { status: 400 });
    }

    return Response.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to generate FDX export'
    } as ExportFDXResponse, { status: 500 });
  }
}

// Alternative endpoint that returns download URL instead of direct file
export async function createFDXDownload(script: string, options: FDXExportOptions): Promise<string> {
  try {
    const fdxContent = FDXExporter.convertScriptToFDX(script, options);
    
    // In production, upload to cloud storage and return URL
    // For development, create blob URL
    const blob = new Blob([fdxContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    
    return url;
  } catch (error) {
    console.error('FDX download creation failed:', error);
    throw new Error('Failed to create FDX download');
  }
}

// Usage tracking for analytics
export function trackFDXExport(userId: string, scriptId?: string) {
  try {
    // TODO: Implement analytics tracking
    console.log(`FDX export: userId=${userId}, scriptId=${scriptId}`);
    
    // In production, send to analytics service
    // analytics.track('fdx_export', {
    //   user_id: userId,
    //   script_id: scriptId,
    //   timestamp: new Date().toISOString(),
    // });
  } catch (error) {
    console.error('Failed to track FDX export:', error);
  }
}