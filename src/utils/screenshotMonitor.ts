import { Filesystem, Directory } from '@capacitor/filesystem';
import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';

export interface ScreenshotFile {
  name: string;
  path: string;
  data: string;
  size: number;
  modifiedTime: number;
}

class ScreenshotMonitor {
  private isMonitoring = false;
  private lastCheck = 0;
  private knownFiles = new Set<string>();
  private onNewScreenshot?: (file: ScreenshotFile) => void;

  async initialize() {
    console.log('📱 스크린샷 모니터 초기화 중...');
    
    if (!Capacitor.isNativePlatform()) {
      console.log('🌐 웹 환경에서는 스크린샷 모니터링이 지원되지 않습니다');
      return false;
    }

    try {
      // 기존 스크린샷 파일들을 기록 (새로운 것만 감지하기 위해)
      const existingFiles = await this.getScreenshotFiles();
      existingFiles.forEach(file => this.knownFiles.add(file.name));
      this.lastCheck = Date.now();
      
      console.log(`✅ 스크린샷 모니터 초기화 완료 (기존 파일 ${existingFiles.length}개)`);
      return true;
    } catch (error) {
      console.error('❌ 스크린샷 모니터 초기화 실패:', error);
      return false;
    }
  }

  async startMonitoring(callback: (file: ScreenshotFile) => void) {
    if (this.isMonitoring) return;
    
    this.onNewScreenshot = callback;
    this.isMonitoring = true;
    
    console.log('🔍 스크린샷 자동 감지 시작...');
    
    // 5초마다 새로운 스크린샷 확인
    const checkInterval = setInterval(async () => {
      if (!this.isMonitoring) {
        clearInterval(checkInterval);
        return;
      }
      
      await this.checkForNewScreenshots();
    }, 5000);
  }

  stopMonitoring() {
    this.isMonitoring = false;
    console.log('⏹️ 스크린샷 자동 감지 중지');
  }

  private async checkForNewScreenshots() {
    try {
      const currentFiles = await this.getScreenshotFiles();
      
      for (const file of currentFiles) {
        // 새로운 파일이고, 마지막 체크 이후에 생성된 경우
        if (!this.knownFiles.has(file.name) && file.modifiedTime > this.lastCheck) {
          console.log('📸 새로운 스크린샷 감지:', file.name);
          this.knownFiles.add(file.name);
          
          if (this.onNewScreenshot) {
            this.onNewScreenshot(file);
          }
        }
      }
      
      this.lastCheck = Date.now();
    } catch (error) {
      console.error('스크린샷 확인 중 오류:', error);
    }
  }

  private async getScreenshotFiles(): Promise<ScreenshotFile[]> {
    try {
      const deviceInfo = await Device.getInfo();
      let screenshotPaths: string[] = [];

      if (deviceInfo.platform === 'android') {
        // Android 스크린샷 경로들
        screenshotPaths = [
          'DCIM/Screenshots',
          'Pictures/Screenshots',
          'DCIM/Screen captures'
        ];
      } else if (deviceInfo.platform === 'ios') {
        // iOS 스크린샷 경로
        screenshotPaths = ['DCIM/Camera'];
      }

      const allFiles: ScreenshotFile[] = [];

      for (const path of screenshotPaths) {
        try {
          const result = await Filesystem.readdir({
            path,
            directory: Directory.ExternalStorage
          });

          for (const file of result.files) {
            if (this.isScreenshotFile(file.name)) {
              try {
                const fileData = await Filesystem.readFile({
                  path: `${path}/${file.name}`,
                  directory: Directory.ExternalStorage
                });

                const stat = await Filesystem.stat({
                  path: `${path}/${file.name}`,
                  directory: Directory.ExternalStorage
                });

                allFiles.push({
                  name: file.name,
                  path: `${path}/${file.name}`,
                  data: typeof fileData.data === 'string' ? fileData.data : '',
                  size: stat.size,
                  modifiedTime: stat.mtime
                });
              } catch (fileError) {
                console.warn('파일 읽기 실패:', file.name, fileError);
              }
            }
          }
        } catch (pathError) {
          console.warn('경로 접근 실패:', path, pathError);
        }
      }

      return allFiles.sort((a, b) => b.modifiedTime - a.modifiedTime);
    } catch (error) {
      console.error('스크린샷 파일 목록 가져오기 실패:', error);
      return [];
    }
  }

  private isScreenshotFile(filename: string): boolean {
    const screenshotPatterns = [
      /^screenshot/i,
      /^screen.*shot/i,
      /^capture/i,
      /^img_\d{8}_\d{6}/i, // Android 패턴
      /^스크린샷/i,
      /^캡처/i
    ];

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const hasImageExtension = imageExtensions.some(ext => 
      filename.toLowerCase().endsWith(ext)
    );

    return hasImageExtension && screenshotPatterns.some(pattern => 
      pattern.test(filename)
    );
  }

  async deleteScreenshot(file: ScreenshotFile): Promise<boolean> {
    try {
      await Filesystem.deleteFile({
        path: file.path,
        directory: Directory.ExternalStorage
      });
      
      this.knownFiles.delete(file.name);
      console.log('🗑️ 원본 스크린샷 삭제:', file.name);
      return true;
    } catch (error) {
      console.error('스크린샷 삭제 실패:', error);
      return false;
    }
  }

  async getRecentScreenshots(limit = 10): Promise<ScreenshotFile[]> {
    const files = await this.getScreenshotFiles();
    return files.slice(0, limit);
  }
}

export const screenshotMonitor = new ScreenshotMonitor();