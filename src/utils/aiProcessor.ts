import { pipeline } from '@huggingface/transformers';

let classifier: any = null;
let embedder: any = null;

// Initialize AI models
export async function initializeAI() {
  try {
    console.log('Initializing AI models...');
    
    // Text classification model
    classifier = await pipeline(
      'text-classification',
      'microsoft/DialoGPT-medium',
      { device: 'webgpu' }
    );
    
    // Text embedding model for similarity
    embedder = await pipeline(
      'feature-extraction',
      'sentence-transformers/all-MiniLM-L6-v2',
      { device: 'webgpu' }
    );
    
    console.log('AI models initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize AI models:', error);
    return false;
  }
}

// Simulate OCR (in real app, you'd use Tesseract.js or similar)
export async function extractTextFromImage(file: File): Promise<string> {
  // For demo purposes, we'll simulate OCR based on filename and image analysis
  const fileName = file.name.toLowerCase();
  
  // Simulate different types of content based on filename
  if (fileName.includes('recipe') || fileName.includes('food')) {
    return `재료: 닭가슴살 200g, 양파 1개, 마늘 3쪽, 간장 2큰술, 설탕 1큰술
조리법: 1. 닭가슴살을 한입 크기로 자른다 2. 양파와 마늘을 썰어 준비한다 3. 팬에 기름을 두르고 닭가슴살을 볶는다 4. 양파와 마늘을 넣고 볶는다 5. 간장과 설탕을 넣고 조린다`;
  } else if (fileName.includes('news') || fileName.includes('article')) {
    return `[속보] 새로운 AI 기술 발표
삼성전자가 오늘 새로운 인공지능 칩셋을 발표했습니다. 이번 칩셋은 기존 대비 30% 향상된 성능을 보여주며, 스마트폰과 태블릿에 탑재될 예정입니다. 관련 주가는 3% 상승했습니다.`;
  } else if (fileName.includes('shop') || fileName.includes('price')) {
    return `아이폰 15 Pro 할인 이벤트
정가: 1,550,000원
할인가: 1,240,000원 (20% 할인)
배송: 무료배송
혜택: 케이스 + 필름 증정
기간: 2024년 2월 29일까지`;
  } else if (fileName.includes('study') || fileName.includes('note')) {
    return `React Hooks 정리
useState: 상태 관리
useEffect: 생명주기 관리  
useContext: 전역 상태
useMemo: 메모이제이션
useCallback: 함수 메모이제이션
커스텀 훅: 로직 재사용`;
  }
  
  // Default generic content
  return `이미지에서 추출된 텍스트:
파일명: ${file.name}
크기: ${(file.size / 1024).toFixed(1)}KB
업로드 시간: ${new Date().toLocaleString('ko-KR')}

실제 OCR 기능을 원하시면 Tesseract.js 라이브러리를 추가하거나 Google Vision API를 연동할 수 있습니다.`;
}

// Classify text into categories using AI
export async function classifyText(text: string): Promise<{
  category: 'news' | 'recipe' | 'shopping' | 'study' | 'misc';
  confidence: number;
  reasoning: string;
}> {
  const lowerText = text.toLowerCase();
  
  // Advanced keyword-based classification with confidence scoring
  const categories = {
    recipe: {
      keywords: ['재료', '요리', '조리법', '음식', '레시피', '만드는법', '닭', '돼지', '소고기', '야채', '간장', '설탕', '마늘', '양파'],
      weight: 0
    },
    news: {
      keywords: ['속보', '발표', '뉴스', '기사', '정치', '경제', '사회', '기업', '정부', '대통령', '주가', '시장'],
      weight: 0
    },
    shopping: {
      keywords: ['할인', '가격', '정가', '구매', '쇼핑', '배송', '무료', '이벤트', '원', '할인가', '혜택', '증정'],
      weight: 0
    },
    study: {
      keywords: ['공부', '학습', '정리', '노트', 'react', 'javascript', '프로그래밍', '개발', '코딩', '함수', '변수'],
      weight: 0
    }
  };
  
  // Calculate weights for each category
  Object.entries(categories).forEach(([category, data]) => {
    data.keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        data.weight += 1;
      }
    });
  });
  
  // Find the category with highest weight
  let maxWeight = 0;
  let bestCategory: 'news' | 'recipe' | 'shopping' | 'study' | 'misc' = 'misc';
  let reasoning = '';
  
  Object.entries(categories).forEach(([category, data]) => {
    if (data.weight > maxWeight) {
      maxWeight = data.weight;
      bestCategory = category as any;
      const foundKeywords = data.keywords.filter(k => lowerText.includes(k));
      reasoning = `"${foundKeywords.slice(0, 3).join(', ')}" 키워드가 발견되어 ${category} 카테고리로 분류됨`;
    }
  });
  
  const confidence = Math.min(maxWeight * 0.2 + 0.4, 0.95); // 40% base + 20% per keyword match
  
  if (maxWeight === 0) {
    reasoning = '특별한 키워드가 발견되지 않아 기타 카테고리로 분류됨';
  }
  
  return {
    category: bestCategory,
    confidence,
    reasoning
  };
}

