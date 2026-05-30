import React, { useState, useCallback } from 'react';
import {
  Upload, FileText, Download, Loader2, AlertCircle,
  CheckCircle2, Trash2, Lock, Type, RotateCw,
  Scissors, Plus, Minus, Eye, EyeOff, Settings2,
  Layers, Zap, Image, FileImage, FilePlus, Minimize2,
  Unlock, FileSpreadsheet, Combine, X,
  RefreshCw, Info
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import JSZip from 'jszip';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// ─── Types ────────────────────────────────────────────────────────────────────

interface PDFPage {
  id: string;
  fileIndex: number;
  pageIndex: number;
  rotation: number;
  thumbnail: string;
  isSelected: boolean;
  fileName: string;
}

interface PDFToolWorkspaceProps {
  toolId: string;
  toolName: string;
}

// ─── Tool Metadata ────────────────────────────────────────────────────────────

const TOOL_META: Record<string, {
  icon: React.ReactNode;
  color: string;
  accent: string;
  hint: string;
  actionLabel: string;
  outputExt: string;
  tip?: string;
}> = {
  'pdf-editor': {
    icon: <Type className="w-6 h-6" />,
    color: 'from-violet-600 to-purple-700',
    accent: 'violet',
    hint: 'Upload a PDF then add overlay text to each page.',
    actionLabel: 'Apply & Save PDF',
    outputExt: 'pdf',
    tip: 'Text will be drawn on top of every page at your chosen position.'
  },
  'merge-pdf': {
    icon: <Combine className="w-6 h-6" />,
    color: 'from-blue-600 to-indigo-700',
    accent: 'blue',
    hint: 'Upload multiple PDFs — drag to reorder pages before merging.',
    actionLabel: 'Merge & Download',
    outputExt: 'pdf',
    tip: 'Drag page thumbnails to reorder them before merging.'
  },
  'split-pdf': {
    icon: <Scissors className="w-6 h-6" />,
    color: 'from-amber-500 to-orange-600',
    accent: 'amber',
    hint: 'Upload a PDF then click pages you want to extract.',
    actionLabel: 'Extract Selected Pages',
    outputExt: 'pdf',
    tip: 'Click on page thumbnails to select/deselect them.'
  },
  'rotate-pdf': {
    icon: <RotateCw className="w-6 h-6" />,
    color: 'from-teal-500 to-cyan-600',
    accent: 'teal',
    hint: 'Upload a PDF and rotate individual pages as needed.',
    actionLabel: 'Save Rotated PDF',
    outputExt: 'pdf',
    tip: 'Hover over a page and click the rotate button to turn it 90°.'
  },
  'image-to-pdf': {
    icon: <Image className="w-6 h-6" />,
    color: 'from-pink-500 to-rose-600',
    accent: 'pink',
    hint: 'Upload JPG or PNG images — each image becomes one PDF page.',
    actionLabel: 'Convert to PDF',
    outputExt: 'pdf',
    tip: 'Supports JPG, JPEG, PNG, and WebP images.'
  },
  'pdf-to-image': {
    icon: <FileImage className="w-6 h-6" />,
    color: 'from-emerald-500 to-green-600',
    accent: 'emerald',
    hint: 'Upload a PDF to convert each page to a high-quality PNG image.',
    actionLabel: 'Convert to Images ZIP',
    outputExt: 'zip',
    tip: 'Pages are saved as PNG images inside a ZIP archive.'
  },
  'pdf-compress': {
    icon: <Minimize2 className="w-6 h-6" />,
    color: 'from-sky-500 to-blue-600',
    accent: 'sky',
    hint: 'Upload a PDF to compress and reduce its file size.',
    actionLabel: 'Compress PDF',
    outputExt: 'pdf',
    tip: 'Uses object stream optimization for the best compression.'
  },
  'pdf-size-reduce': {
    icon: <Minimize2 className="w-6 h-6" />,
    color: 'from-sky-500 to-blue-600',
    accent: 'sky',
    hint: 'Upload a PDF to reduce its file size.',
    actionLabel: 'Reduce & Download',
    outputExt: 'pdf',
    tip: 'Removes redundant data to minimize the file size.'
  },
  'pdf-password-remover': {
    icon: <Unlock className="w-6 h-6" />,
    color: 'from-rose-500 to-red-600',
    accent: 'rose',
    hint: 'Upload a password-protected PDF and enter its password to unlock it.',
    actionLabel: 'Remove Password & Save',
    outputExt: 'pdf',
    tip: 'If the PDF has an owner password only, leave the field blank.'
  },
  'pdf-excel': {
    icon: <FileSpreadsheet className="w-6 h-6" />,
    color: 'from-green-500 to-emerald-600',
    accent: 'green',
    hint: 'Upload a PDF to extract its text content into an Excel spreadsheet.',
    actionLabel: 'Convert to Excel',
    outputExt: 'xlsx',
    tip: 'Each page\'s text is placed in a separate row in the spreadsheet.'
  },
  'excel-to-pdf': {
    icon: <FileText className="w-6 h-6" />,
    color: 'from-lime-500 to-green-600',
    accent: 'lime',
    hint: 'Upload an XLSX or CSV file to convert it to PDF.',
    actionLabel: 'Convert to PDF',
    outputExt: 'pdf',
    tip: 'All sheets in the workbook are included in the PDF.'
  },
  'word-to-pdf': {
    icon: <FileText className="w-6 h-6" />,
    color: 'from-blue-500 to-sky-600',
    accent: 'blue',
    hint: 'Upload a DOCX or DOC file to convert it to PDF.',
    actionLabel: 'Convert to PDF',
    outputExt: 'pdf',
    tip: 'Text and basic formatting from your Word document will be preserved.'
  },
  'pdf-to-word': {
    icon: <FileText className="w-6 h-6" />,
    color: 'from-indigo-500 to-blue-600',
    accent: 'indigo',
    hint: 'Upload a PDF to extract its text into an editable DOCX file.',
    actionLabel: 'Convert to Word',
    outputExt: 'docx',
    tip: 'Text content is preserved; complex layouts may be simplified.'
  },
  'generate-pdf': {
    icon: <FilePlus className="w-6 h-6" />,
    color: 'from-purple-500 to-violet-600',
    accent: 'purple',
    hint: 'Type or paste your content below to generate a PDF document.',
    actionLabel: 'Generate PDF',
    outputExt: 'pdf',
    tip: 'Use blank lines to separate paragraphs in the output.'
  },
};

// ─── Accept types ─────────────────────────────────────────────────────────────

function getAcceptTypes(toolId: string) {
  switch (toolId) {
    case 'image-to-pdf':
      return { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] };
    case 'excel-to-pdf':
      return {
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'text/csv': ['.csv'],
        'application/vnd.ms-excel': ['.xls'],
      };
    case 'word-to-pdf':
      return {
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'application/msword': ['.doc'],
      };
    case 'generate-pdf':
      return {};
    default:
      return { 'application/pdf': ['.pdf'] };
  }
}

