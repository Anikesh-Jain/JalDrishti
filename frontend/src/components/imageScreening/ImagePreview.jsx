import React, { useMemo } from 'react';
import Button from '../common/Button';

/**
 * JalDrishti Phase 23: ImagePreview Component
 *
 * Renders thumbnail preview of selected image with file metadata and submission controls.
 */
export default function ImagePreview({
  file,
  onClear,
  onSubmit,
  isSubmitting = false
}) {
  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  const formattedSize = useMemo(() => {
    if (!file) return '0 KB';
    if (file.size < 1024 * 1024) {
      return `${Math.round(file.size / 1024)} KB`;
    }
    return `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
  }, [file]);

  if (!file) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row items-center gap-5">
        <div className="w-40 h-40 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
          <img
            src={previewUrl}
            alt="Water sample preview"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div>
            <h4 className="text-sm font-bold text-slate-800 break-all">{file.name}</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              File Size: <span className="font-medium text-slate-700">{formattedSize}</span> ·
              Type: <span className="font-medium text-slate-700">{file.type || 'image'}</span>
            </p>
          </div>

          <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-2.5 text-xs text-blue-800">
            <span className="font-semibold">Ready for visual evaluation:</span> Ensure the water sample is clearly visible without heavy reflection or obscuring objects.
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <Button
              variant="primary"
              size="sm"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="bg-brand-600 hover:bg-brand-700 text-white font-medium"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Analyzing Sample...
                </span>
              ) : (
                'Run Visual Screening'
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              disabled={isSubmitting}
            >
              Replace Image
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
