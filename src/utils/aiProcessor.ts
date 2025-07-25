import { pipeline } from '@huggingface/transformers';
import Tesseract from 'tesseract.js';

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

// Real OCR using Tesseract.js
export async function extractTextFromImage(file: File): Promise<string> {
  try {
    console.log('🔍 실제 OCR 텍스트 추출 시작...');
    
    const { data: { text } } = await Tesseract.recognize(
      file,
      'kor+eng+jpn+chi_sim+chi_tra+tha', // 한국어 + 영어 + 일본어 + 중국어(간체/번체) + 태국어 지원
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR 진행률: ${(m.progress * 100).toFixed(1)}%`);
          }
        }
      }
    );
    
    // 추출된 텍스트 정리
    const cleanedText = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
    
    console.log('✅ OCR 텍스트 추출 완료');
    
    if (cleanedText.length < 10) {
      return `이미지에서 텍스트를 감지할 수 없습니다.
파일명: ${file.name}
크기: ${(file.size / 1024).toFixed(1)}KB
업로드 시간: ${new Date().toLocaleString('ko-KR')}

텍스트가 포함된 이미지를 업로드해주세요.`;
    }
    
    return cleanedText;
  } catch (error) {
    console.error('OCR 오류:', error);
    return `OCR 처리 중 오류가 발생했습니다.
파일명: ${file.name}
오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}

다시 시도해주세요.`;
  }
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