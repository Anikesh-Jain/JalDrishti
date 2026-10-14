import React from 'react';
import Button from '../common/Button';

/**
 * JalDrishti Phase 21: ExportButton Component
 *
 * Dedicated, accessible export trigger button providing:
 * - Loading / progress indication while CSV is generating
 * - Disabling during processing to prevent duplicate export requests
 * - Honest disabled state and explanation when record count is 0
 * - Clean download icon and record count badge
 */
export default function ExportButton({
  onClick,
  disabled = false,
  isExporting = false,
  recordCount = 0,
  label = 'Export CSV',
  className = ''
}) {
  const isZeroRecords = recordCount === 0;
  const shouldDisable = disabled || isExporting || isZeroRecords;

  const tooltipText = isZeroRecords
    ? 'No records available to export for the selected filter criteria'
    : isExporting
    ? 'Generating and formatting CSV file...'
    : `Download ${recordCount} record${recordCount === 1 ? '' : 's'} as CSV`;

  return (
    <Button
      variant="primary"
      size="sm"
      onClick={onClick}
      disabled={shouldDisable}
      isLoading={isExporting}
      className={`text-xs font-semibold shadow-xs flex items-center space-x-1.5 ${className}`}
      title={tooltipText}
    >
      {!isExporting && (
        <svg
          className="w-3.5 h-3.5 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
      )}
      <span>{isExporting ? 'Generating CSV...' : label}</span>
      {recordCount > 0 && !isExporting && (
        <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-brand-700 text-white rounded-full font-mono">
          {recordCount}
        </span>
      )}
    </Button>
  );
}
