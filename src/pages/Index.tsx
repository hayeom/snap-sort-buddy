import { useState } from 'react';
import { CaptureUpload } from '@/components/CaptureUpload';
import { CategoryCard } from '@/components/CategoryCard';
import { FilterTabs } from '@/components/FilterTabs';
import { SearchBar } from '@/components/SearchBar';
import { Sparkles, Zap } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';

// Mock data for demonstration
const mockCaptureData = [
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
    imageUrl: undefined
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
    imageUrl: undefined
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
    imageUrl: undefined
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
    imageUrl: undefined
  },
  {
    id: '5',
    title: '기타 메모 - 회의 내용',
    summary: '팀 회의에서 논의된 주요 안건들',
    category: 'misc' as const,
    extractedText: '다음 주 프로젝트 일정, 새로운 팀원 온보딩, 분기별 목표 설정...',
    relatedLinks: [],
    date: new Date('2024-01-11'),
    imageUrl: undefined
  }
];

const Index = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [captureData] = useState(mockCaptureData);

  // Calculate counts for each category
  const categoryCounts = {
    all: captureData.length,
    news: captureData.filter(item => item.category === 'news').length,
    recipe: captureData.filter(item => item.category === 'recipe').length,
    shopping: captureData.filter(item => item.category === 'shopping').length,
    study: captureData.filter(item => item.category === 'study').length,
    misc: captureData.filter(item => item.category === 'misc').length,
  };

  // Filter and search logic
  const filteredData = captureData.filter(item => {
    const matchesFilter = activeFilter === 'all' || item.category === activeFilter;
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.extractedText.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const handleFileUpload = (file: File) => {
    console.log('File uploaded:', file.name);
    // TODO: Implement AI analysis logic
  };

  return (
    <div className="min-h-screen bg-background">
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

      {/* Upload Section - Compact */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto">
          <CaptureUpload onFileUpload={handleFileUpload} />
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
                <CategoryCard {...item} />
              </div>
            ))}
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="text-lg font-semibold mb-2">캡쳐된 내용이 없습니다</h3>
              <p className="text-muted-foreground text-sm">
                위에서 첫 번째 캡쳐를 업로드해보세요!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;