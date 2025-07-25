import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Key, Sparkles, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface OpenAISettingsProps {
  onApiKeySet?: (apiKey: string) => void;
}

export const OpenAISettings = ({ onApiKeySet }: OpenAISettingsProps) => {
  const [apiKey, setApiKey] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const { toast } = useToast();

  const validateAndSaveApiKey = async () => {
    if (!apiKey.startsWith('sk-')) {
      toast({
        title: "잘못된 API 키",
        description: "OpenAI API 키는 'sk-'로 시작해야 합니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Test the API key with a simple request
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (response.ok) {
        localStorage.setItem('openai_api_key', apiKey);
        setIsValid(true);
        onApiKeySet?.(apiKey);
        toast({
          title: "API 키 설정 완료!",
          description: "이제 고급 AI 분석을 사용할 수 있습니다.",
        });
        setIsOpen(false);
      } else {
        throw new Error('Invalid API key');
      }
    } catch (error) {
      toast({
        title: "API 키 검증 실패",
        description: "API 키가 올바르지 않거나 권한이 없습니다.",
        variant: "destructive",
      });
    }
  };

  const getSavedApiKey = () => {
    return localStorage.getItem('openai_api_key');
  };

  const clearApiKey = () => {
    localStorage.removeItem('openai_api_key');
    setApiKey('');
    setIsValid(false);
    toast({
      title: "API 키 삭제됨",
      description: "기본 AI 분석으로 돌아갑니다.",
    });
  };

  const savedKey = getSavedApiKey();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <Key className="h-4 w-4" />
          {savedKey ? (
            <>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Sparkles className="h-3 w-3 mr-1" />
                고급 AI 활성화됨
              </Badge>
            </>
          ) : (
            'AI 업그레이드'
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            고급 AI 분석 설정
          </DialogTitle>
          <DialogDescription>
            OpenAI API 키를 설정하면 더 정확한 텍스트 분석과 분류를 이용할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">현재 상태</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {savedKey ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Sparkles className="h-3 w-3 mr-1" />
                    고급 AI 활성화됨
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  API 키: sk-***{savedKey.slice(-4)}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearApiKey}
                  className="w-full"
                >
                  API 키 삭제
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Badge variant="outline">기본 AI 사용 중</Badge>
                <p className="text-sm text-muted-foreground">
                  현재 기본 AI 분석을 사용하고 있습니다. OpenAI API를 연결하면 더 정확한 분석이 가능합니다.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {!savedKey && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apikey">OpenAI API 키</Label>
              <Input
                id="apikey"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                API 키는 로컬에만 저장되며 안전하게 관리됩니다.
              </p>
            </div>
            
            <Button 
              onClick={validateAndSaveApiKey}
              disabled={!apiKey}
              className="w-full"
            >
              API 키 설정
            </Button>
            
            <div className="text-center">
              <Button
                variant="link"
                size="sm"
                onClick={() => window.open('https://platform.openai.com/api-keys', '_blank')}
                className="text-xs"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                OpenAI API 키 발급받기
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};