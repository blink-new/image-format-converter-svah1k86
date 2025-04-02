
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

interface FileWithPreview extends File {
  preview: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  progress: number;
  outputSize?: string;
  error?: string;
}

const formatOptions = [
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WebP' },
];

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function ImageConverter() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState("jpeg");
  const [maxWidth, setMaxWidth] = useState("1920");
  const [maxHeight, setMaxHeight] = useState("1080");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file),
      status: 'pending' as const,
      progress: 0,
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpeg', '.jpg', '.webp']
    },
    maxSize: 10485760, // 10MB
  });

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const processFiles = async () => {
    // Simulated processing - in a real app, you'd send to a server
    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== 'pending') continue;

      setFiles(prev => {
        const newFiles = [...prev];
        newFiles[i] = { ...newFiles[i], status: 'processing', progress: 0 };
        return newFiles;
      });

      // Simulate processing time
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setFiles(prev => {
          const newFiles = [...prev];
          newFiles[i] = { ...newFiles[i], progress };
          return newFiles;
        });
      }

      setFiles(prev => {
        const newFiles = [...prev];
        newFiles[i] = {
          ...newFiles[i],
          status: 'complete',
          progress: 100,
          outputSize: formatFileSize(newFiles[i].size * 0.7) // Simulated smaller size
        };
        return newFiles;
      });
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup previews
      files.forEach(file => {
        URL.revokeObjectURL(file.preview);
      });
    };
  }, []);

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
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
          <div className="text-xl font-medium">Drop your images here</div>
          <div className="text-sm text-muted-foreground">
            or click to select files
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Maximum file size: 10MB
          </div>
        </div>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card rounded-xl p-4 space-y-3"
          >
            {files.map((file, index) => (
              <div key={file.name} className="flex items-center gap-4 bg-background p-3 rounded-lg">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="truncate font-medium">{file.name}</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      className="flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatFileSize(file.size)}
                    {file.outputSize && ` → ${file.outputSize}`}
                  </div>
                  <div className="mt-2">
                    {file.status === 'pending' && (
                      <div className="text-sm text-muted-foreground">Ready to process</div>
                    )}
                    {file.status === 'processing' && (
                      <Progress value={file.progress} className="h-1" />
                    )}
                    {file.status === 'complete' && (
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Complete</span>
                      </div>
                    )}
                    {file.status === 'error' && (
                      <div className="flex items-center gap-1 text-sm text-destructive">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{file.error || 'Error processing file'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-card rounded-xl p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Output Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formatOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Quality ({quality}%)</Label>
            <Slider
              value={[quality]}
              onValueChange={([value]) => setQuality(value)}
              min={1}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Max Width (px)</Label>
            <Input
              type="number"
              value={maxWidth}
              onChange={(e) => setMaxWidth(e.target.value)}
              placeholder="e.g. 1920"
            />
          </div>

          <div className="space-y-2">
            <Label>Max Height (px)</Label>
            <Input
              type="number"
              value={maxHeight}
              onChange={(e) => setMaxHeight(e.target.value)}
              placeholder="e.g. 1080"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    onClick={processFiles}
                    disabled={files.length === 0 || files.every(f => f.status === 'complete')}
                  >
                    Process Images
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Convert all pending images with current settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}