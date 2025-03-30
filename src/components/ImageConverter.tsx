
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Select } from "./ui/select";

interface ImageFile extends File {
  preview?: string;
}

export function ImageConverter() {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [targetFormat, setTargetFormat] = useState<string>("jpeg");
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => [
      ...prevFiles,
      ...acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      ),
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    }
  });

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

      // Create zip if multiple files, otherwise download single file
      if (convertedFiles.length === 1) {
        const url = URL.createObjectURL(convertedFiles[0].blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = convertedFiles[0].originalName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // For multiple files, create individual downloads
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
      }
    } catch (error) {
      console.error('Conversion failed:', error);
    } finally {
      setConverting(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="flex gap-4 mb-4">
        <select
          value={targetFormat}
          onChange={(e) => setTargetFormat(e.target.value)}
          className="px-3 py-2 border rounded-md text-base"
        >
          <option value="jpeg">JPEG</option>
          <option value="png">PNG</option>
          <option value="webp">WebP</option>
        </select>

        <Button
          onClick={handleConversion}
          disabled={files.length === 0 || converting}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6"
        >
          Convert & Download
        </Button>
      </div>

      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12
          flex items-center justify-center
          cursor-pointer transition-colors
          ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}
          ${files.length > 0 ? "h-40" : "h-64"}
        `}
      >
        <input {...getInputProps()} />
        <p className="text-lg text-center">
          Drag & drop images here, or click to select files
        </p>
      </div>

      {converting && (
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-4">
          {files.map((file, index) => (
            <div key={file.name + index} className="aspect-square">
              <img
                src={file.preview}
                alt={file.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}