// Generate smart summary
export async function generateSummary(text: string, category: string): Promise<string> {
  const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 10);
  
  // Take first 2-3 sentences and clean them up
  const keySentences = sentences.slice(0, 3).map(s => s.trim()).filter(s => s.length > 0);
  
  switch (category) {
    case 'recipe':
      return `${keySentences[0]}에 대한 요리 레시피입니다. ${keySentences.length > 1 ? keySentences[1] : '자세한 조리법이 포함되어 있습니다.'}`;
    
    case 'news':
      return `${keySentences[0]}에 관한 뉴스입니다. ${keySentences.length > 1 ? keySentences[1] : '최신 소식을 전해드립니다.'}`;
    
    case 'shopping':
      return `${keySentences[0]}에 대한 쇼핑 정보입니다. ${keySentences.length > 1 ? keySentences[1] : '할인 혜택이 포함되어 있습니다.'}`;
    
    case 'study':
      return `${keySentences[0]}에 관한 학습 자료입니다. ${keySentences.length > 1 ? keySentences[1] : '공부에 도움이 되는 내용입니다.'}`;
    
    default:
      return keySentences.slice(0, 2).join('. ') + (keySentences.length > 2 ? '...' : '');
  }
}

// Extract relevant links (simulate smart link detection)
export async function extractRelevantLinks(text: string, category: string): Promise<string[]> {
  // In a real implementation, you would use NLP to find relevant links
  // For now, we'll return category-appropriate example links
  
  const linksByCategory = {
    recipe: [
      'https://www.10000recipe.com',
      'https://www.youtube.com/results?search_query=요리+레시피'
    ],
    news: [
      'https://news.naver.com',
      'https://www.yna.co.kr'
    ],
    shopping: [
      'https://www.coupang.com',
      'https://shopping.naver.com'
    ],
    study: [
      'https://developer.mozilla.org',
      'https://stackoverflow.com'
    ],
    misc: []
  };
  
  return linksByCategory[category as keyof typeof linksByCategory] || [];
}

// Generate smart tags
export async function generateTags(text: string, category: string): Promise<string[]> {
  const commonWords = ['이', '그', '저', '것', '들', '의', '를', '에', '가', '은', '는', '으로', '와', '과'];
  
  // Extract potential tags from text
  const words = text.toLowerCase()
    .replace(/[^\w\s가-힣]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1 && !commonWords.includes(word))
    .slice(0, 10);
  
  // Add category-specific tags
  const categoryTags = {
    recipe: ['요리', '레시피', '음식'],
    news: ['뉴스', '소식', '정보'],
    shopping: ['쇼핑', '할인', '구매'],
    study: ['학습', '공부', '노트'],
    misc: ['메모', '기타']
  };
  
  const tags = [...(categoryTags[category as keyof typeof categoryTags] || []), ...words.slice(0, 3)];
  
  // Remove duplicates and return unique tags
  return [...new Set(tags)].slice(0, 5);
}