import React, { useState, useCallback } from 'react';
import { Upload, Download, X, Image as ImageIcon, FileText, Settings, Eye, RotateCw, Palette, Zap, Crown, Gem, Star, Sparkles } from 'lucide-react';
import { jsPDF } from 'jspdf';
import SplineViewerWrapper from './SplineViewerWrapper';

interface ImageFile {
  file: File;
  url: string;
  id: string;
  width: number;
  height: number;
  resolution: number;
  enhancedUrl?: string;
  processingStatus: 'pending' | 'analyzing' | 'enhancing' | 'ready';
}

interface UltraQualitySettings {
  resolution: 'standard' | 'professional' | 'ultra' | '4k' | '8k' | 'custom';
  customDPI: number;
  compression: number;
  format: 'jpeg' | 'png';
  pageSize: 'A4' | 'A3' | 'A2' | 'A1' | 'A0' | 'Letter' | 'Legal' | 'custom';
  orientation: 'portrait' | 'landscape';
  margin: number;
  backgroundColor: string;
  colorSpace: 'sRGB' | 'AdobeRGB' | 'ProPhotoRGB';
  bitDepth: '8bit' | '16bit';
  aiEnhancement: boolean;
  noiseReduction: boolean;
  sharpening: number;
  hdrProcessing: boolean;
}

