import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, Tag } from 'lucide-react';

interface CategoryCardProps {
  id: string;
  title: string;
  summary: string;
  category: 'news' | 'recipe' | 'shopping' | 'study' | 'misc';
  extractedText: string;
  relatedLinks?: string[];
  date: Date;
  imageUrl?: string;
}

const categoryConfig = {
  news: {
    color: 'bg-category-news',
    label: '뉴스',
    icon: '📰'
  },
  recipe: {
    color: 'bg-category-recipe',
    label: '레시피',
    icon: '🍳'
  },
  shopping: {
    color: 'bg-category-shopping',
    label: '쇼핑',
    icon: '🛒'
  },
  study: {
    color: 'bg-category-study',
    label: '학습',
    icon: '📚'
  },
  misc: {
    color: 'bg-category-misc',
    label: '기타',
    icon: '📋'
  }
};

export const CategoryCard = ({
  title,
  summary,
  category,
  extractedText,
  relatedLinks = [],
  date,
  imageUrl
}: CategoryCardProps) => {
  const config = categoryConfig[category];

  return (
    <Card className="group overflow-hidden border-0 shadow-card hover:shadow-floating transition-all duration-300 hover:-translate-y-1 bg-gradient-card backdrop-blur-glass">
      {imageUrl && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <Badge 
            className={`absolute top-3 left-3 ${config.color} text-white border-none shadow-lg`}
          >
            <span className="mr-1">{config.icon}</span>
            {config.label}
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold text-lg line-clamp-2 flex-1">
            {title}
          </h3>
          {!imageUrl && (
            <Badge 
              className={`${config.color} text-white border-none shadow-lg flex-shrink-0`}
            >
              <span className="mr-1">{config.icon}</span>
              {config.label}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {date.toLocaleDateString('ko-KR')}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-muted-foreground line-clamp-3">
          {summary}
        </p>

        {extractedText && (
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">추출된 텍스트</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {extractedText}
            </p>
          </div>
        )}

        {relatedLinks.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              관련 링크
            </p>
            <div className="space-y-1">
              {relatedLinks.slice(0, 2).map((link, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-auto p-2 text-left hover:bg-primary/10"
                  onClick={() => window.open(link, '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-2 flex-shrink-0" />
                  <span className="text-xs truncate">{link}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};