import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { CaptureItem } from '@/types/capture';
import type { User } from '@supabase/supabase-js';

export function useCloudSync(user: User | null) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncToCloud = async (items: CaptureItem[]) => {
    if (!user || !isOnline) return;

    setSyncStatus('syncing');
    try {
      // Convert CaptureItem to database format
      const dbItems = items.map(item => ({
        id: item.id,
        user_id: user.id,
        title: item.title,
        summary: item.summary,
        category: item.category,
        extracted_text: item.extractedText,
        related_links: item.relatedLinks,
        date: item.date.toISOString(),
        image_url: item.imageUrl,
        file_name: item.fileName,
        file_size: item.fileSize,
        processing_status: item.processingStatus,
        tags: item.tags,
        updated_at: new Date().toISOString(),
      }));

      // Upsert items (insert or update if exists)
      const { error } = await supabase
        .from('capture_items')
        .upsert(dbItems, { onConflict: 'id' });

      if (error) throw error;
      setSyncStatus('idle');
    } catch (error) {
      console.error('Sync to cloud failed:', error);
      setSyncStatus('error');
    }
  };

  const syncFromCloud = async (): Promise<CaptureItem[]> => {
    if (!user || !isOnline) return [];

    setSyncStatus('syncing');
    try {
      const { data, error } = await supabase
        .from('capture_items')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Convert database format to CaptureItem
      const items: CaptureItem[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        category: item.category,
        extractedText: item.extracted_text,
        relatedLinks: item.related_links,
        date: new Date(item.date),
        imageUrl: item.image_url,
        fileName: item.file_name,
        fileSize: item.file_size,
        processingStatus: item.processing_status,
        tags: item.tags,
      }));

      setSyncStatus('idle');
      return items;
    } catch (error) {
      console.error('Sync from cloud failed:', error);
      setSyncStatus('error');
      return [];
    }
  };

  const deleteFromCloud = async (itemId: string) => {
    if (!user || !isOnline) return;

    try {
      const { error } = await supabase
        .from('capture_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Delete from cloud failed:', error);
      throw error;
    }
  };

  return {
    isOnline,
    syncStatus,
    syncToCloud,
    syncFromCloud,
    deleteFromCloud,
  };
}