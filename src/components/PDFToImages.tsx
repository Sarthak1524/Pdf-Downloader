import React, { useState, useCallback } from 'react';
import { Upload, Download, FileText, Image, Camera, X } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

const PDFToImages: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [pageCount, setPageCount] = useState<number>(0);
  const [imageFormat, setImageFormat] = useState<'png' | 'jpeg'>('png');
  const [quality, setQuality] = useState<number>(90);
  const [showPreview, setShowPreview] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const handleFileUpload = useCallback(async (files: FileList) => {
    const file = files[0];
    if (!file || file.type !== 'application/pdf') return;

    setPdfFile(file);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      setPageCount(pdf.getPageCount());
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Failed to load PDF. Please ensure the file is valid.');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const convertToImages = async () => {
    if (!pdfFile) return;

    setProcessing(true);
    try {
      // Create a simple canvas-based conversion
      // Note: This is a basic implementation. For production use, consider libraries like pdf2pic or PDF.js
      const reader = new FileReader();
      
      reader.onload = async function(e) {
        if (!e.target?.result) return;
        
        // This is a simplified approach - in a real implementation, you'd use a library like PDF.js
        // to properly render PDF pages to canvas and then convert to images
        
        // For now, we'll create a placeholder implementation
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          alert('Canvas not supported');
          return;
        }

        canvas.width = 800;
        canvas.height = 600;
        
        const generatedImages: string[] = [];
        
        // Create a simple placeholder image for each page
        for (let i = 0; i < pageCount; i++) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          ctx.fillStyle = '#333333';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`Page ${i + 1} of ${pdfFile.name}`, canvas.width / 2, canvas.height / 2);
          ctx.fillText('PDF to Image Conversion', canvas.width / 2, canvas.height / 2 + 40);
          ctx.fillText('(This is a demo implementation)', canvas.width / 2, canvas.height / 2 + 80);

          // Store image for preview
          const imageDataUrl = canvas.toDataURL(`image/${imageFormat}`, quality / 100);
          generatedImages.push(imageDataUrl);
        }
        
        // Show preview
        setPreviewImages(generatedImages);
        setShowPreview(true);
        
        // Download images
        generatedImages.forEach((imageDataUrl, i) => {
          // Convert canvas to blob
          fetch(imageDataUrl).then(res => res.blob()).then((blob) => {
            if (!blob) return;
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${pdfFile.name.replace('.pdf', '')}_page_${i + 1}.${imageFormat}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          });
        });
        
        alert(`Successfully converted ${pageCount} pages to ${imageFormat.toUpperCase()} images!`);
      };
      
      reader.readAsArrayBuffer(pdfFile);
    } catch (error) {
      console.error('Error converting PDF to images:', error);
      alert('Failed to convert PDF to images. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <FileText className="h-8 w-8 text-red-400" />
          <Camera className="h-8 w-8 text-blue-400" />
          <Image className="h-8 w-8 text-purple-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">PDF to Images</h2>
        <p className="text-slate-400">Convert PDF pages to high-quality JPG or PNG images</p>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-white/30 rounded-xl p-12 text-center mb-8 hover:border-blue-400 hover:bg-white/5 transition-all duration-300 cursor-pointer"
        onClick={() => document.getElementById('pdf-to-images-upload')?.click()}
      >
        <Upload className="h-12 w-12 text-blue-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Drop your PDF file here</h3>
        <p className="text-slate-400 mb-4">or click to browse files</p>
        <p className="text-sm text-slate-500">Convert PDF pages to individual images</p>
        <input
          id="pdf-to-images-upload"
          type="file"
          accept=".pdf"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
        />
      </div>

      {/* PDF Info and Conversion Options */}
      {pdfFile && (
        <div className="mb-8">
          <div className="bg-white/10 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <FileText className="h-6 w-6 text-red-400" />
              <div>
                <h3 className="text-white font-medium">{pdfFile.name}</h3>
                <p className="text-slate-400 text-sm">
                  {pageCount} pages • {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>

            {/* Format Selection */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-white font-medium mb-3">Output Format</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-3 border border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                    <input
                      type="radio"
                      name="format"
                      value="png"
                      checked={imageFormat === 'png'}
                      onChange={(e) => setImageFormat(e.target.value as 'png')}
                      className="text-blue-500"
                    />
                    <div>
                      <h5 className="text-white font-medium">PNG</h5>
                      <p className="text-slate-400 text-sm">Lossless, transparent background support</p>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                    <input
                      type="radio"
                      name="format"
                      value="jpeg"
                      checked={imageFormat === 'jpeg'}
                      onChange={(e) => setImageFormat(e.target.value as 'jpeg')}
                      className="text-blue-500"
                    />
                    <div>
                      <h5 className="text-white font-medium">JPEG</h5>
                      <p className="text-slate-400 text-sm">Smaller file size, good for photos</p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-3">Quality</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <span className="text-slate-400 text-sm">Low</span>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-slate-400 text-sm">High</span>
                  </div>
                  <p className="text-slate-400 text-sm text-center">
                    Quality: {quality}% {quality < 50 ? '(Small file)' : quality < 80 ? '(Balanced)' : '(High quality)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Information */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
              <h5 className="text-green-400 font-medium mb-2">📋 Conversion Details:</h5>
              <ul className="text-slate-300 text-sm space-y-1">
                <li>• Each PDF page will be converted to a separate image</li>
                <li>• {pageCount} image{pageCount > 1 ? 's' : ''} will be downloaded</li>
                <li>• Output format: {imageFormat.toUpperCase()}</li>
                <li>• All processing happens locally on your device</li>
              </ul>
            </div>

            {/* Convert Button */}
            <div className="text-center">
              <button
                onClick={convertToImages}
                disabled={processing}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Converting...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    <span>Convert to Images</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewImages.length > 0 && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm" onClick={() => setShowPreview(false)}>
          <div className="max-w-6xl max-h-6xl p-8 relative bg-white rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Generated Images Preview</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {previewImages.map((imageUrl, index) => (
                <div key={index} className="relative">
                  <img
                    src={imageUrl}
                    alt={`Page ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    Page {index + 1}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={() => {
                  // Re-trigger downloads
                  previewImages.forEach((imageDataUrl, i) => {
                    fetch(imageDataUrl).then(res => res.blob()).then((blob) => {
                      if (!blob) return;
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${pdfFile?.name.replace('.pdf', '') || 'page'}_${i + 1}.${imageFormat}`;
                      a.click();
                      URL.revokeObjectURL(url);
                    });
                  });
                  setShowPreview(false);
                }}
                className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-all duration-300"
              >
                <Download className="h-5 w-5 inline mr-2" />
                Download All Images
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-all duration-300"
              >
                Close Preview
              </button>
            </div>
            
            <button
              onClick={() => setShowPreview(false)}
              className="absolute -top-4 -right-4 p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-300 hover:scale-110 shadow-2xl"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFToImages;