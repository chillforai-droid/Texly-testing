import React, { useState, useRef, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { 
  Upload, FileText, Download, Loader2, AlertCircle, 
  CheckCircle2, Trash2, Lock, Type, RotateCw, 
  Scissors, Combine, Plus, Minus, MoveUp, MoveDown,
  Eye, Settings2, Layers, Zap
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import JSZip from 'jszip';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PDFPage {
  id: string;
  fileIndex: number;
  pageIndex: number;
  rotation: number;
  thumbnail: string;
  isSelected: boolean;
}

interface PDFToolWorkspaceProps {
  toolId: string;
  toolName: string;
}

export const PDFToolWorkspace: React.FC<PDFToolWorkspaceProps> = ({ toolId, toolName }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [pdfPages, setPdfPages] = useState<PDFPage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [result, setResult] = useState<{ url: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [password, setPassword] = useState('');
  const [textContent, setTextContent] = useState('');
  const [fontSize, setFontSize] = useState(12);
  const [textColor, setTextColor] = useState('#000000');
  const [textPosition, setTextPosition] = useState<'top' | 'center' | 'bottom'>('top');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');

  const onDrop = async (acceptedFiles: File[]) => {
    setIsLoadingPages(true);
    setError(null);
    setResult(null);
    
    const currentFilesCount = files.length;
    const newFiles = [...files, ...acceptedFiles];
    setFiles(newFiles);

    try {
      const allNewPages: PDFPage[] = [];
      
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        if (file.type === 'application/pdf') {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          
          for (let j = 1; j <= pdf.numPages; j++) {
            const page = await pdf.getPage(j);
            const viewport = page.getViewport({ scale: 0.3 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context!, viewport, canvas }).promise;
            
            allNewPages.push({
              id: `${file.name}-${j}-${Date.now()}-${Math.random()}`,
              fileIndex: currentFilesCount + i,
              pageIndex: j - 1,
              rotation: 0,
              thumbnail: canvas.toDataURL(),
              isSelected: false
            });
          }
        }
      }
      
      setPdfPages(prev => [...prev, ...allNewPages]);
    } catch (err) {
      console.error('Error loading PDF pages:', err);
      setError('Failed to load some PDF pages. They might be password protected.');
    } finally {
      setIsLoadingPages(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptTypes(toolId),
    multiple: true
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    // Re-index pages is complex, simpler to clear and let user re-upload if they want to remove specific file
    // or just let them delete pages individually from the workspace
  };

  const togglePageSelection = (id: string) => {
    setPdfPages(prev => prev.map(p => 
      p.id === id ? { ...p, isSelected: !p.isSelected } : p
    ));
  };

  const rotatePage = (id: string) => {
    setPdfPages(prev => prev.map(p => 
      p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p
    ));
  };

  const deletePage = (id: string) => {
    setPdfPages(prev => prev.filter(p => p.id !== id));
  };

  const handleProcess = async () => {
    if (files.length === 0 && toolId !== 'generate-pdf') {
      setError('Please upload at least one file.');
      return;
    }

    if (toolId === 'generate-pdf' && !textContent) {
      setError('Please enter some text to generate a PDF.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      let blob: Blob;
      let fileName = `${toolId}-${Date.now()}`;

      switch (toolId) {
        case 'merge-pdf':
          blob = await mergePdfs(files, pdfPages);
          fileName += '.pdf';
          break;
        case 'split-pdf':
          const selectedPages = pdfPages.filter(p => p.isSelected);
          if (selectedPages.length === 0) throw new Error('Please select pages to extract.');
          blob = await splitPdf(files, selectedPages);
          fileName += '-extracted.pdf';
          break;
        case 'rotate-pdf':
          blob = await rotatePdfPages(files, pdfPages);
          fileName += '-rotated.pdf';
          break;
        case 'image-to-pdf':
          blob = await convertImagesToPdf(files);
          fileName += '.pdf';
          break;
        case 'pdf-to-image':
          blob = await convertPdfToImages(files[0]);
          fileName += '.zip';
          break;
        case 'pdf-compress':
        case 'pdf-size-reduce':
          blob = await compressPdf(files[0]);
          fileName += '.pdf';
          break;
        case 'pdf-password-remover':
          blob = await removePdfPassword(files[0], password);
          fileName += '.pdf';
          break;
        case 'pdf-excel':
          blob = await convertPdfToExcel(files[0]);
          fileName += '.xlsx';
          break;
        case 'excel-to-pdf':
          blob = await convertExcelToPdf(files[0]);
          fileName += '.pdf';
          break;
        case 'word-to-pdf':
          blob = await convertWordToPdf(files[0]);
          fileName += '.pdf';
          break;
        case 'pdf-to-word':
          blob = await convertPdfToWord(files[0]);
          fileName += '.docx';
          break;
        case 'generate-pdf':
          blob = await generatePdfFromText(textContent);
          fileName += '.pdf';
          break;
        case 'pdf-editor':
          blob = await editPdf(files, pdfPages, textContent, fontSize, textColor, textPosition, textAlign);
          fileName += '-edited.pdf';
          break;
        default:
          throw new Error('Tool logic not implemented yet.');
      }

      const url = URL.createObjectURL(blob);
      setResult({ url, name: fileName });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during processing.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (result) {
      saveAs(result.url, result.name);
    }
  };

  return (
    <div className="space-y-8">
      {/* Configuration Section */}
      {(toolId === 'pdf-password-remover' || toolId === 'generate-pdf' || toolId === 'pdf-editor') && !result && (
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 flex items-center gap-3 uppercase tracking-wider text-sm">
              <div className="p-2 bg-blue-100 rounded-xl">
                {toolId === 'pdf-password-remover' ? <Lock className="w-5 h-5 text-blue-600" /> : <Settings2 className="w-5 h-5 text-blue-600" />}
              </div>
              {toolId === 'pdf-password-remover' ? 'Security Settings' : 'Editor Settings'}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {toolId === 'pdf-password-remover' && (
              <div className="space-y-2 col-span-full">
                <label className="text-sm font-bold text-slate-700">PDF Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password to unlock..."
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {(toolId === 'generate-pdf' || toolId === 'pdf-editor') && (
              <>
                <div className="space-y-2 col-span-full">
                  <label className="text-sm font-bold text-slate-700">
                    {toolId === 'pdf-editor' ? 'Text to Add' : 'PDF Content'}
                  </label>
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder={toolId === 'pdf-editor' ? 'Type text to overlay on pages...' : 'Write the content for your new PDF...'}
                    rows={4}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none resize-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Font Size</label>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setFontSize(Math.max(8, fontSize - 2))} className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200"><Minus className="w-4 h-4" /></button>
                    <span className="font-bold text-slate-900 w-8 text-center">{fontSize}</span>
                    <button onClick={() => setFontSize(fontSize + 2)} className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Text Color</label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Position</label>
                  <select
                    value={textPosition}
                    onChange={(e) => setTextPosition(e.target.value as any)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                  >
                    <option value="top">Top</option>
                    <option value="center">Center</option>
                    <option value="bottom">Bottom</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Alignment</label>
                  <select
                    value={textAlign}
                    onChange={(e) => setTextAlign(e.target.value as any)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Upload Area */}
      {!result && toolId !== 'generate-pdf' && (
        <div
          {...getRootProps()}
          className={`relative overflow-hidden border-3 border-dashed rounded-[2.5rem] p-8 sm:p-16 text-center transition-all cursor-pointer group
            ${isDragActive ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' : 'border-slate-200 hover:border-blue-400 bg-slate-50/50'}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-6 relative z-10">
            <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-200 group-hover:scale-110 transition-transform duration-500">
              <Upload className="w-10 h-10 text-white" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {isDragActive ? 'Drop files here' : 'Select PDF Files'}
              </p>
              <p className="text-slate-500 mt-2 font-medium">
                Drag & drop or click to browse
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {Object.keys(getAcceptTypes(toolId)).map(type => (
                <span key={type} className="px-4 py-1.5 bg-white text-slate-600 border border-slate-200 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                  {type.split('/')[1] || type}
                </span>
              ))}
            </div>
          </div>
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full -ml-32 -mb-32"></div>
        </div>
      )}

      {/* Workspace Area */}
      {pdfPages.length > 0 && !result && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Document Pages</h3>
            </div>
            <div className="flex gap-2">
              {toolId === 'split-pdf' && (
                <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Scissors className="w-4 h-4" />
                  Select pages to extract
                </span>
              )}
              <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold">
                {pdfPages.length} Pages
              </span>
            </div>
          </div>

          {isLoadingPages ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-slate-500 font-bold">Rendering pages...</p>
            </div>
          ) : (
            <Reorder.Group 
              axis="y" 
              values={pdfPages} 
              onReorder={setPdfPages}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
            >
              {pdfPages.map((page) => (
                <Reorder.Item
                  key={page.id}
                  value={page}
                  className={`relative group cursor-grab active:cursor-grabbing rounded-2xl overflow-hidden border-4 transition-all
                    ${page.isSelected ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-white shadow-sm hover:shadow-xl hover:border-slate-100'}`}
                  onClick={() => toolId === 'split-pdf' && togglePageSelection(page.id)}
                >
                  <div className="aspect-[3/4] bg-slate-100 relative overflow-hidden">
                    <img 
                      src={page.thumbnail} 
                      alt={`Page ${page.pageIndex + 1}`}
                      className="w-full h-full object-contain transition-transform duration-300"
                      style={{ transform: `rotate(${page.rotation}deg)` }}
                    />
                    
                    {/* Page Number Overlay */}
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-black rounded-lg">
                      P{page.pageIndex + 1}
                    </div>

                    {/* Selection Checkbox */}
                    {toolId === 'split-pdf' && (
                      <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                        ${page.isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/50 border-white text-transparent'}`}>
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); rotatePage(page.id); }}
                        className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-xl backdrop-blur-md transition-all"
                        title="Rotate Clockwise"
                      >
                        <RotateCw className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deletePage(page.id); }}
                        className="p-2 bg-rose-500/20 hover:bg-rose-500/40 text-white rounded-xl backdrop-blur-md transition-all"
                        title="Delete Page"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleProcess}
              disabled={isProcessing || isLoadingPages}
              className="flex-1 py-5 bg-blue-600 text-white rounded-[2rem] font-black flex items-center justify-center gap-3 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-2xl shadow-blue-200 text-lg uppercase tracking-wider"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6" />
                  {toolId === 'merge-pdf' ? 'Merge & Download' : 
                   toolId === 'split-pdf' ? 'Extract Selected Pages' :
                   toolId === 'rotate-pdf' ? 'Save Rotated PDF' :
                   'Apply Changes & Save'}
                </>
              )}
            </button>
            
            <button
              onClick={() => { setFiles([]); setPdfPages([]); setResult(null); }}
              className="px-8 py-5 bg-white text-slate-600 border-2 border-slate-100 rounded-[2rem] font-black hover:bg-slate-50 transition-all uppercase tracking-wider text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-rose-50 border-2 border-rose-100 rounded-3xl flex items-center gap-4 text-rose-600"
        >
          <div className="p-2 bg-rose-100 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <p className="font-bold">{error}</p>
        </motion.div>
      )}

      {/* Result Area */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-10 sm:p-20 bg-emerald-50 border-2 border-emerald-100 rounded-[3rem] text-center space-y-8 relative overflow-hidden"
        >
          <div className="w-24 h-24 rounded-[2rem] bg-emerald-600 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-200 relative z-10">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <div className="relative z-10">
            <h3 className="text-4xl font-black text-slate-900 tracking-tight">Task Complete!</h3>
            <p className="text-slate-600 mt-4 text-lg font-medium max-w-md mx-auto">
              Your document has been processed successfully. You can now download the result.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <button
              onClick={downloadResult}
              className="px-10 py-5 bg-emerald-600 text-white rounded-[2rem] font-black flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 text-lg uppercase tracking-wider"
            >
              <Download className="w-6 h-6" />
              Download Result
            </button>
            <button
              onClick={() => {
                setResult(null);
                setFiles([]);
                setPdfPages([]);
                setPassword('');
                setTextContent('');
              }}
              className="px-10 py-5 bg-white text-slate-600 border-2 border-slate-100 rounded-[2rem] font-black hover:bg-slate-50 transition-all uppercase tracking-wider text-sm"
            >
              Start New Task
            </button>
          </div>
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 blur-[120px] rounded-full -ml-48 -mb-48"></div>
        </motion.div>
      )}
    </div>
  );
};

// Helper functions for PDF processing
function getAcceptTypes(toolId: string) {
  switch (toolId) {
    case 'image-to-pdf':
      return { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] };
    case 'excel-to-pdf':
      return { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'text/csv': ['.csv'] };
    case 'word-to-pdf':
      return { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'application/msword': ['.doc'] };
    case 'generate-pdf':
      return { 'text/plain': ['.txt'] };
    default:
      return { 'application/pdf': ['.pdf'] };
  }
}

async function mergePdfs(files: File[], pages: PDFPage[]): Promise<Blob> {
  const mergedPdf = await PDFDocument.create();
  
  // Cache loaded documents to avoid redundant loads
  const loadedDocs: Record<number, PDFDocument> = {};
  
  for (const pageInfo of pages) {
    if (!loadedDocs[pageInfo.fileIndex]) {
      const arrayBuffer = await files[pageInfo.fileIndex].arrayBuffer();
      loadedDocs[pageInfo.fileIndex] = await PDFDocument.load(arrayBuffer);
    }
    
    const [copiedPage] = await mergedPdf.copyPages(loadedDocs[pageInfo.fileIndex], [pageInfo.pageIndex]);
    if (pageInfo.rotation !== 0) {
      copiedPage.setRotation(degrees(pageInfo.rotation));
    }
    mergedPdf.addPage(copiedPage);
  }
  
  const pdfBytes = await mergedPdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

async function splitPdf(files: File[], selectedPages: PDFPage[]): Promise<Blob> {
  const newPdf = await PDFDocument.create();
  const loadedDocs: Record<number, PDFDocument> = {};
  
  for (const pageInfo of selectedPages) {
    if (!loadedDocs[pageInfo.fileIndex]) {
      const arrayBuffer = await files[pageInfo.fileIndex].arrayBuffer();
      loadedDocs[pageInfo.fileIndex] = await PDFDocument.load(arrayBuffer);
    }
    const [copiedPage] = await newPdf.copyPages(loadedDocs[pageInfo.fileIndex], [pageInfo.pageIndex]);
    newPdf.addPage(copiedPage);
  }
  
  const pdfBytes = await newPdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

async function rotatePdfPages(files: File[], pages: PDFPage[]): Promise<Blob> {
  // For rotation, we basically re-merge but with rotation applied
  return mergePdfs(files, pages);
}

async function convertImagesToPdf(files: File[]): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    let image;
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      image = await pdfDoc.embedJpg(arrayBuffer);
    } else if (file.type === 'image/png') {
      image = await pdfDoc.embedPng(arrayBuffer);
    } else {
      continue;
    }
    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

async function convertPdfToImages(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const zip = new JSZip();
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context!, viewport, canvas }).promise;
    
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/png');
    });
    zip.file(`page-${i}.png`, blob);
  }
  
  return await zip.generateAsync({ type: 'blob' });
}

async function compressPdf(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

async function removePdfPassword(file: File, pass: string): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  try {
    // @ts-ignore - password might not be in types but supported in some versions/forks
    const pdfDoc = await PDFDocument.load(arrayBuffer, { password: pass });
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (e) {
    throw new Error('Invalid password or PDF is not protected.');
  }
}

async function convertPdfToExcel(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const wb = XLSX.utils.book_new();
  const rows: string[][] = [["Extracted Text from " + file.name]];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    rows.push([`Page ${i}`, pageText]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Extracted Data");
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

async function convertExcelToPdf(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);
  const workbook = XLSX.read(data, { type: 'array' });
  let fullText = "";
  
  workbook.SheetNames.forEach(name => {
    const sheet = workbook.Sheets[name];
    fullText += `--- Sheet: ${name} ---\n`;
    fullText += XLSX.utils.sheet_to_csv(sheet) + "\n\n";
  });
  
  return generatePdfFromText(fullText);
}

async function convertWordToPdf(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  // Simple HTML to text for now, but better than nothing
  const text = result.value.replace(/<p>/g, '\n').replace(/<\/p>/g, '').replace(/<[^>]*>?/gm, '');
  return generatePdfFromText(text);
}

async function convertPdfToWord(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const paragraphs: Paragraph[] = [
    new Paragraph({
      children: [new TextRun({ text: "Extracted content from " + file.name, bold: true, size: 32 })],
    })
  ];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: `\n--- Page ${i} ---\n`, bold: true })],
    }));
    
    paragraphs.push(new Paragraph({
      children: [new TextRun(pageText)],
    }));
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: paragraphs,
    }],
  });
  
  const buffer = await Packer.toBuffer(doc);
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}

async function generatePdfFromText(text: string): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  page.drawText(text, {
    x: 50,
    y: height - 50,
    size: 12,
    font,
    color: rgb(0, 0, 0),
    maxWidth: width - 100,
  });
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

async function editPdf(
  files: File[], 
  pages: PDFPage[], 
  overlayText: string, 
  size: number, 
  color: string,
  position: 'top' | 'center' | 'bottom',
  align: 'left' | 'center' | 'right'
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const loadedDocs: Record<number, PDFDocument> = {};
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Convert hex color to rgb
  const r = parseInt(color.slice(1, 3), 16) / 255;
  const g = parseInt(color.slice(3, 5), 16) / 255;
  const b = parseInt(color.slice(5, 7), 16) / 255;

  for (const pageInfo of pages) {
    if (!loadedDocs[pageInfo.fileIndex]) {
      const arrayBuffer = await files[pageInfo.fileIndex].arrayBuffer();
      loadedDocs[pageInfo.fileIndex] = await PDFDocument.load(arrayBuffer);
    }
    
    const [copiedPage] = await pdfDoc.copyPages(loadedDocs[pageInfo.fileIndex], [pageInfo.pageIndex]);
    const { width, height } = copiedPage.getSize();
    
    if (overlayText) {
      const textWidth = font.widthOfTextAtSize(overlayText, size);
      const textHeight = size;
      
      let x = 50;
      if (align === 'center') x = (width - textWidth) / 2;
      else if (align === 'right') x = width - textWidth - 50;
      
      let y = height - 50;
      if (position === 'center') y = (height - textHeight) / 2;
      else if (position === 'bottom') y = 50;

      copiedPage.drawText(overlayText, {
        x,
        y,
        size,
        font,
        color: rgb(r, g, b),
      });
    }
    
    if (pageInfo.rotation !== 0) {
      copiedPage.setRotation(degrees(pageInfo.rotation));
    }
    
    pdfDoc.addPage(copiedPage);
  }
  
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}
