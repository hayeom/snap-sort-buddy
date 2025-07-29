import { useState, useEffect } from 'react';
import { CaptureUpload } from '@/components/CaptureUpload';
import { CategoryCard } from '@/components/CategoryCard';
import { FilterTabs } from '@/components/FilterTabs';
import { SearchBar } from '@/components/SearchBar';
import { AutoCapture } from '@/components/AutoCapture';
import { AuthDialog } from '@/components/AuthDialog';
import { Sparkles, Zap, Plus, Download, Trash2, Brain, Wifi, WifiOff, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OpenAISettings } from '@/components/OpenAISettings';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCloudSync } from '@/hooks/useCloudSync';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { processCaptureFile, searchCaptureItems } from '@/utils/captureProcessor';
import { CaptureItem } from '@/types/capture';
import heroImage from '@/assets/hero-image.jpg';

// Mock data for demonstration
const mockCaptureData: CaptureItem[] = [
  {
    id: '1',
    title: 'ChatGPT로 코딩 생산성 향상하기',
    summary: 'AI를 활용한 개발 생산성 향상 방법과 실무 활용 팁',
    category: 'study' as const,
    extractedText: 'ChatGPT를 활용하여 코딩 생산성을 3배 향상시키는 방법. 프롬프트 엔지니어링과 코드 리뷰 자동화...',
    relatedLinks: [
      'https://chat.openai.com',
      'https://github.com/features/copilot'
    ],
    date: new Date('2024-01-15'),
    imageUrl: undefined,
    processingStatus: 'completed',
    tags: ['AI', '개발', '생산성']
  },
  {
    id: '2',
    title: '집에서 만드는 간단한 파스타 레시피',
    summary: '10분 만에 완성하는 맛있는 토마토 파스타 만들기',
    category: 'recipe' as const,
    extractedText: '재료: 파스타면 200g, 토마토소스 300g, 마늘 3쪽, 올리브오일 2큰술, 바질잎...',
    relatedLinks: [
      'https://example.com/pasta-recipe',
      'https://example.com/cooking-tips'
    ],
    date: new Date('2024-01-14'),
    imageUrl: undefined,
    processingStatus: 'completed',
    tags: ['요리', '간단', '파스타']
  },
  {
    id: '3',
    title: '아이폰 15 Pro 할인 정보',
    summary: '온라인 쇼핑몰에서 아이폰 15 Pro 최대 20% 할인 이벤트',
    category: 'shopping' as const,
    extractedText: '아이폰 15 Pro 128GB 모델 정가 1,550,000원에서 20% 할인된 1,240,000원...',
    relatedLinks: [
      'https://example.com/iphone-deal',
      'https://example.com/compare-prices'
    ],
    date: new Date('2024-01-13'),
    imageUrl: undefined,
    processingStatus: 'completed',
    tags: ['아이폰', '할인', '쇼핑']
  },
  {
    id: '4',
    title: '신제품 출시 소식 - 삼성 갤럭시 S25',
    summary: '삼성의 최신 스마트폰 갤럭시 S25 공식 발표',
    category: 'news' as const,
    extractedText: '삼성전자가 갤럭시 S25 시리즈를 공식 발표했습니다. 새로운 AI 기능과 향상된 카메라...',
    relatedLinks: [
      'https://example.com/galaxy-s25-news',
      'https://example.com/samsung-official'
    ],
    date: new Date('2024-01-12'),
    imageUrl: undefined,
    processingStatus: 'completed',
    tags: ['삼성', '갤럭시', '뉴스']
  },
  {
    id: '5',
    title: '기타 메모 - 회의 내용',
    summary: '팀 회의에서 논의된 주요 안건들',
    category: 'misc' as const,
    extractedText: '다음 주 프로젝트 일정, 새로운 팀원 온보딩, 분기별 목표 설정...',
    relatedLinks: [],
    date: new Date('2024-01-11'),
    imageUrl: undefined,
    processingStatus: 'completed',
    tags: ['회의', '업무', '메모']
  }
];

