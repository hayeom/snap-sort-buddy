import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FilterTabsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  counts: Record<string, number>;
}

const filterConfig = {
  all: { label: '전체', icon: '📱' },
  news: { label: '뉴스', icon: '📰' },
  recipe: { label: '레시피', icon: '🍳' },
  shopping: { label: '쇼핑', icon: '🛒' },
  study: { label: '학습', icon: '📚' },
  misc: { label: '기타', icon: '📋' }
};

export const FilterTabs = ({ activeFilter, onFilterChange, counts }: FilterTabsProps) => {
  return (
    <Tabs value={activeFilter} onValueChange={onFilterChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto p-1 bg-muted/30 backdrop-blur-glass">
        {Object.entries(filterConfig).map(([key, config]) => (
          <TabsTrigger
            key={key}
            value={key}
            className="flex flex-col items-center gap-1 px-3 py-3 data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200"
          >
            <span className="text-lg">{config.icon}</span>
            <span className="text-xs font-medium">{config.label}</span>
            <span className="text-xs opacity-70">
              {counts[key] || 0}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};