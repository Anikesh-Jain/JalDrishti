import React, { useState, useRef } from 'react';
import Button from '../common/Button';

/**
 * JalDrishti Phase 23: ImageUpload Component
 *
 * Drag-and-drop or file selector widget with client-side format and size checks.
 * Enforces:
 * - Allowed formats: JPEG, PNG, WEBP
 * - Max size: 5MB
 */
export default function ImageUpload({ onImageSelect, disabled = false }) {
  const [dragOver, setDragOver] = useState(false);
  const [clientError, setClientError] = useState(null);
  const fileInputRef = useRef(null);

  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const validateAndSelect = (file) => {
    setClientError(null);

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setClientError('Unsupported format. Please select a JPEG, PNG, or WEBP image.');
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setClientError('File exceeds 5MB limit. Please upload a smaller image.');
      return;
    }

    if (file.size === 0) {
      setClientError('Selected file is empty (0 bytes).');
      return;
    }

    onImageSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          disabled
            ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
            : dragOver
            ? 'border-brand-500 bg-brand-50/50'
            : 'border-slate-300 hover:border-brand-400 bg-white hover:bg-slate-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
          id="water-image-input"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shadow-xs">
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              {disabled ? 'Image Upload Disabled' : 'Click to upload or drag & drop'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supported formats: JPEG, PNG, WEBP (Max 5MB)
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Browse Image
          </Button>
        </div>
      </div>

      {clientError && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{clientError}</span>
        </div>
      )}
    </div>
  );
}
