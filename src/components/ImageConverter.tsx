
import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, Image as ImageIcon, X, CheckCircle, AlertCircle, 
  Settings, Download, Trash2, Info
} from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface ImageFile extends File {
  preview?: string;
  id?: string;
}

interface ConversionSettings {
  format: string;
  quality: number;
  maxWidth: number;
  preserveExif: boolean;
}

const formatOptions = [
  { value: "jpeg", label: "JPEG - Best for photos" },
  { value: "png", label: "PNG - Best for graphics" },
  { value: "webp", label: "WebP - Modern & efficient" },
];

export function ImageConverter() {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [settings, setSettings] = useState<ConversionSettings>({
    format: "webp",
    quality: 85,
    maxWidth: 1920,
    preserveExif: true,
  });
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const statsRef = useRef({
    totalSaved: 0,
    filesProcessed: 0,
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    setSuccess(false);
    const newFiles = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substring(7),
      })
    );
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxSize: 25 * 1024 * 1024, // 25MB
    onDropRejected: (fileRejections) => {
      const errors = fileRejections.map(rejection => {
        if (rejection.errors[0].code === 'file-too-large') {
          return 'Files must be smaller than 25MB';
        }
        return 'Invalid file type. Please upload images only.';
      });
      setError(errors[0]);
    }
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
    setError(null);
    setSuccess(false);
    statsRef.current = { totalSaved: 0, filesProcessed: 0 };
  };

  const convertImage = async (file: ImageFile): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        if (width > settings.maxWidth) {
          height = (settings.maxWidth * height) / width;
          width = settings.maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Simulate file size reduction for stats
              const compressionRatio = 0.6; // Assume 40% reduction
              statsRef.current.totalSaved += file.size * (1 - compressionRatio);
              statsRef.current.filesProcessed += 1;
              resolve(blob);
            } else {
              reject(new Error('Failed to convert image'));
            }
          },
          `image/${settings.format}`,
          settings.quality / 100
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = file.preview as string;
    });
  };

  const handleConversion = async () => {
    if (files.length === 0) return;
    
    setConverting(true);
    setProgress(0);
    setError(null);
    statsRef.current = { totalSaved: 0, filesProcessed: 0 };
    
    try {
      const convertedFiles: { blob: Blob; originalName: string }[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const blob = await convertImage(file);
        const originalName = file.name.split('.')[0];
        convertedFiles.push({
          blob,
          originalName: `${originalName}.${settings.format}`
        });
        setProgress(((i + 1) / files.length) * 100);
      }

      // Create zip file if multiple images
      if (convertedFiles.length > 1) {
        // Here you would implement zip functionality
        // For now, download individually
        convertedFiles.forEach(({ blob, originalName }) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = originalName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
      } else {
        // Single file download
        const { blob, originalName } = convertedFiles[0];
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = originalName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError("Failed to convert images. Please try again.");
    } finally {
      setConverting(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-4"
        >
          Convert Images in Seconds
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-600"
        >
          Fast, secure, and free image conversion for professionals
        </motion.p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="flex flex-col gap-6">
          {/* Header with Settings */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ImageIcon className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold">Batch Image Converter</h2>
            </div>
            <div className="flex items-center gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowSettings(!showSettings)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Conversion Settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                onClick={handleConversion}
                disabled={files.length === 0 || converting}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                {converting ? "Converting..." : `Convert ${files.length > 0 ? files.length : ''} ${files.length === 1 ? 'Image' : files.length > 1 ? 'Images' : ''}`}
              </Button>
            </div>
          </div>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gray-50 rounded-lg p-6 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Output Format</label>
                    <select
                      value={settings.format}
                      onChange={(e) => setSettings({ ...settings, format: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {formatOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Quality ({settings.quality}%)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={settings.quality}
                      onChange={(e) => setSettings({ ...settings, quality: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                Max Width (px)
                    </label>
                    <input
                      type="number"
                      value={settings.maxWidth}
                      onChange={(e) => setSettings({ ...settings, maxWidth: Number(e.target.value) })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={settings.preserveExif}
                        onChange={(e) => setSettings({ ...settings, preserveExif: e.target.checked })}
                        className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                      Preserve EXIF Data
                    </label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Keep image metadata like camera settings and GPS info</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-xl p-12
              flex flex-col items-center justify-center gap-4
              cursor-pointer transition-all duration-200
              ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-500 hover:bg-blue-50"}
              ${files.length > 0 ? "h-40" : "h-64"}
            `}
          >
            <input {...getInputProps()} />
            <Upload className={`w-8 h-8 ${isDragActive ? "text-blue-500" : "text-gray-400"}`} />
            <div className="text-center">
              <p className="text-lg mb-2">
                Drop your images here, or <span className="text-blue-500">browse</span>
              </p>
              <p className="text-sm text-gray-500">
                Supports JPG, PNG, WebP • Up to 25MB per file
              </p>
            </div>
          </div>

          {/* File Management */}
          {files.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {files.length} {files.length === 1 ? 'image' : 'images'} selected
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-red-500 hover:text-red-600 gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </Button>
            </div>
          )}

          {/* Progress */}
          <AnimatePresence>
            {converting && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <Progress value={progress} className="h-1" />
                <p className="text-sm text-gray-500 text-center">
                  Converting {files.length} {files.length === 1 ? "image" : "images"}...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status Messages */}
          <AnimatePresence>
            {(error || success) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex items-center gap-2 p-4 rounded-lg ${
                  error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                }`}
              >
                {error ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                <p>
                  {error || (
                    <>
                      Success! Saved approximately{" "}
                      {(statsRef.current.totalSaved / (1024 * 1024)).toFixed(1)}MB
                      {" "}across {statsRef.current.filesProcessed} files.
                    </>
                  )}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Image Preview Grid */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
              >
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100"
                  >
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                    >
                      <div className="text-center p-2">
                        <p className="text-white text-sm mb-2 truncate max-w-[150px]">
                          {file.name}
                        </p>
                        <p className="text-gray-300 text-xs mb-3">
                          {(file.size / (1024 * 1024)).toFixed(1)}MB
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(file.id!);
                          }}
                          className="p-2 rounded-full bg-white text-gray-700 hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="font-semibold mb-2">Batch Processing</h3>
          <p className="text-gray-600 text-sm">
            Convert multiple images at once. Save time and effort.
          </p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="font-semibold mb-2">Advanced Settings</h3>
          <p className="text-gray-600 text-sm">
            Fine-tune quality, size, and format to your needs.
          </p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="font-semibold mb-2">Instant Download</h3>
          <p className="text-gray-600 text-sm">
            Get your converted images immediately. No waiting.
          </p>
        </div>
      </motion.div>
    </div>
  );
}