
import { useState, useCallback } from "react";
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
  { value: "jpeg", label: "JPEG", description: "Best for photographs and complex images" },
  { value: "png", label: "PNG", description: "Best for graphics and images with transparency" },
  { value: "webp", label: "WebP", description: "Modern format with superior compression" },
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => 
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        status: 'pending'
      })
    );
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg", ".webp"]
    }
  });

  const handleConvert = async () => {
    setIsConverting(true);
    setProgress(0);

    // Update all files to converting status
    setFiles(prev => prev.map(file => ({ ...file, status: 'converting' as const })));

    // Simulate conversion for each file
    for (let i = 0; i < files.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setFiles(prev => prev.map((file, index) => 
        index === i ? { ...file, status: 'done' as const } : file
      ));
      setProgress((i + 1) * (100 / files.length));
    }

    setIsConverting(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
          isDragActive ? "border-primary bg-primary/10 scale-102" : "border-gray-300 hover:border-primary",
          "group"
        )}
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
                    files.forEach(file => file.preview && URL.revokeObjectURL(file.preview));
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
                            // Keep the preview URL since we're using it
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
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Output Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {formatOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Quality</Label>
                <span className="text-sm text-muted-foreground">{quality}%</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative pt-2">
                      <Slider
                        value={[quality]}
                        onValueChange={([value]) => setQuality(value)}
                        min={1}
                        max={100}
                        step={1}
                        className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                      />
                      <div className="absolute -top-1 left-0 right-0 flex justify-between text-xs text-muted-foreground">
                        <span>Low</span>
                        <span>High</span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Adjust image quality (higher = better quality but larger file size)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Width</Label>
                <Input
                  type="number"
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(Number(e.target.value))}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Height</Label>
                <Input
                  type="number"
                  value={maxHeight}
                  onChange={(e) => setMaxHeight(Number(e.target.value))}
                  min={1}
                />
              </div>
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
  );
}