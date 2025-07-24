import React, { useState, useCallback } from 'react';
import { Upload, Download, FileText, Split, Scissors } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

const PDFSplit: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [splitOption, setSplitOption] = useState<'pages' | 'range'>('pages');
  const [pages, setPages] = useState<string>('');
  const [rangeStart, setRangeStart] = useState<string>('1');
  const [rangeEnd, setRangeEnd] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (files: FileList) => {
    const file = files[0];
    if (!file || file.type !== 'application/pdf') return;

    setPdfFile(file);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      setPageCount(pdf.getPageCount());
      setRangeEnd(pdf.getPageCount().toString());
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

  const splitPDF = async () => {
    if (!pdfFile) return;

    setProcessing(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      
      let pageIndices: number[] = [];

      if (splitOption === 'pages') {
        // Parse comma-separated page numbers
        const pageNumbers = pages.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p) && p > 0 && p <= pageCount);
        pageIndices = pageNumbers.map(p => p - 1); // Convert to 0-based indexing
      } else {
        // Parse page range
        const start = Math.max(1, parseInt(rangeStart) || 1);
        const end = Math.min(pageCount, parseInt(rangeEnd) || pageCount);
        for (let i = start - 1; i < end; i++) {
          pageIndices.push(i);
        }
      }

      if (pageIndices.length === 0) {
        alert('Please specify valid page numbers or range.');
        return;
      }

      // Create new PDF with selected pages
      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
      copiedPages.forEach(page => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      // Show preview option
      const previewUrl = URL.createObjectURL(blob);
      setPreviewUrl(previewUrl);
      setShowPreview(true);
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const fileName = pdfFile.name.replace('.pdf', '');
      if (splitOption === 'pages') {
        a.download = `${fileName}_pages_${pages.replace(/,/g, '-')}.pdf`;
      } else {
        a.download = `${fileName}_pages_${rangeStart}-${rangeEnd}.pdf`;
      }
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error splitting PDF:', error);
      alert('Failed to split PDF. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Split className="h-8 w-8 text-blue-400" />
          <Scissors className="h-8 w-8 text-purple-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Split PDF</h2>
        <p className="text-slate-400">Extract specific pages or page ranges from your PDF</p>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-white/30 rounded-xl p-12 text-center mb-8 hover:border-blue-400 hover:bg-white/5 transition-all duration-300 cursor-pointer"
        onClick={() => document.getElementById('pdf-split-upload')?.click()}
      >
        <Upload className="h-12 w-12 text-blue-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Drop your PDF file here</h3>
        <p className="text-slate-400 mb-4">or click to browse files</p>
        <p className="text-sm text-slate-500">Upload a PDF file to split</p>
        <input
          id="pdf-split-upload"
          type="file"
          accept=".pdf"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
        />
      </div>

      {/* PDF Info */}
      {pdfFile && (
        <div className="mb-8">
          <div className="bg-white/10 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-6 w-6 text-red-400" />
              <div>
                <h3 className="text-white font-medium">{pdfFile.name}</h3>
                <p className="text-slate-400 text-sm">
                  {pageCount} pages • {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>

            {/* Split Options */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-3 p-4 border border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                  <input
                    type="radio"
                    name="splitOption"
                    value="pages"
                    checked={splitOption === 'pages'}
                    onChange={(e) => setSplitOption(e.target.value as 'pages')}
                    className="text-blue-500"
                  />
                  <div>
                    <h4 className="text-white font-medium">Specific Pages</h4>
                    <p className="text-slate-400 text-sm">Extract individual pages</p>
                  </div>
                </label>
                {splitOption === 'pages' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={pages}
                      onChange={(e) => setPages(e.target.value)}
                      placeholder="e.g., 1,3,5-7,10"
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
                    />
                    <p className="text-slate-500 text-xs mt-1">
                      Enter page numbers separated by commas (e.g., 1,3,5) or ranges (e.g., 1-5)
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center space-x-3 p-4 border border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                  <input
                    type="radio"
                    name="splitOption"
                    value="range"
                    checked={splitOption === 'range'}
                    onChange={(e) => setSplitOption(e.target.value as 'range')}
                    className="text-blue-500"
                  />
                  <div>
                    <h4 className="text-white font-medium">Page Range</h4>
                    <p className="text-slate-400 text-sm">Extract a continuous range</p>
                  </div>
                </label>
                {splitOption === 'range' && (
                  <div className="mt-3 flex space-x-3">
                    <div className="flex-1">
                      <label className="block text-slate-400 text-sm mb-1">From page</label>
                      <input
                        type="number"
                        min="1"
                        max={pageCount}
                        value={rangeStart}
                        onChange={(e) => setRangeStart(e.target.value)}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-slate-400 text-sm mb-1">To page</label>
                      <input
                        type="number"
                        min="1"
                        max={pageCount}
                        value={rangeEnd}
                        onChange={(e) => setRangeEnd(e.target.value)}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Split Button */}
            <div className="text-center mt-6">
              <button
                onClick={splitPDF}
                disabled={processing || (!pages && splitOption === 'pages') || (!rangeStart || !rangeEnd)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Splitting...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    <span>Split PDF</span>
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
                  a.download = `split-pages.pdf`;
                  a.click();
                  setShowPreview(false);
                }}
                className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-all duration-300"
              >
                <Download className="h-5 w-5 inline mr-2" />
                Download Split PDF
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

export default PDFSplit;