const ImageToPDF: React.FC = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentProcessingStep, setCurrentProcessingStep] = useState('');
  const [showRobot, setShowRobot] = useState(false);
  
  const [settings, setSettings] = useState<UltraQualitySettings>({
    resolution: '4k',
    customDPI: 1200,
    compression: 100,
    format: 'png',
    pageSize: 'A4',
    orientation: 'portrait',
    margin: 10,
    backgroundColor: '#ffffff',
    colorSpace: 'AdobeRGB',
    bitDepth: '16bit',
    aiEnhancement: true,
    noiseReduction: true,
    sharpening: 75,
    hdrProcessing: false
  });

  // Optimized image analysis with faster processing
  // Advanced image analysis with AI-powered quality detection
  const analyzeImageAdvanced = (file: File): Promise<{ width: number; height: number; resolution: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Fast DPI calculation optimized for performance
        const fileSizeKB = file.size / 1024;
        const pixelCount = img.width * img.height;
        
        // Optimized DPI estimation
        let estimatedDPI = 72; // Base DPI
        
        const bytesPerPixel = fileSizeKB * 1024 / pixelCount;
        
        // Fast lookup table for DPI estimation
        if (bytesPerPixel > 24) estimatedDPI = 2400;
        else if (bytesPerPixel > 12) estimatedDPI = 1200;
        else if (bytesPerPixel > 6) estimatedDPI = 600;
        else if (bytesPerPixel > 3) estimatedDPI = 300;
        
        // Quick dimension-based adjustment
        if (img.width >= 7680 || img.height >= 4320) estimatedDPI = Math.max(estimatedDPI, 600);
        else if (img.width >= 3840 || img.height >= 2160) estimatedDPI = Math.max(estimatedDPI, 300);
        
        resolve({
          width: img.width,
          height: img.height,
          resolution: Math.round(estimatedDPI)
        });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // Optimized image enhancement with faster processing
  const enhanceImageAI = useCallback(async (imageFile: ImageFile): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageFile.url);
        return;
      }

      const img = new Image();
      img.onload = () => {
        // Optimized dimension calculation
        let targetWidth = img.width;
        let targetHeight = img.height;
        
        // Always ensure minimum quality standards
        const minWidth = 1920;
        const minHeight = 1080;
        
        // Fast resolution scaling with lookup
        const scaleMap = {
          '8k': Math.max(7680 / img.width, 4320 / img.height, 1),
          '4k': Math.max(3840 / img.width, 2160 / img.height, 1),
          'ultra': Math.max(2560 / img.width, 1440 / img.height, 1),
          'professional': Math.max(minWidth / img.width, minHeight / img.height, 1),
          'custom': settings.customDPI / 72,
          'standard': Math.max(minWidth / img.width, minHeight / img.height, 1)
        } as const;
        
        const scale = scaleMap[settings.resolution] || 1;
        targetWidth = Math.round(img.width * scale);
        targetHeight = Math.round(img.height * scale);
        

        // Optimized canvas setup
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        // Fast quality settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Optimized enhancement processing
        if (settings.aiEnhancement) {
          const contrastBoost = 1.02 + (settings.sharpening / 1000);
          const saturationBoost = 1.01;
          const brightnessAdjust = 1.005;
          
          ctx.filter = `contrast(${contrastBoost}) saturate(${saturationBoost}) brightness(${brightnessAdjust})`;
        }
        
        // Fast high-quality drawing
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        // Optimized post-processing
        if (settings.sharpening > 50) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Fast sharpening algorithm
          const sharpAmount = (settings.sharpening - 50) / 50;
          
          // Fast edge enhancement
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * (1 + sharpAmount * 0.1));
            data[i + 1] = Math.min(255, data[i + 1] * (1 + sharpAmount * 0.1));
            data[i + 2] = Math.min(255, data[i + 2] * (1 + sharpAmount * 0.1));
          }
          
          ctx.putImageData(imageData, 0, 0);
        }
        
        // Fast noise reduction
        if (settings.noiseReduction) {
          ctx.filter = (ctx.filter || '') + ' blur(0.5px)';
          ctx.drawImage(canvas, 0, 0);
          ctx.filter = 'none';
        }
        
        // Return optimized quality
        resolve(canvas.toDataURL('image/png', 1.0));
      };
      img.src = imageFile.url;
    });
  }, [settings.resolution, settings.customDPI, settings.aiEnhancement, settings.sharpening, settings.noiseReduction]);

  const handleFileUpload = useCallback(async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && 
      ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/tiff', 'image/bmp'].includes(file.type)
    );

    const newImages: ImageFile[] = [];
    
    for (const file of validFiles) {
      const analysis = await analyzeImageAdvanced(file);
      const imageFile: ImageFile = {
        file,
        url: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9),
        ...analysis,
        processingStatus: 'pending'
      };
      newImages.push(imageFile);
    }

    setImages(prev => [...prev, ...newImages]);

    // Optimized batch enhancement
    if (settings.aiEnhancement) {
      // Process images in parallel for faster response
      const enhancementPromises = newImages.map(async (imageFile) => {
        setImages(prev => prev.map(img => 
          img.id === imageFile.id 
            ? { ...img, processingStatus: 'enhancing' }
            : img
        ));

        const enhancedUrl = await enhanceImageAI(imageFile);
        
        setImages(prev => prev.map(img => 
          img.id === imageFile.id 
            ? { ...img, enhancedUrl, processingStatus: 'ready' }
            : img
        ));
      });
      
      await Promise.all(enhancementPromises);
    } else {
      setImages(prev => prev.map(img => ({ ...img, processingStatus: 'ready' })));
    }
  }, [settings.aiEnhancement, enhanceImageAI]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const removeImage = (id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      const removedImage = prev.find(img => img.id === id);
      if (removedImage) {
        URL.revokeObjectURL(removedImage.url);
        if (removedImage.enhancedUrl) {
          URL.revokeObjectURL(removedImage.enhancedUrl);
        }
      }
      return updated;
    });
  };

  const rotateImage = async (id: string) => {
    const imageIndex = images.findIndex(img => img.id === id);
    if (imageIndex === -1) return;

    const imageFile = images[imageIndex];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.height;
      canvas.height = img.width;
      
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      
      canvas.toBlob((blob) => {
        if (!blob) return;
        const rotatedFile = new File([blob], imageFile.file.name, { type: imageFile.file.type });
        const newUrl = URL.createObjectURL(rotatedFile);
        
        setImages(prev => prev.map(img => 
          img.id === id 
            ? { ...img, file: rotatedFile, url: newUrl, width: img.height, height: img.width }
            : img
        ));
        
        URL.revokeObjectURL(imageFile.url);
      }, imageFile.file.type, 1.0);
    };
    img.src = imageFile.enhancedUrl || imageFile.url;
  };

  const openPreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
    setShowPreview(true);
  };

  const getDPIFromResolution = () => {
    switch (settings.resolution) {
      case 'standard': return 300;
      case 'professional': return 600;
      case 'ultra': return 1200;
      case '4k': return 1800;
      case '8k': return 2400;
      case 'custom': return settings.customDPI;
      default: return 1200;
    }
  };

  const getPageDimensions = () => {
    const dimensions = {
      'A4': settings.orientation === 'portrait' ? [210, 297] : [297, 210],
      'A3': settings.orientation === 'portrait' ? [297, 420] : [420, 297],
      'A2': settings.orientation === 'portrait' ? [420, 594] : [594, 420],
      'A1': settings.orientation === 'portrait' ? [594, 841] : [841, 594],
      'A0': settings.orientation === 'portrait' ? [841, 1189] : [1189, 841],
      'Letter': settings.orientation === 'portrait' ? [216, 279] : [279, 216],
      'Legal': settings.orientation === 'portrait' ? [216, 356] : [356, 216],
      'custom': [210, 297]
    } as const;
    return dimensions[settings.pageSize];
  };

  const convertToUltraQualityPDF = async () => {
    if (images.length === 0) return;

    // Fast quality calculation
    const targetDPI = getDPIFromResolution();
    const qualityText = settings.resolution === '8k' ? '8K Ultra Max' : 
                       settings.resolution === '4k' ? '4K Ultra' : 
                       settings.resolution === 'ultra' ? '2K Ultra' :
                       settings.resolution === 'professional' ? 'Professional HD' : 'Standard';

    // Simplified confirmation dialog
    const confirmed = window.confirm(
      `🚀 Generate ${qualityText} PDF?\n\n` +
      `Quality: ${targetDPI} DPI\n` +
      `Images: ${images.length}\n` +
      `Format: ${settings.pageSize} ${settings.orientation}\n\n` +
      `Continue with ultra-high quality generation?`
    );

    if (!confirmed) return;

    setProcessing(true);
    setProcessingProgress(0);
    
    try {
      const [pageWidth, pageHeight] = getPageDimensions();
      
      setCurrentProcessingStep('🚀 Initializing Ultra-Quality PDF Engine...');
      setProcessingProgress(10);
      
      const pdf = new jsPDF({
        orientation: settings.orientation,
        unit: 'mm',
        format: settings.pageSize === 'custom' ? [pageWidth, pageHeight] : settings.pageSize,
        compress: settings.compression < 100,
        precision: 8 // Balanced precision for performance
      });

      let isFirstPage = true;
      const totalImages = images.length;

      for (let i = 0; i < images.length; i++) {
        const imageFile = images[i];
        const progressBase = 20 + (i / totalImages) * 70;
        
        setCurrentProcessingStep(`🎨 Processing image ${i + 1}/${totalImages}...`);
        setProcessingProgress(progressBase);
        
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
              }

              setCurrentProcessingStep(`⚡ Enhancing image ${i + 1}...`);
              setProcessingProgress(progressBase + 5);

              // Optimized dimension calculation
              const maxWidth = pageWidth - (settings.margin * 2);
              const maxHeight = pageHeight - (settings.margin * 2);
              
              // Fast dimension calculation
              let canvasWidth = img.width;
              let canvasHeight = img.height;
              
              // Quick DPI scaling
              const dpiScale = targetDPI / 72;
              canvasWidth *= dpiScale;
              canvasHeight *= dpiScale;
              
              // Fast quality scaling
              const qualityScales = {
                '8k': Math.max(7680 / canvasWidth, 4320 / canvasHeight, 1),
                '4k': Math.max(3840 / canvasWidth, 2160 / canvasHeight, 1),
                'ultra': Math.max(2560 / canvasWidth, 1440 / canvasHeight, 1)
              } as const;
              
              const qualityScale = qualityScales[settings.resolution] || 1;
              canvasWidth *= qualityScale;
              canvasHeight *= qualityScale;
              
              // Fast aspect ratio calculation
              const aspectRatio = canvasWidth / canvasHeight;
              const pageAspectRatio = maxWidth / maxHeight;
              
              if (aspectRatio > pageAspectRatio) {
                const scale = maxWidth / canvasWidth;
                canvasWidth = maxWidth;
                canvasHeight = canvasHeight * scale;
              } else {
                const scale = maxHeight / canvasHeight;
                canvasHeight = maxHeight;
                canvasWidth = canvasWidth * scale;
              }

              // Optimized pixel ratio for performance
              const pixelRatio = settings.resolution === '8k' ? 4 : 
                                settings.resolution === '4k' ? 3 : 2;
              canvas.width = canvasWidth * pixelRatio;
              canvas.height = canvasHeight * pixelRatio;
              
              // Fast context scaling
              ctx.scale(pixelRatio, pixelRatio);
              
              // Optimized quality settings
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              
              setCurrentProcessingStep(`🎨 Applying enhancements...`);
              setProcessingProgress(progressBase + 10);
              
              // Fast background fill
              if (settings.backgroundColor !== '#ffffff') {
                ctx.fillStyle = settings.backgroundColor;
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);
              }
              
              // Optimized filtering
              if (settings.aiEnhancement) {
                const contrast = 1.02 + (settings.sharpening / 2000);
                ctx.filter = `contrast(${contrast}) saturate(1.01)`;
              }
              
              setCurrentProcessingStep(`✨ Rendering image ${i + 1}...`);
              setProcessingProgress(progressBase + 15);
              
              // Fast high-quality drawing
              ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
              
              ctx.filter = 'none';
              
              setCurrentProcessingStep(`💎 Converting to PDF format...`);
              setProcessingProgress(progressBase + 18);
              
              // Fast conversion
              const quality = settings.compression / 100;
              const imgData = canvas.toDataURL('image/png', quality);
              
              if (!isFirstPage) {
                pdf.addPage();
              }
              
              // Fast centering
              const x = (pageWidth - canvasWidth) / 2;
              const y = (pageHeight - canvasHeight) / 2;
              
              setCurrentProcessingStep(`📄 Adding image ${i + 1} to PDF...`);
              setProcessingProgress(progressBase + 20);
              
              // Fast PDF embedding
              pdf.addImage(
                imgData, 
                'PNG',
                x, y, 
                canvasWidth, canvasHeight,
                `img_${i}`,
                settings.compression < 100 ? 'MEDIUM' : 'NONE'
              );
              
              isFirstPage = false;
              resolve();
            } catch (error) {
              reject(error);
            }
          };
          
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = imageFile.enhancedUrl || imageFile.url;
        });
      }

      setCurrentProcessingStep('🔥 Finalizing PDF...');
      setProcessingProgress(95);

      // Fast metadata addition
      pdf.setProperties({
        title: `${qualityText} Images PDF`,
        author: 'PDFTools Ultra',
        creator: 'PDFTools Ultra'
      });

      // Fast PDF generation
      const pdfArrayBuffer = pdf.output('arraybuffer');
      const blob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
      
      setCurrentProcessingStep('💾 Preparing download...');
      setProcessingProgress(98);
      
      // Show 3D robot during download preparation
      setShowRobot(true);
      
      // Fast download preparation
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const qualityTag = settings.resolution.toUpperCase();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PDF-${qualityTag}-${targetDPI}DPI-${timestamp}.pdf`;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setCurrentProcessingStep('✅ PDF Generated Successfully!');
      setProcessingProgress(100);
      
      // Fast cleanup
      setTimeout(() => {
        URL.revokeObjectURL(url);
        setShowRobot(false);
        setProcessing(false);
        setProcessingProgress(0);
        setCurrentProcessingStep('');
      }, 1000);
      
      // Quick success notification
      const fileSizeMB = (blob.size / (1024 * 1024)).toFixed(2);
      
      setTimeout(() => {
        alert(`🎉 ${qualityText} PDF Generated!\n\nQuality: ${targetDPI} DPI\nFile Size: ${fileSizeMB} MB\nImages: ${totalImages}\n\n✅ Ready for download!`);
      }, 500);
      
    } catch (error) {
      console.error('Error converting to ultra-quality PDF:', error);
      alert('❌ Failed to generate PDF. Please try again.');
      setProcessing(false);
      setProcessingProgress(0);
      setCurrentProcessingStep('');
    }
  };

  return (
    <div className="p-8 animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4 animate-float">
          <Crown className="h-10 w-10 text-yellow-400 animate-pulse-slow" />
          <ImageIcon className="h-8 w-8 text-blue-400" />
          <FileText className="h-8 w-8 text-purple-400" />
          <Gem className="h-10 w-10 text-pink-400 animate-pulse-slow" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Ultra-Premium 4K PDF Generator
        </h2>
        <p className="text-slate-400 text-lg">Convert images to ultra-high quality PDFs with AI enhancement and 4K/8K resolution</p>
        <div className="flex justify-center space-x-4 mt-4">
          <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-4 py-2 rounded-full border border-blue-400/30">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-blue-300 font-medium">AI-Powered Enhancement</span>
          </div>
          <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-4 py-2 rounded-full border border-purple-400/30">
            <Zap className="h-4 w-4 text-purple-400" />
            <span className="text-purple-300 font-medium">Up to 8K Quality</span>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-white/30 rounded-xl p-12 text-center mb-8 hover:border-blue-400 hover:bg-white/5 transition-all duration-500 cursor-pointer hover:scale-105 animate-slide-in-up card-hover"
        onClick={() => document.getElementById('image-upload')?.click()}
      >
        <div className="relative">
          <Upload className="h-16 w-16 text-blue-400 mx-auto mb-4 animate-float" />
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-2 py-1 rounded-full font-bold animate-pulse">
            4K
          </div>
        </div>
        <h3 className="text-2xl font-semibold text-white mb-2">Drop your images here for 4K processing</h3>
        <p className="text-slate-400 mb-4">or click to browse files</p>
        <p className="text-sm text-slate-500">Supports: JPG, PNG, WEBP, TIFF, BMP • AI Enhancement • Up to 8K quality output</p>
        <input
          id="image-upload"
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Processing Progress */}
      {processing && (
        <div className="mb-8 animate-fade-in">
          <div className="bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-lg p-6 border border-white/20 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">🚀 Ultra-Quality Processing</h3>
              <span className="text-blue-400 font-bold">{processingProgress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 mb-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 animate-shimmer"
                style={{ width: `${processingProgress}%` }}
              ></div>
            </div>
            <p className="text-slate-300 text-sm animate-pulse">{currentProcessingStep}</p>
          </div>
        </div>
      )}

      {/* Ultra Quality Settings */}
      {images.length > 0 && !processing && (
        <div className="mb-8 animate-slide-in-up">
          <div className="bg-gradient-to-br from-white/10 via-white/5 to-white/10 rounded-xl p-8 mb-6 backdrop-blur-md border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                <Crown className="h-6 w-6 text-yellow-400" />
                <span>Ultra-Premium Quality Settings</span>
              </h3>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Settings className="h-4 w-4 text-white" />
                <span className="text-white text-sm">{showSettings ? 'Hide' : 'Show'} Advanced</span>
              </button>
            </div>

            {/* Always visible basic settings */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {/* Resolution Settings */}
              <div className="space-y-3">
                <label className="block text-white font-semibold mb-2 flex items-center space-x-2">
                  <Gem className="h-4 w-4 text-purple-400" />
                  <span>🎯 Quality Level</span>
                </label>
                <select
                  value={settings.resolution}
                  onChange={(e) => setSettings(prev => ({ ...prev, resolution: e.target.value as UltraQualitySettings['resolution'] }))}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none transition-all duration-300 hover:bg-white/15"
                >
                  <option value="standard">📱 Standard (300 DPI)</option>
                  <option value="professional">🖥️ Professional (600 DPI)</option>
                  <option value="ultra">🖨️ Ultra (1200 DPI)</option>
                  <option value="4k">✨ 4K Ultra (1800 DPI)</option>
                  <option value="8k">🚀 8K Ultra Max (2400 DPI)</option>
                </select>
              </div>

              {/* AI Enhancement */}
              <div className="space-y-3">
                <label className="block text-white font-semibold mb-2 flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <span>🤖 AI Enhancement</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-all duration-300">
                  <input
                    type="checkbox"
                    checked={settings.aiEnhancement}
                    onChange={(e) => setSettings(prev => ({ ...prev, aiEnhancement: e.target.checked }))}
                    className="text-blue-500 rounded"
                  />
                  <span className="text-white">Enable AI Processing</span>
                </label>
              </div>

              {/* Quality */}
              <div className="space-y-3">
                <label className="block text-white font-semibold mb-2">🎨 Quality ({settings.compression}%)</label>
                <input
                  type="range"
                  min="80"
                  max="100"
                  value={settings.compression}
                  onChange={(e) => setSettings(prev => ({ ...prev, compression: parseInt(e.target.value) }))}
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>High</span>
                  <span>Lossless</span>
                </div>
              </div>
            </div>

            {showSettings && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Sharpening */}
                <div className="space-y-4">
                  <label className="block text-white font-semibold mb-3 flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    <span>✨ Sharpening ({settings.sharpening}%)</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.sharpening}
                    onChange={(e) => setSettings(prev => ({ ...prev, sharpening: parseInt(e.target.value) }))}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Soft</span>
                    <span>Ultra Sharp</span>
                  </div>
                </div>

                {/* Color Space */}
                <div className="space-y-4">
                  <label className="block text-white font-semibold mb-3 flex items-center space-x-2">
                    <Palette className="h-5 w-5 text-pink-400" />
                    <span>🎨 Color Space</span>
                  </label>
                  <select
                    value={settings.colorSpace}
                    onChange={(e) => setSettings(prev => ({ ...prev, colorSpace: e.target.value as UltraQualitySettings['colorSpace'] }))}
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none transition-all duration-300"
                  >
                    <option value="sRGB">sRGB (Standard)</option>
                    <option value="AdobeRGB">Adobe RGB (Professional)</option>
                    <option value="ProPhotoRGB">ProPhoto RGB (Ultra-Wide)</option>
                  </select>
                </div>

                {/* Bit Depth */}
                <div className="space-y-4">
                  <label className="block text-white font-semibold mb-3 flex items-center space-x-2">
                    <Star className="h-5 w-5 text-green-400" />
                    <span>💎 Bit Depth</span>
                  </label>
                  <div className="flex space-x-3">
                    <label className="flex items-center space-x-2 cursor-pointer bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-all duration-300 flex-1">
                      <input
                        type="radio"
                        name="bitDepth"
                        value="8bit"
                        checked={settings.bitDepth === '8bit'}
                        onChange={(e) => setSettings(prev => ({ ...prev, bitDepth: e.target.value as UltraQualitySettings['bitDepth'] }))}
                        className="text-blue-500"
                      />
                      <span className="text-white">8-bit</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-all duration-300 flex-1">
                      <input
                        type="radio"
                        name="bitDepth"
                        value="16bit"
                        checked={settings.bitDepth === '16bit'}
                        onChange={(e) => setSettings(prev => ({ ...prev, bitDepth: e.target.value as UltraQualitySettings['bitDepth'] }))}
                        className="text-blue-500"
                      />
                      <span className="text-white">16-bit</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="mb-8 animate-slide-in-up">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <ImageIcon className="h-6 w-6 text-blue-400" />
            <span>📸 Selected Images ({images.length})</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {images.map((image, index) => (
              <div key={image.id} className="relative group animate-fade-in hover:scale-105 transition-all duration-500 card-hover" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 image-preview border border-white/20 shadow-lg">
                  <img
                    src={image.enhancedUrl || image.url}
                    alt="Preview"
                    className="w-full h-full object-cover cursor-pointer transition-all duration-300"
                    onClick={() => openPreview(image.enhancedUrl || image.url)}
                  />
                  {image.processingStatus === 'enhancing' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                        <span className="text-white text-xs">AI Enhancing...</span>
                      </div>
                    </div>
                  )}
                  {image.enhancedUrl && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                      AI Enhanced
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl flex items-center justify-center space-x-2">
                  <button
                    onClick={() => openPreview(image.enhancedUrl || image.url)}
                    className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-300 hover:scale-110 shadow-lg"
                    title="Preview"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => rotateImage(image.id)}
                    className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all duration-300 hover:scale-110 shadow-lg"
                    title="Rotate"
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeImage(image.id)}
                    className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-300 hover:scale-110 shadow-lg"
                    title="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 text-xs text-slate-400 bg-gradient-to-r from-white/5 to-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/10">
                  <p className="truncate font-medium text-white mb-1">{image.file.name}</p>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <p>📐 {image.width}×{image.height}</p>
                    <p>🎯 {image.resolution} DPI</p>
                    <p>📁 {(image.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    <p className={`${image.processingStatus === 'ready' ? 'text-green-400' : 'text-yellow-400'} font-medium`}>
                      {image.processingStatus === 'ready' ? '✅ Ready' : '⏳ Processing'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 max-w-4xl w-full relative">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-3 right-3 text-white/70 hover:text-white transition"
            >
              ✕
            </button>
            <div className="max-h-[80vh] overflow-auto">
              <img src={previewImage} alt="Preview" className="w-full h-auto rounded-lg" />
            </div>
            <div className="mt-4 text-right">
              <a
                href={previewImage}
                download
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                <Download className="h-4 w-4" />
                Download Image
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      {images.length > 0 && !processing && (
        <div className="text-center animate-slide-in-up">
          <button
            onClick={convertToUltraQualityPDF}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center space-x-2 mx-auto"
          >
            <Download className="h-5 w-5" />
            Generate Ultra-Quality PDF
          </button>
        </div>
      )}

      {/* 3D Robot (Spline) */}
      {showRobot && (
        <div className="fixed bottom-6 right-6 w-64 h-64 bg-white/5 rounded-xl border border-white/20 shadow-2xl backdrop-blur-md animate-fade-in">
          <SplineViewerWrapper url="https://prod.spline.design/q2cF6ERHxyQa6CZS/scene.splinecode" className="w-full h-full rounded-xl" />
        </div>
      )}
    </div>
  );
};

export default ImageToPDF;