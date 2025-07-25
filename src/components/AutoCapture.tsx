import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, 
  Play, 
  Pause, 
  Trash2, 
  FolderOpen, 
  AlertCircle,
  CheckCircle,
  Eye,
  Smartphone
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { screenshotMonitor, ScreenshotFile } from '@/utils/screenshotMonitor';
import { processCaptureFile } from '@/utils/captureProcessor';
import { CaptureItem } from '@/types/capture';
import { Capacitor } from '@capacitor/core';

interface AutoCaptureProps {
  onNewCapture: (item: CaptureItem) => void;
}

export const AutoCapture = ({ onNewCapture }: AutoCaptureProps) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [recentScreenshots, setRecentScreenshots] = useState<ScreenshotFile[]>([]);
  const [processingQueue, setProcessingQueue] = useState<string[]>([]);
  const [autoDelete, setAutoDelete] = useState(true);
  const [isNativeApp, setIsNativeApp] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsNativeApp(Capacitor.isNativePlatform());
    
    if (Capacitor.isNativePlatform()) {
      initializeMonitor();
      loadRecentScreenshots();
    }
  }, []);

  const initializeMonitor = async () => {
    const success = await screenshotMonitor.initialize();
    if (!success) {
      toast({
        title: "모니터링 초기화 실패",
        description: "스크린샷 폴더에 접근할 수 없습니다.",
        variant: "destructive",
      });
    }
  };

  const loadRecentScreenshots = async () => {
    try {
      const recent = await screenshotMonitor.getRecentScreenshots(5);
      setRecentScreenshots(recent);
    } catch (error) {
      console.error('최근 스크린샷 로드 실패:', error);
    }
  };

  const startMonitoring = async () => {
    if (!isNativeApp) {
      toast({
        title: "모바일 앱에서만 사용 가능",
        description: "스크린샷 자동 감지는 모바일 앱에서만 지원됩니다.",
        variant: "destructive",
      });
      return;
    }

    setIsMonitoring(true);
    
    await screenshotMonitor.startMonitoring(async (file: ScreenshotFile) => {
      toast({
        title: "새 스크린샷 감지!",
        description: `${file.name} 자동 분석 시작`,
        duration: 3000,
      });

      setProcessingQueue(prev => [...prev, file.name]);
      
      try {
        // ScreenshotFile을 File 객체로 변환
        const blob = await fetch(`data:image/png;base64,${file.data}`).then(r => r.blob());
        const fileObj = new File([blob], file.name, { type: 'image/png' });
        
        const processedItem = await processCaptureFile(fileObj);
        onNewCapture(processedItem);
        
        // 자동 삭제 옵션이 켜져있으면 원본 삭제
        if (autoDelete) {
          await screenshotMonitor.deleteScreenshot(file);
          toast({
            title: "원본 삭제됨",
            description: `${file.name}이 정리되어 원본이 삭제되었습니다.`,
            duration: 2000,
          });
        }
        
        // 최근 스크린샷 목록 업데이트
        await loadRecentScreenshots();
        
      } catch (error) {
        console.error('스크린샷 처리 실패:', error);
        toast({
          title: "처리 실패",
          description: `${file.name} 분석 중 오류가 발생했습니다.`,
          variant: "destructive",
        });
      } finally {
        setProcessingQueue(prev => prev.filter(name => name !== file.name));
      }
    });

    toast({
      title: "자동 감지 시작!",
      description: "새로운 스크린샷을 자동으로 감지하고 분석합니다.",
    });
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    screenshotMonitor.stopMonitoring();
    toast({
      title: "자동 감지 중지",
      description: "스크린샷 자동 감지를 중지했습니다.",
    });
  };

  const processManually = async (file: ScreenshotFile) => {
    setProcessingQueue(prev => [...prev, file.name]);
    
    try {
      const blob = await fetch(`data:image/png;base64,${file.data}`).then(r => r.blob());
      const fileObj = new File([blob], file.name, { type: 'image/png' });
      
      const processedItem = await processCaptureFile(fileObj);
      onNewCapture(processedItem);
      
      toast({
        title: "수동 처리 완료",
        description: `${file.name}이 성공적으로 분석되었습니다.`,
      });
      
    } catch (error) {
      toast({
        title: "처리 실패",
        description: "파일 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setProcessingQueue(prev => prev.filter(name => name !== file.name));
    }
  };

  if (!isNativeApp) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-6 text-center">
          <Smartphone className="h-12 w-12 mx-auto mb-4 text-orange-500" />
          <h3 className="font-semibold mb-2">모바일 앱 전용 기능</h3>
          <p className="text-sm text-muted-foreground mb-4">
            스크린샷 자동 감지는 모바일 앱에서만 사용할 수 있습니다.
          </p>
          <Button variant="outline" size="sm">
            모바일 앱 다운로드 가이드 보기
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 메인 컨트롤 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            스크린샷 자동 정리
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="monitoring">자동 감지</Label>
              <p className="text-sm text-muted-foreground">
                새로운 스크린샷을 자동으로 감지하고 분석합니다
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isMonitoring ? "default" : "secondary"}>
                {isMonitoring ? "실행 중" : "중지됨"}
              </Badge>
              <Button
                variant={isMonitoring ? "destructive" : "default"}
                size="sm"
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
                className="flex items-center gap-2"
              >
                {isMonitoring ? (
                  <>
                    <Pause className="h-4 w-4" />
                    중지
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    시작
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auto-delete">원본 자동 삭제</Label>
              <p className="text-sm text-muted-foreground">
                정리 완료 후 원본 스크린샷을 자동으로 삭제합니다
              </p>
            </div>
            <Switch
              id="auto-delete"
              checked={autoDelete}
              onCheckedChange={setAutoDelete}
            />
          </div>

          {processingQueue.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">
                  {processingQueue.length}개 파일 처리 중...
                </span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 최근 스크린샷 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            최근 스크린샷
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentScreenshots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>최근 스크린샷이 없습니다</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {recentScreenshots.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)}KB • {new Date(file.modifiedTime).toLocaleString('ko-KR')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {processingQueue.includes(file.name) ? (
                      <Badge variant="secondary">처리 중...</Badge>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => processManually(file)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          분석
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};