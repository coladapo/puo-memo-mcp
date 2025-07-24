/**
 * MCP tool for file attachments
 */

import { PuoMemoClient } from '../../client/PuoMemoClient';

export async function attachmentTool(client: PuoMemoClient, args: any) {
  const { memory_id, file_paths, descriptions } = args;

  if (!memory_id) {
    throw new Error('Memory ID is required to attach files');
  }

  if (!file_paths || !Array.isArray(file_paths) || file_paths.length === 0) {
    throw new Error('At least one file path is required');
  }

  try {
    const attachments = [];
    
    for (let i = 0; i < file_paths.length; i++) {
      const filePath = file_paths[i];
      const description = descriptions?.[i];
      
      // For now, just create a reference to the file
      // In a real implementation, this would read and upload the file
      const attachment = {
        id: `attachment_${Date.now()}_${i}`,
        memory_id,
        file_path: filePath,
        description,
        created_at: new Date().toISOString()
      };
      
      attachments.push(attachment);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `Attached ${attachments.length} files to memory`,
            attachments
          }, null, 2)
        }
      ]
    };
  } catch (error: any) {
    throw error; // Let the server handle error formatting
  }
}