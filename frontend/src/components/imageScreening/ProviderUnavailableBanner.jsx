import React from 'react';

/**
 * JalDrishti Phase 23: ProviderUnavailableBanner Component
 *
 * Explicit notification displayed when the hosted vision provider credentials
 * are not configured in the backend environment.
 */
export default function ProviderUnavailableBanner({ message }) {
  return (
    <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-5 text-amber-900 shadow-xs mb-6">
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
          !
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-amber-900">
            AI Screening Service Currently Unavailable
          </h4>
          <p className="text-xs text-amber-800 leading-relaxed">
            {message ||
              'Hosted vision provider credentials (GEMINI_API_KEY) are not configured in this deployment. Visual screening cannot be processed at this time.'}
          </p>
          <p className="text-[11px] text-amber-700 pt-1">
            Note: As per academic system design, fake or simulated AI results are strictly prohibited in the product path. Image upload is temporarily disabled until credentials are configured.
          </p>
        </div>
      </div>
    </div>
  );
}
