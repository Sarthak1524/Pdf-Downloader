import React, { useState } from 'react';
import { Upload, FileText, Merge, Split, Compass as Compress, Image, Download, Sparkles, Shield, Zap, Edit, Star, Crown, Gem } from 'lucide-react';
import ImageToPDF from './components/ImageToPDF';
import PDFMerge from './components/PDFMerge';
import PDFSplit from './components/PDFSplit';
import PDFCompress from './components/PDFCompress';
import PDFToImages from './components/PDFToImages';
import PDFEditor from './components/PDFEditor';

function App() {
  const [activeTab, setActiveTab] = useState('image-to-pdf');

  const tools = [
    {
      id: 'image-to-pdf',
      name: 'Image to PDF',
      icon: Image,
      description: 'Convert to 4K Ultra-HD PDF quality',
      premium: true
    },
    {
      id: 'merge-pdf',
      name: 'Merge PDFs',
      icon: Merge,
      description: 'Combine multiple PDF files seamlessly',
      premium: false
    },
    {
      id: 'split-pdf',
      name: 'Split PDF',
      icon: Split,
      description: 'Extract pages with precision',
      premium: false
    },
    {
      id: 'compress-pdf',
      name: 'Compress PDF',
      icon: Compress,
      description: 'Smart compression technology',
      premium: false
    },
    {
      id: 'pdf-to-images',
      name: 'PDF to Images',
      icon: FileText,
      description: 'Export high-quality images',
      premium: false
    },
    {
      id: 'pdf-editor',
      name: 'PDF Editor',
      icon: Edit,
      description: 'Professional editing suite',
      premium: true
    }
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'image-to-pdf':
        return <ImageToPDF />;
      case 'merge-pdf':
        return <PDFMerge />;
      case 'split-pdf':
        return <PDFSplit />;
      case 'compress-pdf':
        return <PDFCompress />;
      case 'pdf-to-images':
        return <PDFToImages />;
      case 'pdf-editor':
        return <PDFEditor />;
      default:
        return <ImageToPDF />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 animate-gradient-x relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full animate-float blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full animate-float blur-3xl" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full animate-pulse-slow blur-3xl"></div>
      </div>
      
      {/* Header */}
      <header className="relative overflow-hidden animate-fade-in">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-2xl animate-pulse-slow shadow-2xl">
                <Crown className="h-10 w-10 text-white animate-float" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white animate-slide-in-left bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  PDFTools Ultra
                </h1>
                <p className="text-blue-300 text-sm animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
                  Professional Grade • 4K Quality
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 animate-slide-in-right">
              <div className="flex items-center space-x-2 bg-emerald-500/20 px-4 py-2 rounded-full border border-emerald-400/30">
                <Shield className="h-5 w-5 text-emerald-400" />
                <span className="font-bold text-emerald-300">100% Free Forever</span>
              </div>
              <div className="flex items-center space-x-1 bg-yellow-500/20 px-3 py-2 rounded-full border border-yellow-400/30">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="font-medium text-yellow-300 text-sm">Premium</span>
              </div>
            </div>
          </div>
          
          <div className="text-center max-w-4xl mx-auto animate-fade-in-up">
            <h2 className="text-6xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Ultra-Premium PDF Suite
              </span>
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent block text-4xl mt-2">
                No Login • No Limits • No Compromise ✨
              </span>
            </h2>
            <p className="text-2xl text-slate-300 mb-8 leading-relaxed font-light">
              Experience professional-grade PDF processing with <span className="text-blue-400 font-semibold">4K Ultra-HD quality</span>, 
              advanced editing capabilities, and lightning-fast performance. All tools are completely free with no registration required.
            </p>
            
            <div className="flex flex-wrap justify-center gap-8 text-slate-300">
              <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
                <span className="font-medium">Instant Access</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                <Zap className="h-5 w-5 text-blue-400 animate-pulse" />
                <span className="font-medium">Lightning Fast</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                <Shield className="h-5 w-5 text-emerald-400 animate-pulse" />
                <span className="font-medium">Bank-Level Security</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                <Gem className="h-5 w-5 text-purple-400 animate-pulse" />
                <span className="font-medium">4K Ultra Quality</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="container mx-auto px-6 py-8 animate-slide-in-up">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveTab(tool.id)}
                  className={`relative p-5 rounded-xl transition-all duration-500 text-left group hover:scale-110 hover:-translate-y-2 ${
                    activeTab === tool.id
                      ? 'bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white shadow-2xl shadow-blue-500/50 animate-glow'
                      : 'text-white hover:bg-white/15 hover:shadow-xl hover:shadow-white/10'
                  }`}
                >
                  {tool.premium && (
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                      ULTRA
                    </div>
                  )}
                  <Icon className={`h-7 w-7 mb-3 ${activeTab === tool.id ? 'text-white animate-float' : 'text-blue-400 group-hover:text-blue-300'}`} />
                  <h3 className="font-bold text-sm mb-2">{tool.name}</h3>
                  <p className="text-xs opacity-90 leading-tight">{tool.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 pb-12 animate-fade-in-up">
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          {renderActiveComponent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 animate-fade-in">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Crown className="h-5 w-5 text-yellow-400" />
              <p className="text-slate-300 font-medium">
                © 2025 PDFTools Ultra - Premium Quality, Forever Free
              </p>
              <Crown className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="flex justify-center space-x-8 text-sm text-slate-400 mb-4">
              <span className="flex items-center space-x-1">
                <Gem className="h-4 w-4 text-purple-400" />
                <span>4K Ultra Processing</span>
              </span>
              <span className="flex items-center space-x-1">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span>Zero Data Collection</span>
              </span>
              <span className="flex items-center space-x-1">
                <Zap className="h-4 w-4 text-blue-400" />
                <span>Unlimited Usage</span>
              </span>
              <span className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>Professional Grade</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              All processing happens locally in your browser. Your files never leave your device.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;