import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, Tag, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLinks, setShowLinks] = useState(false);

  return (
    <Card className="group overflow-hidden border-0 shadow-card hover:shadow-elevated transition-all duration-500 hover:-translate-y-2 bg-gradient-glass backdrop-blur-soft rounded-3xl">
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
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <div className="space-y-3">
            <p className={`text-muted-foreground ${isExpanded ? '' : 'line-clamp-2'}`}>
              {summary}
            </p>
            
            <CollapsibleContent className="space-y-3">
              {extractedText && (
                <div className="p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">추출된 텍스트</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {extractedText}
                  </p>
                </div>
              )}
            </CollapsibleContent>
            
            <div className="flex items-center justify-between pt-2">
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-primary hover:text-primary-dark flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  {isExpanded ? '간략히 보기' : '자세히 보기'}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              {relatedLinks.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLinks(!showLinks)}
                  className="text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  링크 ({relatedLinks.length})
                </Button>
              )}
            </div>
            
            {showLinks && relatedLinks.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-muted">
                {relatedLinks.map((link, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-auto p-3 text-left hover:bg-primary/10 rounded-xl"
                    onClick={() => window.open(link, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-2 flex-shrink-0 text-primary" />
                    <span className="text-xs truncate">{link}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </Collapsible>
      </CardContent>
    </Card>
  );
};