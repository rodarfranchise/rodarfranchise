import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function ImageUpload({
  value = null,
  onChange,
  onRemove,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  className = '',
  disabled = false,
  placeholder = 'Upload image',
  aspectRatio = 'square', // square, 16/9, 4/3
  required = false
}) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const aspectRatioClasses = {
    'square': 'aspect-square',
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]'
  }

  const validateFile = useCallback((file) => {
    setError('')
    
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return false
    }
    
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`)
      return false
    }
    
    return true
  }, [maxSize])

  const handleFileSelect = useCallback((file) => {
    if (!validateFile(file)) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      onChange({
        file,
        preview: e.target.result,
        name: file.name
      })
    }
    reader.readAsDataURL(file)
  }, [onChange, validateFile])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleRemove = useCallback(() => {
    onChange(null)
    onRemove?.()
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onChange, onRemove])

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">
          {placeholder}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {value && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            Remove
          </button>
        )}
      </div>

      {!value ? (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
            aspectRatioClasses[aspectRatio],
            isDragOver
              ? 'border-brand-blue-400 bg-brand-blue-50'
              : 'border-slate-300 hover:border-slate-400',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={!disabled ? openFileDialog : undefined}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <Upload className={cn(
              'h-8 w-8 text-slate-400 mb-2',
              isDragOver && 'text-brand-blue-500'
            )} />
            <p className="text-sm text-slate-600 mb-1">
              <span className="font-medium text-brand-blue-600">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-500">
              PNG, JPG, GIF up to {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </div>
        </div>
      ) : (
        <div className={cn('relative', aspectRatioClasses[aspectRatio])}>
          <img
            src={value.preview}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg border border-slate-200"
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50 transition-colors"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  )
}
