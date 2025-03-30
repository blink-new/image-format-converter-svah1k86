
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { Slider } from "./ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "./ui/tooltip";

const formatOptions = [
  { value: "jpeg", label: "JPEG - Best for photos" },
  { value: "png", label: "PNG - Best for graphics" },
  { value: "webp", label: "WebP - Modern format" },
];

export function ImageConverter() {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState("jpeg");
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [maxHeight, setMaxHeight] = useState(1080);
  const [progress, setProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg", ".webp"]
    }
  });

  const handleConvert = async () => {
    setIsConverting(true);
    setProgress(0);
    // Conversion logic here
    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setProgress(i);
    }
    setIsConverting(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary"}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="text-4xl">📸</div>
          {isDragActive ? (
            <p className="text-lg">Drop the images here...</p>
          ) : (
            <p className="text-lg">Drag & drop images here, or click to select</p>
          )}
        </div>
      </div>

      <div className="bg-card rounded-lg p-6 space-y-6">
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
                      {option.label}
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
                    <Slider
                      value={[quality]}
                      onValueChange={([value]) => setQuality(value)}
                      min={1}
                      max={100}
                      step={1}
                    />
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

        {files.length > 0 && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {files.length} file(s) selected
            </div>
            {isConverting && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-center text-muted-foreground">
                  Converting... {progress}%
                </p>
              </div>
            )}
            <Button
              className="w-full"
              onClick={handleConvert}
              disabled={isConverting}
            >
              {isConverting ? "Converting..." : "Convert Images"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}