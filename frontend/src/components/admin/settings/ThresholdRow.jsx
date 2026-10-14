import React, { useState, useEffect } from 'react';
import Badge from '../../common/Badge';
import Button from '../../common/Button';

/**
 * JalDrishti Phase 20: ThresholdRow Component
 *
 * Dedicated parameter threshold configuration row/card.
 * Supports inline numeric editing, client-side safety validation,
 * enabled/disabled state toggling, and granular save/revert actions.
 */
export default function ThresholdRow({
  threshold,
  onSave,
  isSaving = false,
  feedback = null
}) {
  const [minVal, setMinVal] = useState('');
  const [maxVal, setMaxVal] = useState('');
  const [enabledVal, setEnabledVal] = useState(true);
  const [unitVal, setUnitVal] = useState('');
  const [localError, setLocalError] = useState(null);
  const [savedLocally, setSavedLocally] = useState(false);

  // Sync state whenever persisted threshold updates from backend
  useEffect(() => {
    if (threshold) {
      setMinVal(threshold.minimum !== undefined && threshold.minimum !== null ? String(threshold.minimum) : '');
      setMaxVal(threshold.maximum !== undefined && threshold.maximum !== null ? String(threshold.maximum) : '');
      setEnabledVal(threshold.enabled !== undefined ? Boolean(threshold.enabled) : true);
      setUnitVal(threshold.unit || '');
      setLocalError(null);
    }
  }, [threshold]);

  // Check if current form inputs differ from persisted backend threshold
  const isDirty =
    threshold &&
    (minVal !== String(threshold.minimum) ||
      maxVal !== String(threshold.maximum) ||
      enabledVal !== (threshold.enabled !== undefined ? Boolean(threshold.enabled) : true) ||
      unitVal !== (threshold.unit || ''));

  const handleReset = () => {
    if (!threshold) return;
    setMinVal(String(threshold.minimum));
    setMaxVal(String(threshold.maximum));
    setEnabledVal(threshold.enabled !== undefined ? Boolean(threshold.enabled) : true);
    setUnitVal(threshold.unit || '');
    setLocalError(null);
    setSavedLocally(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setSavedLocally(false);

    // Validate inputs
    const parsedMin = parseFloat(minVal);
    const parsedMax = parseFloat(maxVal);

    if (minVal === '' || !Number.isFinite(parsedMin)) {
      setLocalError('Minimum limit must be a valid finite number');
      return;
    }

    if (maxVal === '' || !Number.isFinite(parsedMax)) {
      setLocalError('Maximum limit must be a valid finite number');
      return;
    }

    if (parsedMin > parsedMax) {
      setLocalError(`Minimum limit (${parsedMin}) cannot exceed maximum limit (${parsedMax})`);
      return;
    }

    const payload = {
      minimum: parsedMin,
      maximum: parsedMax,
      unit: unitVal.trim() || threshold.unit,
      enabled: enabledVal
    };

    const result = await onSave(threshold.parameter, payload);
    if (result && result.success) {
      setSavedLocally(true);
      setTimeout(() => setSavedLocally(false), 3500);
    } else if (result && result.error) {
      setLocalError(result.error);
    }
  };

  // Friendly parameter descriptions & step sizes
  const metaMap = {
    ph: {
      title: 'Potential of Hydrogen (pH)',
      step: '0.1',
      desc: 'Acidic to alkaline operational range for early warning monitoring.'
    },
    turbidity: {
      title: 'Turbidity (Water Clarity)',
      step: '0.1',
      desc: 'Suspended particulate scattering threshold measured in Nephelometric Turbidity Units.'
    },
    tds: {
      title: 'Total Dissolved Solids (TDS)',
      step: '1',
      desc: 'Concentration of dissolved dissolved ions and minerals measured in ppm.'
    },
    temperature: {
      title: 'Water Temperature',
      step: '0.5',
      desc: 'Operational sensor temperature range in degrees Celsius.'
    }
  };

  const paramKey = (threshold.parameter || '').toLowerCase();
  const meta = metaMap[paramKey] || {
    title: threshold.parameter,
    step: 'any',
    desc: 'Monitored water quality parameter.'
  };

  return (
    <div
      className={`p-5 rounded-xl border transition-all duration-200 bg-white ${
        !enabledVal
          ? 'border-slate-200 bg-slate-50/60 opacity-90'
          : isDirty
          ? 'border-brand-300 ring-1 ring-brand-100 shadow-sm'
          : 'border-slate-200 shadow-xs hover:border-slate-300'
      }`}
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Header: Parameter Name, Status Badge, Enabled Switch */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <h4 className="text-base font-bold text-slate-900 tracking-tight">
                {meta.title}
              </h4>
              <Badge
                variant={enabledVal ? 'safe' : 'neutral'}
                size="sm"
                dot
              >
                {enabledVal ? 'Monitoring Active' : 'Alerts Disabled'}
              </Badge>
              {isDirty && (
                <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Unsaved changes
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">{meta.desc}</p>
          </div>

          {/* Enabled Toggle Switch */}
          <div className="flex items-center space-x-2.5">
            <label
              htmlFor={`toggle-${threshold.parameter}`}
              className="text-xs font-semibold text-slate-600 cursor-pointer select-none"
            >
              {enabledVal ? 'Alerts Enabled' : 'Alerts Disabled'}
            </label>
            <button
              type="button"
              id={`toggle-${threshold.parameter}`}
              role="switch"
              aria-checked={enabledVal}
              onClick={() => setEnabledVal(!enabledVal)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                enabledVal ? 'bg-brand-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  enabledVal ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Inputs Grid: Minimum, Maximum, Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          <div>
            <label
              htmlFor={`min-${threshold.parameter}`}
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Minimum Threshold
            </label>
            <div className="relative">
              <input
                id={`min-${threshold.parameter}`}
                name={`min-${threshold.parameter}`}
                type="number"
                step={meta.step}
                value={minVal}
                onChange={(e) => setMinVal(e.target.value)}
                placeholder="E.g. 6.5"
                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-colors"
                required
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">
                {unitVal || threshold.unit}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Readings below this trigger alerts</p>
          </div>

          <div>
            <label
              htmlFor={`max-${threshold.parameter}`}
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Maximum Threshold
            </label>
            <div className="relative">
              <input
                id={`max-${threshold.parameter}`}
                name={`max-${threshold.parameter}`}
                type="number"
                step={meta.step}
                value={maxVal}
                onChange={(e) => setMaxVal(e.target.value)}
                placeholder="E.g. 8.5"
                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-colors"
                required
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">
                {unitVal || threshold.unit}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Readings above this trigger alerts</p>
          </div>

          <div>
            <label
              htmlFor={`unit-${threshold.parameter}`}
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Measurement Unit
            </label>
            <input
              id={`unit-${threshold.parameter}`}
              name={`unit-${threshold.parameter}`}
              type="text"
              value={unitVal}
              onChange={(e) => setUnitVal(e.target.value)}
              placeholder="E.g. pH, NTU, ppm, °C"
              className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-colors"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">Display unit for telemetry</p>
          </div>
        </div>

        {/* Warning when disabled */}
        {!enabledVal && (
          <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center space-x-2">
            <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Alert generation is suspended for <strong>{meta.title}</strong> while disabled. Sensor readings will still be ingested.
            </span>
          </div>
        )}

        {/* Feedback Display */}
        {(localError || (feedback && feedback.status === 'error')) && (
          <div role="alert" className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium flex items-center space-x-2">
            <svg className="w-4 h-4 text-rose-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{localError || feedback?.message}</span>
          </div>
        )}

        {(savedLocally || (feedback && feedback.status === 'success')) && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium flex items-center space-x-2">
            <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>
              Threshold for {threshold.parameter} updated and active in backend monitoring engine.
            </span>
          </div>
        )}

        {/* Footer: Metadata & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="text-slate-400">
            {threshold.updatedAt ? (
              <span>
                Last updated:{' '}
                <strong className="text-slate-600 font-semibold">
                  {new Date(threshold.updatedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </strong>
              </span>
            ) : (
              <span>Default baseline configuration</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {isDirty && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
              >
                Revert
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!isDirty || isSaving}
              isLoading={isSaving}
            >
              Save Limits
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
