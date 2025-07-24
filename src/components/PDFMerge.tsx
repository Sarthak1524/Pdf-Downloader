import React, { useState, useCallback } from 'react';
import { Upload, Download, X, FileText, Merge } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

interface PDFFile {
  file: File;
  id: string;
  name: string;
}

const PDFMerge: React.FC = () => {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileUpload = useCallback((files: FileList) => {
    const validFiles = Array.from(files).filter(file => file.type === 'application/pdf');

    const newPDFs = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name
    }));

    setPdfFiles(prev => [...prev, ...newPDFs]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const removePDF = (id: string) => {
    setPdfFiles(prev => prev.filter(pdf => pdf.id !== id));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setPdfFiles(prev => {
      const newFiles = [...prev];
      [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
      return newFiles;
    });
  };

  const moveDown = (index: number) => {
    if (index === pdfFiles.length - 1) return;
    setPdfFiles(prev => {
      const newFiles = [...prev];
      [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
      return newFiles;
    });
  };

  const mergePDFs = async () => {
    if (pdfFiles.length < 2) return;

    setProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();

      for (const pdfFile of pdfFiles) {
        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      // Show preview option
      const previewUrl = URL.createObjectURL(blob);
      setPreviewUrl(previewUrl);
      setShowPreview(true);
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged-document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('Failed to merge PDFs. Please ensure all files are valid PDF documents.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Merge className="h-8 w-8 text-blue-400" />
          <FileText className="h-8 w-8 text-purple-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Merge PDF Files</h2>
        <p className="text-slate-400">Combine multiple PDF documents into a single file</p>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-white/30 rounded-xl p-12 text-center mb-8 hover:border-blue-400 hover:bg-white/5 transition-all duration-300 cursor-pointer"
        onClick={() => document.getElementById('pdf-upload')?.click()}
      >
        <Upload className="h-12 w-12 text-blue-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Drop your PDF files here</h3>
        <p className="text-slate-400 mb-4">or click to browse files</p>
        <p className="text-sm text-slate-500">Upload multiple PDF files to merge them</p>
        <input
          id="pdf-upload"
          type="file"
          multiple
          accept=".pdf"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
        />
      </div>

      {/* PDF List */}
      {pdfFiles.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            PDF Files ({pdfFiles.length}) - Drag to reorder
          </h3>
          <div className="space-y-3">
            {pdfFiles.map((pdf, index) => (
              <div
                key={pdf.id}
                className="bg-white/10 rounded-lg p-4 flex items-center justify-between group hover:bg-white/20 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-red-400" />
                  <div>
                    <p className="text-white font-medium">{pdf.name}</p>
                    <p className="text-slate-400 text-sm">
                      {(pdf.file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === pdfFiles.length - 1}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removePDF(pdf.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Merge Button */}
      {pdfFiles.length >= 2 && (
        <div className="text-center">
          <button
            onClick={mergePDFs}
            disabled={processing}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Merging...</span>
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                <span>Merge PDFs</span>
              </>
            )}
          </button>
        </div>
      )}

      {pdfFiles.length === 1 && (
        <div className="text-center">
          <p className="text-slate-400">Add at least 2 PDF files to merge them</p>
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
                  a.download = 'merged-document.pdf';
                  a.click();
                  setShowPreview(false);
                }}
                className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-all duration-300"
              >
                <Download className="h-5 w-5 inline mr-2" />
                Download PDF
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

export default PDFMerge;