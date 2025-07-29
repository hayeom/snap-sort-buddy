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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/5">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <img 
                  src={heroImage} 
                  alt="Snap Sort Buddy Hero" 
                  className="w-32 h-32 rounded-3xl shadow-2xl object-cover border-4 border-white/20"
                />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent mb-4">
              Snap Sort Buddy
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              스크린샷을 스마트하게 분류하고 관리하세요. AI가 자동으로 내용을 분석하여 
              카테고리별로 정리해드립니다.
            </p>

            {/* Status Bar */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span>{isOnline ? '온라인' : '오프라인'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4" />
                <span>{user ? user.email : '게스트'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                <span>{captureData.length}개 캡쳐</span>
              </div>
              
              {syncStatus && (
                <div className="flex items-center gap-2 text-blue-500">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span>{syncStatus}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <AuthDialog
                user={user}
                onSignIn={signIn}
                onSignUp={signUp}
                onSignOut={signOut}
              />
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Zap className="w-4 h-4 mr-2" />
                    AI 설정
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <OpenAISettings />
                </PopoverContent>
              </Popover>

              <Button onClick={handleExportData} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                내보내기
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    전체 삭제
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>모든 데이터를 삭제하시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                      이 작업은 되돌릴 수 없습니다. 모든 캡쳐 데이터가 영구적으로 삭제됩니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAllData}>
                      삭제
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className="mb-8">
          <CaptureUpload onFileUpload={handleFileUpload} />
        </div>

        {/* Auto Capture Section */}
        <div className="mb-8">
          <AutoCapture onNewCapture={(item) => setCaptureData(prev => [item, ...prev])} />
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <SearchBar 
            onSearch={setSearchQuery}
            placeholder="캡쳐 내용, 제목, 태그로 검색..."
          />
          <FilterTabs 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter}
            counts={categoryCounts}
          />
        </div>

        {/* Results */}
        <div className="space-y-4">
          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                {searchQuery || activeFilter !== 'all' 
                  ? '검색 결과가 없습니다' 
                  : '첫 캡쳐를 추가해보세요'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || activeFilter !== 'all'
                  ? '다른 검색어나 필터를 사용해보세요'
                  : '스크린샷을 업로드하거나 자동 캡쳐를 시작하세요'}
              </p>
            </div>
          ) : (
            filteredData.map((item) => (
              <CategoryCard 
                key={item.id} 
                {...item}
                onDelete={() => handleDeleteItem(item.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;