const Index = () => {
  const { toast } = useToast();
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const { isOnline, syncStatus, syncToCloud, syncFromCloud, deleteFromCloud } = useCloudSync(user);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [captureData, setCaptureData] = useLocalStorage<CaptureItem[]>('snap-sort-captures', mockCaptureData);
  const [isUploading, setIsUploading] = useState(false);

  // Sync data when user logs in or comes online
  useEffect(() => {
    const handleSync = async () => {
      if (user && isOnline) {
        try {
          const cloudData = await syncFromCloud();
          if (cloudData.length > 0) {
            // Merge cloud data with local data (cloud data takes precedence)
            const localIds = new Set(captureData.map(item => item.id));
            const newItems = cloudData.filter(item => !localIds.has(item.id));
            const updatedItems = captureData.map(localItem => {
              const cloudItem = cloudData.find(item => item.id === localItem.id);
              return cloudItem || localItem;
            });
            const mergedData = [...updatedItems, ...newItems];
            setCaptureData(mergedData);
            
            if (newItems.length > 0) {
              toast({
                title: "클라우드 동기화 완료",
                description: `${newItems.length}개의 새로운 항목을 동기화했습니다.`,
                duration: 3000,
              });
            }
          }
        } catch (error) {
          console.error('Auto sync failed:', error);
        }
      }
    };

    if (!loading) {
      handleSync();
    }
  }, [user, isOnline, loading]);

  // Auto-sync to cloud when data changes (if user is logged in)
  useEffect(() => {
    if (user && isOnline && captureData.length > 0) {
      const timeoutId = setTimeout(() => {
        syncToCloud(captureData);
      }, 2000); // Debounce sync by 2 seconds

      return () => clearTimeout(timeoutId);
    }
  }, [captureData, user, isOnline]);

  // Calculate counts for each category
  const categoryCounts = {
    all: captureData.length,
    news: captureData.filter(item => item.category === 'news').length,
    recipe: captureData.filter(item => item.category === 'recipe').length,
    shopping: captureData.filter(item => item.category === 'shopping').length,
    study: captureData.filter(item => item.category === 'study').length,
    misc: captureData.filter(item => item.category === 'misc').length,
  };

  // Enhanced filter and search logic
  const filteredData = (() => {
    let filtered = captureData;
    
    // Apply category filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(item => item.category === activeFilter);
    }
    
    // Apply search
    filtered = searchCaptureItems(filtered, searchQuery);
    
    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  })();

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    
    try {
      const newItem = await processCaptureFile(file);
      setCaptureData(prev => [newItem, ...prev]);
      
      toast({
        title: "업로드 완료!",
        description: `${file.name} 파일이 성공적으로 분석되었습니다.`,
        duration: 3000,
      });
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: "업로드 실패",
        description: error instanceof Error ? error.message : "파일 업로드 중 오류가 발생했습니다.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    setCaptureData(prev => prev.filter(item => item.id !== id));
    
    // Also delete from cloud if user is logged in
    if (user && isOnline) {
      try {
        await deleteFromCloud(id);
      } catch (error) {
        console.error('Failed to delete from cloud:', error);
      }
    }
    
    toast({
      title: "삭제 완료",
      description: "캡쳐 항목이 삭제되었습니다.",
      duration: 2000,
    });
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(captureData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `snap-sort-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "내보내기 완료",
      description: "데이터가 JSON 파일로 다운로드되었습니다.",
      duration: 3000,
    });
  };

  const handleClearAllData = () => {
    setCaptureData([]);
    toast({
      title: "데이터 삭제 완료",
      description: "모든 캡쳐 데이터가 삭제되었습니다.",
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Snap Sort Buddy</h1>
        
        <div className="mb-6">
          <p className="text-lg mb-4">
            스크린샷을 스마트하게 분류하고 관리하세요.
          </p>
          
          <div className="flex gap-4 mb-6">
            <div className="text-sm">
              <span>사용자: </span>
              <span className="font-medium">{user ? user.email : '게스트'}</span>
            </div>
            <div className="text-sm">
              <span>캡쳐 개수: </span>
              <span className="font-medium">{captureData.length}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <CaptureUpload onFileUpload={handleFileUpload} />
          
          <AutoCapture onNewCapture={(item) => setCaptureData(prev => [item, ...prev])} />
          
          <SearchBar 
            onSearch={setSearchQuery}
            placeholder="검색..."
          />
          
          <FilterTabs 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter}
            counts={categoryCounts}
          />
          
          <div className="space-y-4">
            {filteredData.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">데이터가 없습니다.</p>
              </div>
            ) : (
              filteredData.map((item) => (
                <div key={item.id} className="border p-4 rounded">
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-gray-600">{item.summary}</p>
                  <button 
                    onClick={() => handleDeleteItem(item.id)}
                    className="mt-2 text-red-500 text-sm"
                  >
                    삭제
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;