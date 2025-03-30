
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon, X, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

interface ImageFile extends File {
  preview?: string;
  id?: string;
}

const formatOptions = [
  { value: "jpeg", label: "JPEG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WebP" },
];

export function ImageConverter() {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [targetFormat, setTargetFormat] = useState<string>("jpeg");
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    maxSize: 10485760, // 10MB
    onDropRejected: () => {
      setError("Please upload images smaller than 10MB");
    }
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const convertImage = async (file: ImageFile): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert image'));
            }
          },
          `image/${targetFormat}`,
          0.9
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
    
    try {
      const convertedFiles: { blob: Blob; originalName: string }[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const blob = await convertImage(file);
        const originalName = file.name.split('.')[0];
        convertedFiles.push({
          blob,
          originalName: `${originalName}.${targetFormat}`
        });
        setProgress(((i + 1) / files.length) * 100);
      }

      // Download files
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
    <div className="max-w-4xl mx-auto p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ImageIcon className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold">Image Converter</h2>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                {formatOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleConversion}
                disabled={files.length === 0 || converting}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  files.length === 0
                    ? "bg-gray-100 text-gray-400"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {converting ? "Converting..." : "Convert & Download"}
              </Button>
            </div>
          </div>

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
                Drag & drop images here, or <span className="text-blue-500">browse</span>
              </p>
              <p className="text-sm text-gray-500">Supports JPG, PNG, WebP (up to 10MB)</p>
            </div>
          </div>

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
                <p>{error || "Images converted successfully!"}</p>
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
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
              >
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative group aspect-square rounded-lg overflow-hidden"
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(file.id!);
                        }}
                        className="p-2 rounded-full bg-white text-gray-700 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}