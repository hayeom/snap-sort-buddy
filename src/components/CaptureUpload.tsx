import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Upload, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface CaptureUploadProps {
  onFileUpload: (file: File) => void;
}

export const CaptureUpload = ({ onFileUpload }: CaptureUploadProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setIsProcessing(true);
      onFileUpload(file);
      
      toast({
        title: "캡쳐 분석 중",
        description: "AI가 이미지를 분석하고 있습니다...",
      });

      // Simulate processing time
      setTimeout(() => {
        setIsProcessing(false);
        toast({
          title: "분석 완료!",
          description: "캡쳐가 성공적으로 정리되었습니다.",
        });
      }, 2000);
    }
  }, [onFileUpload, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  });

  return (
    <Card className="relative overflow-hidden border-2 border-dashed border-primary/30 bg-gradient-card backdrop-blur-glass transition-all duration-300 hover:border-primary/50 hover:shadow-glow">
      <div
        {...getRootProps()}
        className={`
          flex flex-col items-center justify-center p-12 cursor-pointer transition-all duration-300
          ${isDragActive ? 'bg-primary/10 scale-[0.98]' : ''}
          ${isProcessing ? 'pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className={`relative mb-6 transition-all duration-500 ${isProcessing ? 'animate-pulse-glow' : 'animate-float'}`}>
          {isProcessing ? (
            <Sparkles className="h-16 w-16 text-primary-glow" />
          ) : (
            <div className="relative">
              <Camera className="h-16 w-16 text-primary" />
              <Upload className="absolute -bottom-2 -right-2 h-8 w-8 text-primary-glow bg-background rounded-full p-1" />
            </div>
          )}
        </div>

        <h3 className="text-2xl font-bold mb-3 text-center">
          {isProcessing ? 'AI 분석 중...' : '캡쳐 이미지 업로드'}
        </h3>
        
        <p className="text-muted-foreground text-center mb-6">
          {isDragActive 
            ? '이미지를 여기에 놓으세요'
            : isProcessing 
            ? '텍스트 추출 및 카테고리 분류 중입니다'
            : '스마트폰 캡쳐를 드래그하거나 클릭해서 업로드하세요'
          }
        </p>

        {!isProcessing && (
          <Button 
            variant="outline" 
            size="lg"
            className="bg-gradient-primary text-white border-none hover:shadow-glow transition-all duration-300"
          >
            이미지 선택하기
          </Button>
        )}

        {isProcessing && (
          <div className="w-full max-w-xs">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-primary animate-pulse-glow"></div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};