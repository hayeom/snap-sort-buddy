export interface CaptureItem {
  id: string;
  title: string;
  summary: string;
  category: 'news' | 'recipe' | 'shopping' | 'study' | 'misc';
  extractedText: string;
  relatedLinks: string[];
  date: Date;
  imageUrl?: string;
  fileName?: string;
  fileSize?: number;
  processingStatus: 'pending' | 'processing' | 'completed' | 'error';
  tags?: string[];
}

export interface CaptureUploadResult {
  success: boolean;
  data?: CaptureItem;
  error?: string;
}