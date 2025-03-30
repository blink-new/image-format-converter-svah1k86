
import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { Upload, Download, Image as ImageIcon, Trash2 } from 'lucide-react'

interface FileWithPreview extends File {
  preview?: string;
}

export const ImageConverter = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [targetFormat, setTargetFormat] = useState('png')
  const [converting, setConverting] = useState(false)
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prevFiles => [
      ...prevFiles,
      ...acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      }))
    ])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    }
  })

  const removeFile = (index: number) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles]
      URL.revokeObjectURL(newFiles[index].preview!)
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const handleConvert = async () => {
    setConverting(true)
    setProgress(0)
    
    // Simulate conversion process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      setProgress(i)
    }
    
    setConverting(false)
    // In a real app, we would actually convert the files here
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Image Converter</h1>
        <p className="text-gray-600">Convert your images to any format with ease</p>
      </div>

      <div 
        {...getRootProps()} 
        className={`drop-zone ${isDragActive ? 'dragging' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg mb-2">Drag & drop images here</p>
          <p className="text-sm text-gray-500">or click to select files</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Selected Images</h2>
            <div className="flex gap-4 items-center">
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value)}
                className="border rounded px-3 py-1"
              >
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
                <option value="webp">WebP</option>
                <option value="avif">AVIF</option>
              </select>
              <Button
                onClick={handleConvert}
                disabled={converting}
              >
                {converting ? 'Converting...' : 'Convert All'}
              </Button>
            </div>
          </div>

          {converting && (
            <div className="mb-6">
              <Progress value={progress} className="mb-2" />
              <p className="text-sm text-center text-gray-600">Converting... {progress}%</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <div key={file.name} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-12 h-12 mx-auto mt-8 text-gray-400" />
                  )}
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 p-1 bg-white/80 rounded-full shadow hover:bg-white transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
                <p className="mt-2 text-sm truncate">{file.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}