import React from 'react';
import Card from '../common/Card';

/**
 * JalDrishti AdvisoryCard Component
 * Provides clean, responsible, plain-language guidance for citizens.
 * Strictly avoids unverified medical advice or potable water certification claims.
 */
export default function AdvisoryCard({ overallStatus = 'Safe', activeAlertsCount = 0 }) {
  const normalizedStatus = overallStatus?.toLowerCase();

  const getAdvisory = () => {
    switch (normalizedStatus) {
      case 'unsafe':
      case 'critical':
        return {
          title: 'Citizen Advisory: Parameter Anomaly Detected',
          guidance:
            'One or more monitored water quality parameters are outside the configured permissible range. Municipal administrators have been automatically notified via the early warning system.',
          recommendation:
            'Citizens are advised to avoid direct consumption from this supply until normal baseline levels are restored and verified by local authorities.',
          borderClass: 'border-l-4 border-l-red-500'
        };
      case 'caution':
      case 'warning':
        return {
          title: 'Citizen Advisory: Parameter Warning',
          guidance:
            'One or more parameters are hovering near warning threshold limits. The automated system is actively monitoring trends.',
          recommendation:
            'Please check the parameter values above. No immediate hazard is reported, but cautious usage is recommended.',
          borderClass: 'border-l-4 border-l-amber-500'
        };
      case 'safe':
      default:
        return {
          title: 'Citizen Advisory: Normal Baseline Conditions',
          guidance:
            'Current monitored parameters are within the configured safe baseline ranges.',
          recommendation:
            'Continuous IoT multi-parameter telemetry is operational. You can check back anytime for real-time updates.',
          borderClass: 'border-l-4 border-l-emerald-500'
        };
    }
  };

  const advisory = getAdvisory();

  return (
    <Card className={`p-6 shadow-card ${advisory.borderClass}`}>
      <h3 className="text-base font-bold text-slate-900 mb-2">
        {advisory.title}
      </h3>
      <p className="text-sm text-slate-700 mb-3 leading-relaxed">
        {advisory.guidance}
      </p>
      <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100">
        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          <strong className="text-slate-800">Note:</strong> {advisory.recommendation}
        </p>
      </div>
    </Card>
  );
}
