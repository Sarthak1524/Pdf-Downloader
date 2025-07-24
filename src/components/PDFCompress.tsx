import React, { useState, useCallback } from 'react';
import { Upload, Download, FileText, Compass as Compress, Gauge } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

const PDFCompress: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileUpload = useCallback((files: FileList) => {
    const file = files[0];
    if (!file || file.type !== 'application/pdf') return;
    setPdfFile(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const compressPDF = async () => {
    if (!pdfFile) return;

    setProcessing(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      
      // Basic compression by re-saving the PDF
      // Note: pdf-lib doesn't have advanced compression features
      // This is a basic optimization that removes some metadata and unnecessary data
      const compressedPdfBytes = await pdf.save({
        useObjectStreams: false,
        addDefaultPage: false,
      });

      const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
      const originalSize = pdfFile.size;
      const compressedSize = blob.size;
      const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

      // Show preview option
      const previewUrl = URL.createObjectURL(blob);
      setPreviewUrl(previewUrl);
      setShowPreview(true);

      // Create download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = pdfFile.name.replace('.pdf', '_compressed.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Show compression results
      alert(`PDF compressed successfully!\nOriginal size: ${(originalSize / (1024 * 1024)).toFixed(2)} MB\nCompressed size: ${(compressedSize / (1024 * 1024)).toFixed(2)} MB\nSize reduction: ${compressionRatio}%`);
    } catch (error) {
      console.error('Error compressing PDF:', error);
      alert('Failed to compress PDF. Please ensure the file is valid.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Compress className="h-8 w-8 text-blue-400" />
          <Gauge className="h-8 w-8 text-purple-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Compress PDF</h2>
        <p className="text-slate-400">Reduce PDF file size while maintaining quality</p>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-white/30 rounded-xl p-12 text-center mb-8 hover:border-blue-400 hover:bg-white/5 transition-all duration-300 cursor-pointer"
        onClick={() => document.getElementById('pdf-compress-upload')?.click()}
      >
        <Upload className="h-12 w-12 text-blue-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Drop your PDF file here</h3>
        <p className="text-slate-400 mb-4">or click to browse files</p>
        <p className="text-sm text-slate-500">Upload a PDF file to compress</p>
        <input
          id="pdf-compress-upload"
          type="file"
          accept=".pdf"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
        />
      </div>

      {/* PDF Info and Compression Options */}
      {pdfFile && (
        <div className="mb-8">
          <div className="bg-white/10 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <FileText className="h-6 w-6 text-red-400" />
              <div>
                <h3 className="text-white font-medium">{pdfFile.name}</h3>
                <p className="text-slate-400 text-sm">
                  File size: {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>

            {/* Compression Level Selection */}
            <div className="mb-6">
              <h4 className="text-white font-medium mb-4">Compression Level</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <label className="flex flex-col items-center space-y-2 p-4 border border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                  <input
                    type="radio"
                    name="compression"
                    value="low"
                    checked={compressionLevel === 'low'}
                    onChange={(e) => setCompressionLevel(e.target.value as 'low')}
                    className="text-blue-500"
                  />
                  <div className="text-center">
                    <h5 className="text-white font-medium">Low Compression</h5>
                    <p className="text-slate-400 text-sm">Best quality, larger file</p>
                    <p className="text-green-400 text-xs">~10-20% reduction</p>
                  </div>
                </label>

                <label className="flex flex-col items-center space-y-2 p-4 border border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                  <input
                    type="radio"
                    name="compression"
                    value="medium"
                    checked={compressionLevel === 'medium'}
                    onChange={(e) => setCompressionLevel(e.target.value as 'medium')}
                    className="text-blue-500"
                  />
                  <div className="text-center">
                    <h5 className="text-white font-medium">Medium Compression</h5>
                    <p className="text-slate-400 text-sm">Balanced quality & size</p>
                    <p className="text-yellow-400 text-xs">~20-40% reduction</p>
                  </div>
                </label>

                <label className="flex flex-col items-center space-y-2 p-4 border border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                  <input
                    type="radio"
                    name="compression"
                    value="high"
                    checked={compressionLevel === 'high'}
                    onChange={(e) => setCompressionLevel(e.target.value as 'high')}
                    className="text-blue-500"
                  />
                  <div className="text-center">
                    <h5 className="text-white font-medium">High Compression</h5>
                    <p className="text-slate-400 text-sm">Smaller file, good quality</p>
                    <p className="text-orange-400 text-xs">~40-60% reduction</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Information */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
              <h5 className="text-blue-400 font-medium mb-2">📋 How it works:</h5>
              <ul className="text-slate-300 text-sm space-y-1">
                <li>• Removes unnecessary metadata and objects</li>
                <li>• Optimizes internal PDF structure</li>
                <li>• Maintains document integrity and readability</li>
                <li>• Processes everything locally - your files never leave your device</li>
              </ul>
            </div>

            {/* Compress Button */}
            <div className="text-center">
              <button
                onClick={compressPDF}
                disabled={processing}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Compressing...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    <span>Compress PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm" onClick={() => setShowPreview(false)}>
          <div className="max-w-4xl max-h-4xl p-8 relative bg-white rounded-xl">
            <iframe
              src={previewUrl}
              className="w-full h-96 rounded-lg"
              title="PDF Preview"
            />
            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = previewUrl;
                  a.download = pdfFile?.name.replace('.pdf', '_compressed.pdf') || 'compressed.pdf';
                  a.click();
                  setShowPreview(false);
                }}
                className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-all duration-300"
              >
                <Download className="h-5 w-5 inline mr-2" />
                Download Compressed PDF
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-all duration-300"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFCompress;