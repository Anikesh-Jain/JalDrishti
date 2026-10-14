import React from 'react';
import Badge from '../common/Badge';
import EmptyState from '../feedback/EmptyState';
import LoadingState from '../feedback/LoadingState';

/**
 * JalDrishti Phase 23: ScreeningHistory Component
 *
 * Displays chronological list of previous image screenings performed by the authenticated user.
 */
export default function ScreeningHistory({
  history = [],
  isLoading = false,
  onRefresh
}) {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <LoadingState message="Loading recent screening history..." />
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <EmptyState
          title="No Screening Records"
          message="You have not submitted any water images for screening yet. Upload an image above to get your first visual assessment."
        />
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h4 className="text-sm font-bold text-slate-800">Your Screening History</h4>
          <p className="text-xs text-slate-500">Recent visual assessments saved in your account</p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-xs text-brand-600 hover:text-brand-700 font-medium cursor-pointer"
          >
            Refresh
          </button>
        )}
      </div>

      <div className="divide-y divide-slate-100">
        {history.map((item) => {
          const isSafe = item.result === 'Safe';
          const isUnsafe = item.result === 'Unsafe';
          const badgeVariant = isSafe ? 'safe' : isUnsafe ? 'danger' : 'warning';
          const formattedDate = new Date(item.timestamp).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
          });

          return (
            <div key={item.id} className="p-4 hover:bg-slate-50/50 transition-colors">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <Badge variant={badgeVariant} size="sm">
                    {item.result}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-700">
                    Confidence: {item.confidence}%
                  </span>
                </div>
                <span className="text-xs text-slate-400">{formattedDate}</span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {item.advisory}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