function getAcceptLabel(toolId: string) {
  switch (toolId) {
    case 'image-to-pdf': return 'JPG, PNG, WebP';
    case 'excel-to-pdf': return 'XLSX, XLS, CSV';
    case 'word-to-pdf': return 'DOCX, DOC';
    case 'generate-pdf': return 'No file needed';
    default: return 'PDF';
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const PDFToolWorkspace: React.FC<PDFToolWorkspaceProps> = ({ toolId, toolName }) => {
  const meta = TOOL_META[toolId] || TOOL_META['pdf-editor'];

  const [files, setFiles] = useState<File[]>([]);
  const [pdfPages, setPdfPages] = useState<PDFPage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [result, setResult] = useState<{ url: string; name: string; size?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Tool-specific state
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [fontSize, setFontSize] = useState(12);
  const [textColor, setTextColor] = useState('#000000');
  const [textPosition, setTextPosition] = useState<'top' | 'center' | 'bottom'>('top');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');

  // ─── Load PDF pages ──────────────────────────────────────────────────────────

  const loadPdfPages = useCallback(async (acceptedFiles: File[], existingFilesCount: number, existingPages: PDFPage[], currentPassword: string, currentToolId: string) => {
    setIsLoadingPages(true);
    setError(null);

    const allNewPages: PDFPage[] = [];

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];

      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const loadOptions: any = { data: new Uint8Array(arrayBuffer) };

        if (currentPassword) {
          loadOptions.password = currentPassword;
        }

        let pdf: pdfjsLib.PDFDocumentProxy;
        try {
          pdf = await pdfjsLib.getDocument(loadOptions).promise;
        } catch (loadErr: any) {
          const isPasswordErr =
            loadErr?.name === 'PasswordException' ||
            String(loadErr?.message ?? '').toLowerCase().includes('password');

          if (isPasswordErr) {
            if (currentToolId === 'pdf-password-remover') {
              setIsPasswordProtected(true);
            } else {
              setError(`"${file.name}" is password-protected. Use the PDF Password Remover tool first.`);
            }
            continue;
          }
          setError(`Failed to load "${file.name}". The file may be corrupted.`);
          continue;
        }

        for (let j = 1; j <= pdf.numPages; j++) {
          const page = await pdf.getPage(j);
          const viewport = page.getViewport({ scale: 0.35 });
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;
          page.cleanup();

          allNewPages.push({
            id: `${file.name}-${j}-${Date.now()}-${Math.random()}`,
            fileIndex: existingFilesCount + i,
            pageIndex: j - 1,
            rotation: 0,
            thumbnail: canvas.toDataURL('image/jpeg', 0.7),
            isSelected: false,
            fileName: file.name,
          });
        }
      }
    }

    setPdfPages(prev => [...prev, ...allNewPages]);
    setIsLoadingPages(false);
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setResult(null);
    setError(null);
    setIsPasswordProtected(false);

    const currentFilesCount = files.length;
    const newFiles = [...files, ...acceptedFiles];
    setFiles(newFiles);

    const needsPages = ['merge-pdf','split-pdf','rotate-pdf','pdf-editor','pdf-password-remover','pdf-to-image','pdf-to-word','pdf-compress','pdf-size-reduce','pdf-excel'].includes(toolId);

    if (needsPages) {
      await loadPdfPages(acceptedFiles, currentFilesCount, pdfPages, password, toolId);
    }
  }, [files, pdfPages, password, toolId, loadPdfPages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptTypes(toolId),
    multiple: ['merge-pdf', 'image-to-pdf'].includes(toolId),
    disabled: isLoadingPages,
  });

  // ─── Page actions ────────────────────────────────────────────────────────────

  const togglePageSelection = (id: string) => {
    setPdfPages(prev => prev.map(p => p.id === id ? { ...p, isSelected: !p.isSelected } : p));
  };

  const rotatePage = (id: string) => {
    setPdfPages(prev => prev.map(p => p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p));
  };

  const deletePage = (id: string) => {
    setPdfPages(prev => prev.filter(p => p.id !== id));
  };

  const selectAll = () => {
    setPdfPages(prev => prev.map(p => ({ ...p, isSelected: true })));
  };

  const deselectAll = () => {
    setPdfPages(prev => prev.map(p => ({ ...p, isSelected: false })));
  };

  const reset = () => {
    setFiles([]);
    setPdfPages([]);
    setResult(null);
    setError(null);
    setPassword('');
    setTextContent('');
    setProgress(0);
    setIsPasswordProtected(false);
  };

  // ─── Process ──────────────────────────────────────────────────────────────────

  const handleProcess = async () => {
    if (toolId !== 'generate-pdf' && files.length === 0) {
      setError('Please upload at least one file first.');
      return;
    }
    if (toolId === 'generate-pdf' && !textContent.trim()) {
      setError('Please enter some text content to generate a PDF.');
      return;
    }
    if (toolId === 'split-pdf' && pdfPages.filter(p => p.isSelected).length === 0) {
      setError('Please select at least one page to extract.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(10);

    try {
      let blob: Blob;
      let fileName = toolName.replace(/\s+/g, '-').toLowerCase() + '-' + Date.now();

      const tick = (v: number) => setProgress(v);

      switch (toolId) {
        case 'merge-pdf':
          tick(30);
          blob = await mergePdfs(files, pdfPages);
          tick(90);
          fileName += '.pdf';
          break;

        case 'split-pdf': {
          tick(30);
          const selected = pdfPages.filter(p => p.isSelected);
          blob = await splitPdf(files, selected);
          tick(90);
          fileName += '-extracted.pdf';
          break;
        }

        case 'rotate-pdf':
          tick(30);
          blob = await mergePdfs(files, pdfPages); // merge respects rotation
          tick(90);
          fileName += '-rotated.pdf';
          break;

        case 'image-to-pdf':
          tick(30);
          blob = await convertImagesToPdf(files, tick);
          fileName += '.pdf';
          break;

        case 'pdf-to-image':
          tick(20);
          blob = await convertPdfToImages(files[0], tick);
          fileName += '-pages.zip';
          break;

        case 'pdf-compress':
        case 'pdf-size-reduce':
          tick(30);
          blob = await compressPdf(files[0]);
          tick(90);
          fileName += '-compressed.pdf';
          break;

        case 'pdf-password-remover':
          tick(20);
          blob = await removePdfPassword(files[0], password, tick);
          fileName += '-unlocked.pdf';
          break;

        case 'pdf-excel':
          tick(20);
          blob = await convertPdfToExcel(files[0], tick);
          fileName += '.xlsx';
          break;

        case 'excel-to-pdf':
          tick(30);
          blob = await convertExcelToPdf(files[0]);
          tick(90);
          fileName += '.pdf';
          break;

        case 'word-to-pdf':
          tick(30);
          blob = await convertWordToPdf(files[0]);
          tick(90);
          fileName += '.pdf';
          break;

        case 'pdf-to-word':
          tick(20);
          blob = await convertPdfToWord(files[0], tick);
          fileName += '.docx';
          break;

        case 'generate-pdf':
          tick(30);
          blob = await generatePdfFromText(textContent, fontSize, textColor);
          tick(90);
          fileName += '.pdf';
          break;

        case 'pdf-editor':
          tick(30);
          blob = await editPdf(files, pdfPages, textContent, fontSize, textColor, textPosition, textAlign);
          tick(90);
          fileName += '-edited.pdf';
          break;

        default:
          throw new Error('This tool is not yet implemented.');
      }

      tick(100);
      const url = URL.createObjectURL(blob);
      setResult({ url, name: fileName, size: blob.size });
    } catch (err: any) {
      console.error('[PDFTool] Error:', err);
      setError(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Derived UI state ─────────────────────────────────────────────────────────

  const showUploadArea = toolId !== 'generate-pdf' && !result;
  const showPageGrid = pdfPages.length > 0 && !result;
  const showSettings = (toolId === 'pdf-password-remover' || toolId === 'generate-pdf' || toolId === 'pdf-editor') && !result;
  const selectedCount = pdfPages.filter(p => p.isSelected).length;

  const canProcess = () => {
    if (toolId === 'generate-pdf') return textContent.trim().length > 0;
    if (toolId === 'split-pdf') return selectedCount > 0;
    if (toolId === 'pdf-editor') return files.length > 0 && textContent.trim().length > 0;
    return files.length > 0;
  };

  // ─── Reload with password ─────────────────────────────────────────────────────

  const reloadWithPassword = async () => {
    if (files.length === 0) return;
    setPdfPages([]);
    setIsPasswordProtected(false);
    await loadPdfPages(files, 0, [], password, toolId);
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Settings panel ── */}
      {showSettings && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className={`px-5 py-4 bg-gradient-to-r ${meta.color} flex items-center gap-3`}>
            <div className="text-white">{meta.icon}</div>
            <h3 className="font-bold text-white text-sm tracking-wide uppercase">
              {toolId === 'pdf-password-remover' ? 'Security Settings' : 'Document Settings'}
            </h3>
          </div>
          <div className="p-5 space-y-5">

            {/* Password tool */}
            {toolId === 'pdf-password-remover' && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-500" />
                  PDF Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter the PDF password to unlock…"
                    className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-400/30 focus:border-rose-400 outline-none text-sm transition-all bg-slate-50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                  Leave blank if the PDF only has owner/permissions restrictions (not an open password).
                </p>
                {files.length > 0 && (
                  <button
                    type="button"
                    onClick={reloadWithPassword}
                    disabled={isLoadingPages}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    {isLoadingPages ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Reload with Password
                  </button>
                )}
              </div>
            )}

            {/* Text / generate settings */}
            {(toolId === 'generate-pdf' || toolId === 'pdf-editor') && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    {toolId === 'pdf-editor' ? 'Text to overlay on each page' : 'PDF Content'}
                  </label>
                  <textarea
                    value={textContent}
                    onChange={e => setTextContent(e.target.value)}
                    placeholder={
                      toolId === 'pdf-editor'
                        ? 'Type text to overlay on all pages…'
                        : 'Type or paste your content here.\n\nUse blank lines to separate paragraphs…'
                    }
                    rows={toolId === 'generate-pdf' ? 8 : 3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 outline-none resize-none text-sm transition-all bg-slate-50 focus:bg-white leading-relaxed"
                  />
                  <p className="text-xs text-slate-500 text-right">{textContent.length} characters</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Font Size</label>
                    <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-2 border border-slate-200">
                      <button onClick={() => setFontSize(Math.max(8, fontSize - 2))} className="p-1 hover:bg-white rounded-lg transition-colors">
                        <Minus className="w-4 h-4 text-slate-600" />
                      </button>
                      <span className="flex-1 text-center font-bold text-slate-900 text-sm">{fontSize}pt</span>
                      <button onClick={() => setFontSize(Math.min(72, fontSize + 2))} className="p-1 hover:bg-white rounded-lg transition-colors">
                        <Plus className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Color</label>
                    <div className="relative h-[42px] rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                      <input
                        type="color"
                        value={textColor}
                        onChange={e => setTextColor(e.target.value)}
                        className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                      />
                      <div className="absolute inset-0 flex items-center gap-2 px-3 pointer-events-none">
                        <div className="w-5 h-5 rounded-md border border-slate-300 shrink-0" style={{ background: textColor }} />
                        <span className="text-xs font-mono text-slate-600">{textColor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Position</label>
                    <select
                      value={textPosition}
                      onChange={e => setTextPosition(e.target.value as any)}
                      className="w-full h-[42px] px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-purple-400"
                    >
                      <option value="top">Top</option>
                      <option value="center">Center</option>
                      <option value="bottom">Bottom</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Align</label>
                    <select
                      value={textAlign}
                      onChange={e => setTextAlign(e.target.value as any)}
                      className="w-full h-[42px] px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-purple-400"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Upload area ── */}
      {showUploadArea && (
        <div
          {...getRootProps()}
          className={`
            relative rounded-2xl border-2 border-dashed p-5 sm:p-8 text-center cursor-pointer transition-all duration-200 group select-none
            ${isDragActive
              ? 'border-blue-500 bg-blue-50/70 scale-[1.01]'
              : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
            }
            ${isLoadingPages ? 'pointer-events-none opacity-60' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-5">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">
                {isDragActive ? 'Drop files here' : 'Upload ' + getAcceptLabel(toolId)}
              </p>
              <p className="text-sm text-slate-500 mt-1.5">
                {isDragActive ? 'Release to upload' : 'Drag & drop or click to browse · ' + getAcceptLabel(toolId)}
              </p>
            </div>
          </div>
          {files.length > 0 && (
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-700 font-medium shadow-sm">
                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="max-w-[160px] truncate">{f.name}</span>
                  <span className="text-slate-400">({(f.size / 1024).toFixed(0)} KB)</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Hint bar ── */}
      {!result && meta.tip && (
        <div className="flex items-start gap-2.5 text-xs text-slate-500">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
          <span>{meta.tip}</span>
        </div>
      )}

      {/* ── Password-protected info banner ── */}
      {isPasswordProtected && toolId === 'pdf-password-remover' && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Password-protected PDF detected</p>
            <p className="text-xs text-amber-600 mt-1">Enter the correct password above and click "Reload with Password" to preview the pages, then click "Remove Password & Save".</p>
          </div>
        </div>
      )}

      {/* ── Page workspace ── */}
      {showPageGrid && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-gradient-to-br ${meta.color} text-white`}>
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Document Pages</h3>
                <p className="text-xs text-slate-500">{pdfPages.length} page{pdfPages.length !== 1 ? 's' : ''} loaded</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {toolId === 'split-pdf' && (
                <>
                  <button onClick={selectAll} className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">
                    Select All
                  </button>
                  <button onClick={deselectAll} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors">
                    Deselect All
                  </button>
                  {selectedCount > 0 && (
                    <span className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-100 rounded-lg">
                      {selectedCount} selected
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {isLoadingPages ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 bg-slate-50 rounded-2xl border border-slate-100">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm text-slate-500 font-medium">Rendering pages…</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {pdfPages.map((page) => (
                <div
                  key={page.id}
                  onClick={() => toolId === 'split-pdf' && togglePageSelection(page.id)}
                  className={`
                    relative group rounded-xl overflow-hidden border-2 transition-all duration-150 select-none
                    ${toolId === 'split-pdf' ? 'cursor-pointer' : 'cursor-default'}
                    ${page.isSelected
                      ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                    }
                  `}
                >
                  {/* Thumbnail */}
                  <div className="aspect-[3/4] bg-slate-100 relative overflow-hidden">
                    <img
                      src={page.thumbnail}
                      alt={`Page ${page.pageIndex + 1}`}
                      className="w-full h-full object-contain transition-transform duration-200"
                      style={{ transform: `rotate(${page.rotation}deg)` }}
                      loading="lazy"
                    />

                    {/* Page number */}
                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold rounded-md leading-none">
                      {page.pageIndex + 1}
                    </div>

                    {/* Selection tick (split mode) */}
                    {toolId === 'split-pdf' && (
                      <div className={`absolute top-1.5 left-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                        ${page.isSelected ? 'bg-amber-400 border-amber-400' : 'bg-white/70 border-white/80'}`}>
                        {page.isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                    )}

                    {/* Hover overlay with actions */}
                    <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      {(toolId === 'rotate-pdf' || toolId === 'pdf-editor' || toolId === 'merge-pdf') && (
                        <button
                          onClick={(e) => { e.stopPropagation(); rotatePage(page.id); }}
                          className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-lg backdrop-blur-sm transition-all"
                          title="Rotate 90°"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deletePage(page.id); }}
                        className="p-1.5 bg-rose-500/40 hover:bg-rose-500/70 text-white rounded-lg backdrop-blur-sm transition-all"
                        title="Remove page"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Generate PDF direct button (no upload needed) ── */}
      {toolId === 'generate-pdf' && !result && (
        <div className="flex gap-3">
          <button
            onClick={handleProcess}
            disabled={isProcessing || !textContent.trim()}
            id="pdf-process-btn"
            className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all text-white bg-gradient-to-r ${meta.color} disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:brightness-105`}
          >
            {isProcessing ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Generating…</>
            ) : (
              <><Zap className="w-5 h-5" /> Generate PDF</>
            )}
          </button>
        </div>
      )}

      {/* ── Action bar (for upload-based tools) ── */}
      {toolId !== 'generate-pdf' && (files.length > 0 || pdfPages.length > 0) && !result && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            id="pdf-process-btn"
            onClick={handleProcess}
            disabled={isProcessing || isLoadingPages || !canProcess()}
            className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all text-white bg-gradient-to-r ${meta.color} disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:brightness-105`}
          >
            {isProcessing ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</>
            ) : (
              <><Zap className="w-5 h-5" /> {meta.actionLabel}</>
            )}
          </button>
          <button
            onClick={reset}
            className="px-6 py-4 rounded-2xl font-bold border-2 border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
        </div>
      )}

      {/* ── Progress bar ── */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${meta.color} rounded-full transition-all duration-300`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 text-right">{progress}%</p>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-rose-700">Something went wrong</p>
            <p className="text-xs text-rose-600 mt-0.5">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Result ── */}
      {result && (
        <div className="rounded-2xl overflow-hidden border border-emerald-100 bg-emerald-50 shadow-sm">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">File is ready!</h3>
              <p className="text-emerald-100 text-sm">
                {result.size ? `${(result.size / 1024).toFixed(1)} KB · ` : ''}
                {result.name}
              </p>
            </div>
          </div>
          <div className="p-5 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => saveAs(result.url, result.name)}
              className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-105 transition-all shadow-md hover:shadow-lg"
            >
              <Download className="w-5 h-5" />
              Download {result.name.split('.').pop()?.toUpperCase()}
            </button>
            <button
              onClick={reset}
              className="px-6 py-3.5 bg-white text-slate-600 border-2 border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Process Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── PDF Processing Functions ────────────────────────────────────────────────

async function mergePdfs(files: File[], pages: PDFPage[]): Promise<Blob> {
  const merged = await PDFDocument.create();
  const cache: Record<number, PDFDocument> = {};

  for (const p of pages) {
    if (!cache[p.fileIndex]) {
      const buf = await files[p.fileIndex].arrayBuffer();
      cache[p.fileIndex] = await PDFDocument.load(buf, { ignoreEncryption: true });
    }
    const [copied] = await merged.copyPages(cache[p.fileIndex], [p.pageIndex]);
    if (p.rotation !== 0) {
      copied.setRotation(degrees(p.rotation));
    }
    merged.addPage(copied);
  }

  return new Blob([await merged.save()], { type: 'application/pdf' });
}

async function splitPdf(files: File[], selectedPages: PDFPage[]): Promise<Blob> {
  const out = await PDFDocument.create();
  const cache: Record<number, PDFDocument> = {};

  for (const p of selectedPages) {
    if (!cache[p.fileIndex]) {
      const buf = await files[p.fileIndex].arrayBuffer();
      cache[p.fileIndex] = await PDFDocument.load(buf, { ignoreEncryption: true });
    }
    const [copied] = await out.copyPages(cache[p.fileIndex], [p.pageIndex]);
    if (p.rotation !== 0) copied.setRotation(degrees(p.rotation));
    out.addPage(copied);
  }

  return new Blob([await out.save()], { type: 'application/pdf' });
}

async function convertImagesToPdf(files: File[], tick: (v: number) => void): Promise<Blob> {
  const doc = await PDFDocument.create();
  const step = 80 / Math.max(files.length, 1);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const buf = await file.arrayBuffer();
    let img;

    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      img = await doc.embedJpg(buf);
    } else if (file.type === 'image/png') {
      img = await doc.embedPng(buf);
    } else if (file.type === 'image/webp') {
      // Convert via canvas
      const blob = new Blob([buf], { type: file.type });
      const url = URL.createObjectURL(blob);
      const imgEl = await new Promise<HTMLImageElement>((res, rej) => {
        const el = new window.Image();
        el.onload = () => res(el);
        el.onerror = rej;
        el.src = url;
      });
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = imgEl.naturalWidth;
      canvas.height = imgEl.naturalHeight;
      canvas.getContext('2d')!.drawImage(imgEl, 0, 0);
      const pngBuf = await new Promise<ArrayBuffer>((res) => {
        canvas.toBlob((b) => b!.arrayBuffer().then(res), 'image/png');
      });
      img = await doc.embedPng(pngBuf);
    } else {
      continue;
    }

    const page = doc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    tick(20 + step * (i + 1));
  }

  return new Blob([await doc.save()], { type: 'application/pdf' });
}

async function convertPdfToImages(file: File, tick: (v: number) => void): Promise<Blob> {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
  const zip = new JSZip();
  const folder = zip.folder('pages')!;
  const step = 70 / pdf.numPages;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    page.cleanup();

    const blob = await new Promise<Blob>(res => canvas.toBlob(b => res(b!), 'image/png'));
    folder.file(`page-${String(i).padStart(3, '0')}.png`, blob);
    tick(20 + step * i);
  }

  return await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
}

async function compressPdf(file: File): Promise<Blob> {
  const buf = await file.arrayBuffer();
  const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
  const bytes = await doc.save({ useObjectStreams: true, addDefaultPage: false });
  return new Blob([bytes], { type: 'application/pdf' });
}

async function removePdfPassword(file: File, pass: string, tick: (v: number) => void): Promise<Blob> {
  const buf = await file.arrayBuffer();

  let pdf: any;
  try {
    const task = pdfjsLib.getDocument({ data: new Uint8Array(buf), password: pass || '' });
    pdf = await task.promise;
  } catch (e: any) {
    const isPassErr = e?.name === 'PasswordException' || String(e?.message ?? '').toLowerCase().includes('password');
    if (isPassErr) {
      throw new Error(pass
        ? 'Incorrect password. Please check and try again.'
        : 'This PDF requires a password. Please enter it above.');
    }
    throw new Error('Failed to open the PDF. It may be corrupted.');
  }

  // Render each page to canvas → embed as PNG in new unencrypted PDF
  const scale = 2.0;
  const step = 60 / pdf.numPages;
  const images: { data: Uint8Array; w: number; h: number }[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const vp = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = vp.width;
    canvas.height = vp.height;
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    page.cleanup();

    const dataUrl = canvas.toDataURL('image/png');
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let b = 0; b < binary.length; b++) bytes[b] = binary.charCodeAt(b);
    images.push({ data: bytes, w: vp.width, h: vp.height });
    tick(20 + step * i);
  }

  const newPdf = await PDFDocument.create();
  for (const { data, w, h } of images) {
    const pngImg = await newPdf.embedPng(data);
    const p = newPdf.addPage([w / scale, h / scale]);
    p.drawImage(pngImg, { x: 0, y: 0, width: w / scale, height: h / scale });
  }

  tick(90);
  return new Blob([await newPdf.save()], { type: 'application/pdf' });
}

async function convertPdfToExcel(file: File, tick: (v: number) => void): Promise<Blob> {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
  const wb = XLSX.utils.book_new();
  const step = 60 / pdf.numPages;

  // Try to parse table-like content per page
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    page.cleanup();

    // Group items by approximate Y position → rows
    const rowMap: Map<number, string[]> = new Map();
    for (const item of tc.items as any[]) {
      if (!item.str?.trim()) continue;
      const y = Math.round(item.transform[5] / 5) * 5; // bucket by 5px
      if (!rowMap.has(y)) rowMap.set(y, []);
      rowMap.get(y)!.push(item.str);
    }

    // Sort rows top-to-bottom (PDF y is bottom-up)
    const sorted = [...rowMap.entries()].sort((a, b) => b[0] - a[0]);
    const rows: string[][] = sorted.map(([, cells]) => cells);

    if (rows.length === 0) rows.push([`(No text on page ${i})`]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, `Page ${i}`);
    tick(20 + step * i);
  }

  tick(85);
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

async function convertExcelToPdf(file: File): Promise<Blob> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(new Uint8Array(buf), { type: 'array' });

  // Build rich text content from all sheets
  let allText = '';
  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    allText += `=== ${sheetName} ===\n\n${csv}\n\n`;
  }

  return generatePdfFromText(allText, 9, '#111111');
}

async function convertWordToPdf(file: File): Promise<Blob> {
  const buf = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buf });
  return generatePdfFromText(result.value || '(No text content found)', 11, '#1a1a1a');
}

async function convertPdfToWord(file: File, tick: (v: number) => void): Promise<Blob> {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
  const step = 60 / pdf.numPages;
  const children: Paragraph[] = [
    new Paragraph({
      text: file.name.replace('.pdf', ''),
      heading: HeadingLevel.HEADING_1,
    }),
  ];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    page.cleanup();

    const text = (tc.items as any[])
      .map(item => item.str)
      .join(' ')
      .replace(/\s{3,}/g, '  ')
      .trim();

    children.push(new Paragraph({
      children: [new TextRun({ text: `— Page ${i} —`, bold: true, size: 20 })],
      spacing: { before: 200, after: 100 },
    }));

    // Break into shorter paragraphs on sentence boundaries
    const sentences = text.split(/(?<=[.!?])\s+/);
    for (let s = 0; s < sentences.length; s += 5) {
      const chunk = sentences.slice(s, s + 5).join(' ');
      children.push(new Paragraph({ children: [new TextRun({ text: chunk, size: 22 })] }));
    }

    tick(20 + step * i);
  }

  const doc = new Document({ sections: [{ properties: {}, children }] });
  const buffer = await Packer.toBuffer(doc);
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

async function generatePdfFromText(
  text: string,
  size = 12,
  hexColor = '#000000'
): Promise<Blob> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  const r = parseInt(hexColor.slice(1, 3), 16) / 255;
  const g = parseInt(hexColor.slice(3, 5), 16) / 255;
  const b = parseInt(hexColor.slice(5, 7), 16) / 255;
  const color = rgb(r, g, b);

  const pageWidth = 595;  // A4 points
  const pageHeight = 842;
  const margin = 60;
  const lineHeight = size * 1.5;
  const maxWidth = pageWidth - margin * 2;

  // Word-wrap helper
  function wrapLine(line: string, f: typeof font, sz: number): string[] {
    const words = line.split(' ');
    const wrapped: string[] = [];
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (f.widthOfTextAtSize(test, sz) > maxWidth) {
        if (current) wrapped.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) wrapped.push(current);
    return wrapped.length ? wrapped : [''];
  }

  const rawLines = text.split('\n');
  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  for (const rawLine of rawLines) {
    const wrapped = wrapLine(rawLine, font, size);
    for (const wl of wrapped) {
      if (y < margin + lineHeight) {
        page = doc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
      page.drawText(wl, { x: margin, y, size, font, color, maxWidth });
      y -= lineHeight;
    }
    // Paragraph gap for blank lines
    if (rawLine.trim() === '') y -= lineHeight * 0.5;
  }

  return new Blob([await doc.save()], { type: 'application/pdf' });
}

async function editPdf(
  files: File[],
  pages: PDFPage[],
  overlayText: string,
  size: number,
  hexColor: string,
  position: 'top' | 'center' | 'bottom',
  align: 'left' | 'center' | 'right',
): Promise<Blob> {
  const out = await PDFDocument.create();
  const font = await out.embedFont(StandardFonts.HelveticaBold);
  const cache: Record<number, PDFDocument> = {};

  const r = parseInt(hexColor.slice(1, 3), 16) / 255;
  const g = parseInt(hexColor.slice(3, 5), 16) / 255;
  const b = parseInt(hexColor.slice(5, 7), 16) / 255;
  const color = rgb(r, g, b);

  for (const p of pages) {
    if (!cache[p.fileIndex]) {
      const buf = await files[p.fileIndex].arrayBuffer();
      cache[p.fileIndex] = await PDFDocument.load(buf, { ignoreEncryption: true });
    }
    const [copied] = await out.copyPages(cache[p.fileIndex], [p.pageIndex]);
    const { width, height } = copied.getSize();

    if (overlayText.trim()) {
      const tw = font.widthOfTextAtSize(overlayText, size);
      let x = 50;
      if (align === 'center') x = (width - tw) / 2;
      else if (align === 'right') x = width - tw - 50;

      let y = height - 50;
      if (position === 'center') y = height / 2;
      else if (position === 'bottom') y = 50;

      copied.drawText(overlayText, { x, y, size, font, color });
    }

    if (p.rotation !== 0) copied.setRotation(degrees(p.rotation));
    out.addPage(copied);
  }

  return new Blob([await out.save()], { type: 'application/pdf' });
}
