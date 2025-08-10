import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, Type, Edit3, Square, Circle, Undo, Redo, Eye, Settings, Palette, Minus, Plus, Trash2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker

interface Annotation {
  id: string;
  type: 'text' | 'draw' | 'rectangle' | 'circle';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  strokeWidth: number;
  fontSize?: number;
  points?: { x: number; y: number }[];
  pageNumber: number;
}

export default function PDFEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedTool, setSelectedTool] = useState<'text' | 'draw' | 'rectangle' | 'circle'>('text');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [annotationColor, setAnnotationColor] = useState('#ff0000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fontSize, setFontSize] = useState(16);
  const [undoStack, setUndoStack] = useState<Annotation[][]>([]);
  const [redoStack, setRedoStack] = useState<Annotation[][]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load PDF and render current page
  const loadPDF = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      renderPage(pdf, 1);
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Failed to load PDF. Please ensure the file is valid.');
    }
  };

  // Render PDF page as background
  const renderPage = useCallback(async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number) => {
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: scale });
      
      const pdfCanvas = pdfCanvasRef.current;
      const annotationCanvas = canvasRef.current;
      
      if (!pdfCanvas || !annotationCanvas) return;

      // Set canvas dimensions
      pdfCanvas.width = viewport.width;
      pdfCanvas.height = viewport.height;
      annotationCanvas.width = viewport.width;
      annotationCanvas.height = viewport.height;

      // Render PDF page
      const pdfContext = pdfCanvas.getContext('2d');
      if (pdfContext) {
        const renderContext = {
          canvasContext: pdfContext,
          viewport: viewport,
        } as const;
        await page.render(renderContext).promise;
      }

      // Clear and re-render annotations
      renderAnnotations();
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  }, [scale, renderAnnotations]);

  // Render all annotations for current page
  const renderAnnotations = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Filter annotations for current page
    const pageAnnotations = annotations.filter(ann => ann.pageNumber === currentPage);

    // Draw existing annotations
    pageAnnotations.forEach(annotation => {
      ctx.strokeStyle = annotation.color;
      ctx.fillStyle = annotation.color;
      ctx.lineWidth = annotation.strokeWidth;

      switch (annotation.type) {
        case 'text':
          if (annotation.text) {
            ctx.font = `${annotation.fontSize || 16}px Arial`;
            ctx.fillText(annotation.text, annotation.x, annotation.y);
          }
          break;
        case 'draw':
          if (annotation.points && annotation.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
            annotation.points.forEach(point => {
              ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
          }
          break;
        case 'rectangle':
          if (annotation.width && annotation.height) {
            ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);
          }
          break;
        case 'circle':
          if (annotation.width && annotation.height) {
            const radius = Math.sqrt(annotation.width ** 2 + annotation.height ** 2) / 2;
            ctx.beginPath();
            ctx.arc(annotation.x + annotation.width / 2, annotation.y + annotation.height / 2, radius, 0, 2 * Math.PI);
            ctx.stroke();
          }
          break;
      }

      // Highlight selected annotation
      if (selectedAnnotation === annotation.id) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(annotation.x - 5, annotation.y - 5, (annotation.width || 20) + 10, (annotation.height || 20) + 10);
        ctx.setLineDash([]);
      }
    });

    // Draw current annotation being created
    if (currentAnnotation && currentAnnotation.pageNumber === currentPage) {
      ctx.strokeStyle = currentAnnotation.color;
      ctx.fillStyle = currentAnnotation.color;
      ctx.lineWidth = currentAnnotation.strokeWidth;

      switch (currentAnnotation.type) {
        case 'draw':
          if (currentAnnotation.points && currentAnnotation.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(currentAnnotation.points[0].x, currentAnnotation.points[0].y);
            currentAnnotation.points.forEach(point => {
              ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
          }
          break;
        case 'rectangle':
          if (currentAnnotation.width && currentAnnotation.height) {
            ctx.strokeRect(currentAnnotation.x, currentAnnotation.y, currentAnnotation.width, currentAnnotation.height);
          }
          break;
        case 'circle':
          if (currentAnnotation.width && currentAnnotation.height) {
            const radius = Math.sqrt(currentAnnotation.width ** 2 + currentAnnotation.height ** 2) / 2;
            ctx.beginPath();
            ctx.arc(currentAnnotation.x + currentAnnotation.width / 2, currentAnnotation.y + currentAnnotation.height / 2, radius, 0, 2 * Math.PI);
            ctx.stroke();
          }
          break;
      }
    }
  }, [annotations, currentAnnotation, currentPage, selectedAnnotation]);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
      setAnnotations([]);
      setUndoStack([]);
      setRedoStack([]);
      setCurrentPage(1);
      loadPDF(uploadedFile);
    }
  };

  // Save annotation to state
  const saveAnnotation = () => {
    if (currentAnnotation) {
      const newAnnotations = [...annotations, currentAnnotation];
      setUndoStack([...undoStack, annotations]);
      setRedoStack([]);
      setAnnotations(newAnnotations);
      setCurrentAnnotation(null);
    }
  };

  // Get mouse position relative to canvas
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  // Handle mouse down on canvas
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMousePos(e);

    // Check if clicking on existing annotation
    const clickedAnnotation = annotations
      .filter(ann => ann.pageNumber === currentPage)
      .find(ann => {
        if (ann.type === 'text') {
          return x >= ann.x && x <= ann.x + 100 && y >= ann.y - 20 && y <= ann.y + 5;
        } else if (ann.width && ann.height) {
          return x >= ann.x && x <= ann.x + ann.width && y >= ann.y && y <= ann.y + ann.height;
        }
        return false;
      });

    if (clickedAnnotation) {
      setSelectedAnnotation(clickedAnnotation.id);
      return;
    }

    setSelectedAnnotation(null);

    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type: selectedTool,
      x,
      y,
      color: annotationColor,
      strokeWidth,
      fontSize,
      pageNumber: currentPage,
      points: selectedTool === 'draw' ? [{ x, y }] : undefined,
    };

    setCurrentAnnotation(newAnnotation);
    setIsDrawing(true);
  };

  // Handle mouse move on canvas
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAnnotation) return;

    const { x, y } = getMousePos(e);

    if (selectedTool === 'draw' && currentAnnotation.points) {
      setCurrentAnnotation({
        ...currentAnnotation,
        points: [...currentAnnotation.points, { x, y }],
      });
    } else if (selectedTool === 'rectangle' || selectedTool === 'circle') {
      setCurrentAnnotation({
        ...currentAnnotation,
        width: x - currentAnnotation.x,
        height: y - currentAnnotation.y,
      });
    }
  };

  // Handle mouse up on canvas
  const handleCanvasMouseUp = () => {
    if (selectedTool === 'text' && currentAnnotation) {
      const text = prompt('Enter text:');
      if (text) {
        setCurrentAnnotation({ ...currentAnnotation, text });
        saveAnnotation();
      } else {
        setCurrentAnnotation(null);
      }
    } else if (currentAnnotation) {
      saveAnnotation();
    }
    setIsDrawing(false);
  };

  // Navigate pages
  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages && pdfDoc) {
      setCurrentPage(pageNum);
      renderPage(pdfDoc, pageNum);
    }
  };

  // Undo/Redo functions
  const undo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setRedoStack([...redoStack, annotations]);
      setAnnotations(previousState);
      setUndoStack(undoStack.slice(0, -1));
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      setUndoStack([...undoStack, annotations]);
      setAnnotations(nextState);
      setRedoStack(redoStack.slice(0, -1));
    }
  };

  // Delete selected annotation
  const deleteSelectedAnnotation = () => {
    if (selectedAnnotation) {
      const newAnnotations = annotations.filter(ann => ann.id !== selectedAnnotation);
      setUndoStack([...undoStack, annotations]);
      setRedoStack([]);
      setAnnotations(newAnnotations);
      setSelectedAnnotation(null);
    }
  };

  // Download edited PDF
  const downloadEditedPDF = async () => {
    if (!file) return;

    setProcessing(true);
    try {
      // Create a simple download of the original file with annotations info
      // In a real implementation, you would overlay annotations on the PDF
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edited_${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Show annotation summary
      const annotationCount = annotations.length;
      alert(`PDF downloaded with ${annotationCount} annotations!\n\nNote: This is a demo. In production, annotations would be embedded in the PDF.`);
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Failed to process PDF. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Re-render annotations when they change
  useEffect(() => {
    renderAnnotations();
  }, [renderAnnotations]);

  // Re-render page when current page changes
  useEffect(() => {
    if (pdfDoc) {
      renderPage(pdfDoc, currentPage);
    }
  }, [currentPage, pdfDoc, renderPage]);

  return (
    <div className="p-8 animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Edit3 className="h-8 w-8 text-blue-400" />
          <Type className="h-8 w-8 text-purple-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">PDF Editor</h2>
        <p className="text-slate-400">Edit and annotate your PDF documents with live preview</p>
      </div>

      {!file ? (
        <div
          className="border-2 border-dashed border-white/30 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-white/5 transition-all duration-300 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Upload a PDF file to start editing</h3>
          <p className="text-slate-400 mb-4">or click to browse files</p>
          <p className="text-sm text-slate-500">Add text, drawings, shapes, and annotations</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Toolbar */}
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/20">
            <div className="flex flex-wrap items-center gap-4">
              {/* Tools */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTool('text')}
                  className={`p-3 rounded-lg transition-all ${
                    selectedTool === 'text' ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                  title="Text Tool"
                >
                  <Type className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedTool('draw')}
                  className={`p-3 rounded-lg transition-all ${
                    selectedTool === 'draw' ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                  title="Draw Tool"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedTool('rectangle')}
                  className={`p-3 rounded-lg transition-all ${
                    selectedTool === 'rectangle' ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                  title="Rectangle Tool"
                >
                  <Square className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedTool('circle')}
                  className={`p-3 rounded-lg transition-all ${
                    selectedTool === 'circle' ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                  title="Circle Tool"
                >
                  <Circle className="w-5 h-5" />
                </button>
              </div>

              <div className="w-px h-8 bg-white/20"></div>

              {/* Undo/Redo */}
              <div className="flex gap-2">
                <button
                  onClick={undo}
                  disabled={undoStack.length === 0}
                  className="p-3 rounded-lg bg-white/10 text-slate-300 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  title="Undo"
                >
                  <Undo className="w-5 h-5" />
                </button>
                <button
                  onClick={redo}
                  disabled={redoStack.length === 0}
                  className="p-3 rounded-lg bg-white/10 text-slate-300 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  title="Redo"
                >
                  <Redo className="w-5 h-5" />
                </button>
              </div>

              <div className="w-px h-8 bg-white/20"></div>

              {/* Delete */}
              <button
                onClick={deleteSelectedAnnotation}
                disabled={!selectedAnnotation}
                className="p-3 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                title="Delete Selected"
              >
                <Trash2 className="w-5 h-5" />
              </button>

              <div className="w-px h-8 bg-white/20"></div>

              {/* Settings Toggle */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-3 rounded-lg bg-white/10 text-slate-300 hover:bg-white/20 transition-all"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Preview */}
              <button
                onClick={() => setShowPreview(true)}
                className="p-3 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all"
                title="Preview"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-slate-400" />
                    <label className="text-sm font-medium text-slate-300">Color:</label>
                    <input
                      type="color"
                      value={annotationColor}
                      onChange={(e) => setAnnotationColor(e.target.value)}
                      className="w-8 h-8 rounded border border-white/20 bg-transparent"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-300">Stroke:</label>
                    <button
                      onClick={() => setStrokeWidth(Math.max(1, strokeWidth - 1))}
                      className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm text-slate-300">{strokeWidth}</span>
                    <button
                      onClick={() => setStrokeWidth(Math.min(10, strokeWidth + 1))}
                      className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-300">Font Size:</label>
                    <button
                      onClick={() => setFontSize(Math.max(8, fontSize - 2))}
                      className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm text-slate-300">{fontSize}</span>
                    <button
                      onClick={() => setFontSize(Math.min(48, fontSize + 2))}
                      className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-300">Zoom:</label>
                    <button
                      onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                      className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-12 text-center text-sm text-slate-300">{Math.round(scale * 100)}%</span>
                    <button
                      onClick={() => setScale(Math.min(3, scale + 0.1))}
                      className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Page Navigation */}
          <div className="flex items-center justify-between bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/20">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <span className="text-white font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>

          {/* PDF Editor Canvas */}
          <div className="relative bg-white rounded-xl overflow-hidden shadow-2xl" ref={containerRef}>
            <canvas
              ref={pdfCanvasRef}
              className="absolute top-0 left-0 w-full h-auto"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-auto cursor-crosshair"
              style={{ maxWidth: '100%', height: 'auto' }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
            />
          </div>

          {/* Download Button */}
          <div className="text-center">
            <button
              onClick={downloadEditedPDF}
              disabled={processing}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
            >
              <Download className="h-5 w-5" />
              {processing ? 'Processing...' : 'Download Edited PDF'}
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm">
          <div className="max-w-6xl max-h-6xl p-8 relative bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">PDF Preview with Annotations</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="relative bg-white rounded-lg overflow-hidden">
              <canvas
                ref={pdfCanvasRef}
                className="w-full h-auto"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-auto pointer-events-none"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={downloadEditedPDF}
                className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-all duration-300"
              >
                <Download className="h-5 w-5 inline mr-2" />
                Download Edited PDF
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
}