import { CaptureItem } from '@/types/capture';

// 임시 AI 분석 시뮬레이션 함수
export const processCaptureFile = async (file: File): Promise<CaptureItem> => {
  // 파일 크기 제한 체크 (10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('파일 크기가 너무 큽니다. 10MB 이하의 파일을 업로드해주세요.');
  }

  // 지원하는 파일 형식 체크
  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!supportedTypes.includes(file.type)) {
    throw new Error('지원하지 않는 파일 형식입니다. JPEG, PNG, WebP, GIF 파일을 업로드해주세요.');
  }

  // 이미지 URL 생성
  const imageUrl = URL.createObjectURL(file);

  // 파일명에서 간단한 분류 추측
  const fileName = file.name.toLowerCase();
  let category: CaptureItem['category'] = 'misc';
  let title = file.name.replace(/\.[^/.]+$/, ''); // 확장자 제거

  // 간단한 키워드 기반 분류
  if (fileName.includes('recipe') || fileName.includes('food') || fileName.includes('요리')) {
    category = 'recipe';
    title = '레시피 - ' + title;
  } else if (fileName.includes('news') || fileName.includes('뉴스')) {
    category = 'news';
    title = '뉴스 - ' + title;
  } else if (fileName.includes('shop') || fileName.includes('쇼핑') || fileName.includes('price')) {
    category = 'shopping';
    title = '쇼핑 - ' + title;
  } else if (fileName.includes('study') || fileName.includes('학습') || fileName.includes('book')) {
    category = 'study';
    title = '학습 - ' + title;
  }

  // 시뮬레이션된 처리 지연
  await new Promise(resolve => setTimeout(resolve, 2000));

  const captureItem: CaptureItem = {
    id: `capture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title,
    summary: `${file.name} 파일에서 추출된 내용입니다. 실제 AI 분석을 위해서는 Supabase 연동 후 AI API를 설정해주세요.`,
    category,
    extractedText: `파일명: ${file.name}\n크기: ${(file.size / 1024).toFixed(1)}KB\n형식: ${file.type}\n업로드 시간: ${new Date().toLocaleString('ko-KR')}\n\n※ 실제 텍스트 추출을 위해서는 OCR API 연동이 필요합니다.`,
    relatedLinks: [],
    date: new Date(),
    imageUrl,
    fileName: file.name,
    fileSize: file.size,
    processingStatus: 'completed',
    tags: [category, '업로드됨']
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