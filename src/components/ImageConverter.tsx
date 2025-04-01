
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { AlertCircle, Image as ImageIcon, Upload, X, CheckCircle2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const formatOptions = [
  { 
    value: "jpeg", 
    label: "JPEG", 
    icon: "🖼️",
    description: "Best for photographs and complex images with rich colors" 
  },
  { 
    value: "png", 
    label: "PNG", 
    icon: "🎨",
    description: "Perfect for graphics, screenshots, and images needing transparency" 
  },
  { 
    value: "webp", 
    label: "WebP", 
    icon: "🚀",
    description: "Modern format with excellent compression and quality" 
  },
];

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface FileWithPreview extends File {
  preview?: string;
  status?: 'pending' | 'converting' | 'done' | 'error';
}

export function ImageConverter() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [format, setFormat] = useState("jpeg");
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [maxHeight, setMaxHeight] = useState(1080);
  const [progress, setProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    console.log("🔄 ImageConverter component mounted");
    return () => {
      console.log("🔚 ImageConverter component unmounted");
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
          console.debug("🗑️ Cleaned up preview URL for", file.name);
        }
      });
    };
  }, []);

  useEffect(() => {
    console.warn("📁 Files state updated:", files.map(f => ({ name: f.name, status: f.status })));
  }, [files]);

  useEffect(() => {
    console.info("⚙️ Settings changed:", { format, quality, maxWidth, maxHeight });
  }, [format, quality, maxWidth, maxHeight]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log("📥 Files dropped:", acceptedFiles.map(f => f.name));
    
    if (acceptedFiles.some(file => file.size > 10 * 1024 * 1024)) {
      console.warn("⚠️ Some files are larger than 10MB");
    }

    const newFiles = acceptedFiles.map(file => {
      console.debug("🔍 Processing dropped file:", file.name, formatFileSize(file.size));
      return Object.assign(file, {
        preview: URL.createObjectURL(file),
        status: 'pending'
      });
    });
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const removeFile = (index: number) => {
    console.info("🗑️ Removing file at index:", index);
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
        console.debug("🧹 Cleaned up preview URL for removed file");
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg", ".webp"]
    },
    onDropRejected: (rejectedFiles) => {
      console.error("❌ Files rejected:", rejectedFiles.map(f => ({
        file: f.file.name,
        errors: f.errors
      })));
    },
    onDropAccepted: (files) => {
      console.log("✅ Files accepted:", files.map(f => f.name));
    },
    onDragEnter: () => {
      console.debug("🎯 Drag enter event");
    },
    onDragLeave: () => {
      console.debug("↩️ Drag leave event");
    }
  });

  const handleConvert = async () => {
    console.warn("🚀 Starting conversion process");
    console.info("📊 Conversion settings:", {
      format,
      quality,
      maxWidth,
      maxHeight,
      fileCount: files.length
    });

    setIsConverting(true);
    setProgress(0);

    setFiles(prev => prev.map(file => ({ ...file, status: 'converting' as const })));

    for (let i = 0; i < files.length; i++) {
      console.debug(`⚙️ Converting file ${i + 1} of ${files.length}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setFiles(prev => prev.map((file, index) => {
        if (index === i) {
          console.log(`✅ Completed conversion for ${file.name}`);
          return { ...file, status: 'done' as const };
        }
        return file;
      }));
      
      const newProgress = ((i + 1) * 100) / files.length;
      console.debug(`📈 Progress updated: ${newProgress.toFixed(1)}%`);
      setProgress(newProgress);
    }

    console.warn("🎉 Conversion process completed");
    setIsConverting(false);
  };

  const selectedFormat = formatOptions.find(f => f.value === format);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 w-full max-w-4xl mx-auto p-6 space-y-6">
        <div
          {...getRootProps()}
          className={cn(
            "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
            isDragActive ? "border-primary bg-primary/10 scale-102" : "border-gray-300 hover:border-primary",
            "group"
          )}
          onClick={() => console.info("🖱️ Dropzone clicked")}
        >
          <input {...getInputProps()} />
          <motion.div 
            className="space-y-4"
            animate={{ scale: isDragActive ? 1.02 : 1 }}
          >
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Upload className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
              </div>
            </div>
            {isDragActive ? (
              <p className="text-lg font-medium text-primary">Drop your images here...</p>
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-medium">Drag & drop your images here</p>
                <p className="text-sm text-muted-foreground">or click to browse files</p>
              </div>
            )}
          </motion.div>
        </div>

        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-card rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Selected Files ({files.length})</div>
                {files.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      console.warn("🗑️ Clearing all files");
                      files.forEach(file => {
                        if (file.preview) {
                          URL.revokeObjectURL(file.preview);
                          console.debug("Cleaned up preview URL for", file.name);
                        }
                      });
                      setFiles([]);
                    }}
                  >
                    Clear all
                  </Button>
                )}
              </div>
              <div className="grid gap-2">
                <AnimatePresence>
                  {files.map((file, index) => (
                    <motion.div
                      key={`${file.name}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between bg-muted/50 rounded-lg p-3 group hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="relative flex-shrink-0">
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="h-12 w-12 object-cover rounded-md"
                            onLoad={() => {
                              console.debug("🖼️ Preview loaded for", file.name);
                            }}
                            onError={() => {
                              console.error("❌ Failed to load preview for", file.name);
                            }}
                          />
                          {file.status && (
                            <div className="absolute -right-1 -bottom-1">
                              {file.status === 'converting' && (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                  className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                                />
                              )}
                              {file.status === 'done' && (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              )}
                              {file.status === 'error' && (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove file</span>
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-card rounded-xl p-6 space-y-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base">Output Format</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formatOptions.map((option) => (
                  <button
                    key={option.value}
                    className={cn(
                      "flex flex-col items-start p-4 rounded-lg border-2 transition-all duration-200",
                      format === option.value 
                        ? "border-primary bg-primary/5" 
                        : "border-muted hover:border-primary/50"
                    )}
                    onClick={() => {
                      console.error("🔄 Format changed to:", option.value);
                      setFormat(option.value);
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{option.icon}</span>
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Quality</Label>
                <span className="text-sm font-medium">
                  {quality < 30 && "Low"}
                  {quality >= 30 && quality < 70 && "Medium"}
                  {quality >= 70 && "High"}
                  {" "}({quality}%)
                </span>
              </div>
              <div className="pt-2">
                <Slider
                  value={[quality]}
                  onValueChange={([value]) => {
                    console.info("🎚️ Quality adjusted to:", value);
                    setQuality(value);
                  }}
                  min={1}
                  max={100}
                  step={1}
                  className="[&_[role=slider]]:h-5 [&_[role=slider]]:w-5"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-muted-foreground">Smaller file size</span>
                  <span className="text-sm text-muted-foreground">Better quality</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Width</Label>
                <Input
                  type="number"
                  value={maxWidth}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    console.warn("📏 Max width changed to:", value);
                    if (value < 1) {
                      console.error("❌ Invalid width value:", value);
                      return;
                    }
                    setMaxWidth(value);
                  }}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Height</Label>
                <Input
                  type="number"
                  value={maxHeight}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    console.warn("📏 Max height changed to:", value);
                    if (value < 1) {
                      console.error("❌ Invalid height value:", value);
                      return;
                    }
                    setMaxHeight(value);
                  }}
                  min={1}
                />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {isConverting && (
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-center text-muted-foreground">
                      Converting... {Math.round(progress)}%
                    </p>
                  </div>
                )}
                <Button
                  className="w-full h-12 text-lg"
                  onClick={handleConvert}
                  disabled={isConverting}
                >
                  {isConverting ? "Converting..." : `Convert ${files.length} Image${files.length > 1 ? 's' : ''}`}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}