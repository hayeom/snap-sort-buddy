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
    <Card className="relative overflow-hidden border border-primary/20 bg-gradient-glass backdrop-blur-crisp transition-all duration-500 hover:border-primary/30 hover:shadow-card rounded-2xl">
      <div
        {...getRootProps()}
        className={`
          flex flex-col items-center justify-center p-8 cursor-pointer transition-all duration-500
          ${isDragActive ? 'bg-primary/5 scale-[0.98]' : ''}
          ${isProcessing ? 'pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className={`relative mb-4 transition-all duration-500 ${isProcessing ? 'animate-pulse-glow' : ''}`}>
          {isProcessing ? (
            <Sparkles className="h-10 w-10 text-primary-glow" />
          ) : (
            <div className="relative">
              <Camera className="h-10 w-10 text-primary" />
              <Upload className="absolute -bottom-1 -right-1 h-5 w-5 text-primary-glow bg-background rounded-full p-0.5" />
            </div>
          )}
        </div>

        <h3 className="text-lg font-bold mb-2 text-center">
          {isProcessing ? 'AI 분석 중...' : '캡쳐 업로드'}
        </h3>
        
        <p className="text-muted-foreground text-center mb-4 text-sm leading-relaxed">
          {isDragActive 
            ? '이미지를 여기에 놓으세요'
            : isProcessing 
            ? '분석 중입니다...'
            : '이미지를 드래그하거나 클릭하세요'
          }
        </p>

        {!isProcessing && (
          <Button 
            variant="outline" 
            size="sm"
            className="bg-gradient-primary text-white border-none hover:shadow-glow transition-all duration-300 rounded-xl px-4 py-2"
          >
            선택하기
          </Button>
        )}

        {isProcessing && (
          <div className="w-full max-w-48">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-primary animate-pulse-glow"></div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};