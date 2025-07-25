import { useState, useEffect } from 'react';
import { CaptureUpload } from '@/components/CaptureUpload';
import { CategoryCard } from '@/components/CategoryCard';
import { FilterTabs } from '@/components/FilterTabs';
import { SearchBar } from '@/components/SearchBar';
import { Sparkles, Zap, Plus, Download, Trash2, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OpenAISettings } from '@/components/OpenAISettings';
import { useToast } from '@/components/ui/use-toast';
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
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [captureData, setCaptureData] = useLocalStorage<CaptureItem[]>('snap-sort-captures', mockCaptureData);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleDeleteItem = (id: string) => {
    setCaptureData(prev => prev.filter(item => item.id !== id));
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
    <div className="min-h-screen bg-background">
      {/* Header with Upload Menu */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-glass border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">Snap Sort Buddy</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              {captureData.length}개 저장됨
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <OpenAISettings />
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExportData}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              내보내기
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  전체삭제
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    모든 캡쳐 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAllData} className="bg-red-600 hover:bg-red-700">
                    삭제
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="default" 
                  size="sm"
                  disabled={isUploading}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {isUploading ? '업로드 중...' : '캡쳐 업로드'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-4 bg-gradient-glass backdrop-blur-glass border-white/10">
                <CaptureUpload onFileUpload={handleFileUpload} />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-95" />
        
        <div className="relative container mx-auto px-4 py-24 text-center text-white">
          <div className="flex items-center justify-center gap-3 mb-8 animate-fade-in-up">
            <Sparkles className="h-10 w-10 animate-pulse-glow text-primary-variant" />
            <h1 className="text-5xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-white via-white to-primary-variant bg-clip-text text-transparent">
              Snap Sort Buddy
            </h1>
            <Zap className="h-10 w-10 animate-pulse-glow text-primary-variant" />
          </div>
          
          <p className="text-xl md:text-2xl text-white/95 mb-12 max-w-4xl mx-auto font-light leading-relaxed animate-fade-in-up">
            스마트폰 캡쳐를 AI가 자동으로 분석하고 <br className="hidden md:block" />
            주제별로 정리해주는 똑똑한 도우미
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mb-16 animate-scale-in-soft">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-glass px-6 py-3 rounded-2xl border border-white/20 shadow-glass hover:bg-white/15 transition-all duration-300">
              <span className="text-2xl">🤖</span>
              <span className="font-medium">AI 자동 분석</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-glass px-6 py-3 rounded-2xl border border-white/20 shadow-glass hover:bg-white/15 transition-all duration-300">
              <span className="text-2xl">📱</span>
              <span className="font-medium">원본 자동 삭제</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-glass px-6 py-3 rounded-2xl border border-white/20 shadow-glass hover:bg-white/15 transition-all duration-300">
              <span className="text-2xl">🔍</span>
              <span className="font-medium">빠른 검색</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="container mx-auto px-4 pb-16">
        <div className="space-y-10">
          {/* Search and Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between p-6 bg-gradient-glass backdrop-blur-glass rounded-2xl border border-white/10 shadow-glass">
            <SearchBar onSearch={setSearchQuery} />
            <div className="w-full lg:w-auto">
              <FilterTabs 
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                counts={categoryCounts}
              />
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredData.map((item, index) => (
              <div 
                key={item.id} 
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CategoryCard 
                  {...item} 
                  onDelete={() => handleDeleteItem(item.id)}
                />
              </div>
            ))}
          </div>

          {filteredData.length === 0 && captureData.length > 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
              <p className="text-muted-foreground text-sm">
                다른 키워드로 검색하거나 필터를 변경해보세요.
              </p>
            </div>
          )}

          {captureData.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="text-lg font-semibold mb-2">캡쳐된 내용이 없습니다</h3>
              <p className="text-muted-foreground text-sm">
                상단의 '캡쳐 업로드' 버튼을 눌러 첫 번째 캡쳐를 업로드해보세요!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;