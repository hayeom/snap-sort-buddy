import { CaptureItem } from '@/types/capture';
import { 
  extractTextFromImage, 
  classifyText, 
  generateSummary, 
  extractRelevantLinks, 
  generateTags,
  initializeAI 
} from './aiProcessor';

// Initialize AI when the module loads
let aiInitialized = false;
export const ensureAIInitialized = async () => {
  if (!aiInitialized) {
    console.log('Initializing AI for the first time...');
    aiInitialized = await initializeAI();
  }
  return aiInitialized;
};

// Enhanced AI-powered capture processing
export const processCaptureFile = async (file: File): Promise<CaptureItem> => {
  // File validation
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('파일 크기가 너무 큽니다. 10MB 이하의 파일을 업로드해주세요.');
  }

  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!supportedTypes.includes(file.type)) {
    throw new Error('지원하지 않는 파일 형식입니다. JPEG, PNG, WebP, GIF 파일을 업로드해주세요.');
  }

  // Ensure AI is initialized
  await ensureAIInitialized();

  // Create image URL for display
  const imageUrl = URL.createObjectURL(file);
  
  console.log('🤖 AI 분석 시작:', file.name);
  
  // Step 1: Extract text from image (OCR simulation)
  console.log('📝 텍스트 추출 중...');
  const extractedText = await extractTextFromImage(file);
  
  // Step 2: Classify the content using AI
  console.log('🎯 카테고리 분류 중...');
  const classification = await classifyText(extractedText);
  
  // Step 3: Generate smart summary
  console.log('📋 요약 생성 중...');
  const summary = await generateSummary(extractedText, classification.category);
  
  // Step 4: Extract relevant links
  console.log('🔗 관련 링크 검색 중...');
  const relatedLinks = await extractRelevantLinks(extractedText, classification.category);
  
  // Step 5: Generate smart tags
  console.log('🏷️ 태그 생성 중...');
  const tags = await generateTags(extractedText, classification.category);
  
  // Create title based on classification
  const categoryLabels = {
    recipe: '레시피',
    news: '뉴스',
    shopping: '쇼핑',
    study: '학습',
    misc: '메모'
  };
  
  const title = `${categoryLabels[classification.category]} - ${file.name.replace(/\.[^/.]+$/, '')}`;
  
  console.log('✅ AI 분석 완료:', {
    category: classification.category,
    confidence: `${(classification.confidence * 100).toFixed(1)}%`,
    tags: tags.length
  });

  const captureItem: CaptureItem = {
    id: `capture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title,
    summary: `${summary} (AI 신뢰도: ${(classification.confidence * 100).toFixed(1)}%)`,
    category: classification.category,
    extractedText: `🤖 AI 분석 결과:\n분류 이유: ${classification.reasoning}\n\n📝 추출된 내용:\n${extractedText}`,
    relatedLinks,
    date: new Date(),
    imageUrl,
    fileName: file.name,
    fileSize: file.size,
    processingStatus: 'completed',
    tags: [...tags, `AI-${classification.category}`, `신뢰도-${(classification.confidence * 100).toFixed(0)}%`]
  };

  return captureItem;
};

// 카테고리별 제안 키워드
export const getCategoryKeywords = (category: CaptureItem['category']): string[] => {
  const keywords = {
    news: ['뉴스', '기사', '사건', '발표', '정치', '경제', '사회'],
    recipe: ['레시피', '요리', '음식', '재료', '조리법', '맛집'],
    shopping: ['쇼핑', '할인', '가격', '구매', '제품', '리뷰'],
    study: ['학습', '공부', '강의', '자료', '책', '노트'],
    misc: ['메모', '기타', '정보', '개인', '일반']
  };
  return keywords[category] || keywords.misc;
};

// 검색 개선을 위한 함수
export const searchCaptureItems = (items: CaptureItem[], query: string): CaptureItem[] => {
  if (!query.trim()) return items;

  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
  
  return items.filter(item => {
    const searchableText = [
      item.title,
      item.summary,
      item.extractedText,
      item.fileName || '',
      ...(item.tags || []),
      ...item.relatedLinks
    ].join(' ').toLowerCase();

    return searchTerms.every(term => searchableText.includes(term));
  });
};