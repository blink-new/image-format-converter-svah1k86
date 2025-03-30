
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Trash2 } from "lucide-react";

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

  const removeFile = (index: number) => {
    setFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      URL.revokeObjectURL(newFiles[index].preview as string);
      newFiles.splice(index, 1);
      return newFiles;
    });
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
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag & drop images here, or click to select files</p>
        )}
      </div>

      <div className="flex gap-4 items-center">
        <select
          value={targetFormat}
          onChange={(e) => setTargetFormat(e.target.value)}
          className="border rounded p-2"
        >
          <option value="jpeg">JPEG</option>
          <option value="png">PNG</option>
          <option value="webp">WebP</option>
        </select>

        <Button
          onClick={handleConversion}
          disabled={files.length === 0 || converting}
        >
          {converting ? "Converting..." : "Convert & Download"}
        </Button>
      </div>

      {converting && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-gray-600 text-center">{Math.round(progress)}% complete</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((file, index) => (
          <div key={file.name + index} className="relative group">
            <img
              src={file.preview}
              alt={file.name}
              className="w-full h-40 object-cover rounded-lg"
            />
            <button
              onClick={() => removeFile(index)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <p className="text-sm text-gray-600 truncate mt-1">{file.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}