import React from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, AlertCircle } from 'lucide-react';

interface RiskBadgeProps {
  level: string;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, size = 'md' }) => {
  const norm = (level || 'PENDING').toUpperCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-300';
  let Icon = AlertCircle;

  if (norm === 'LOW') {
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    Icon = CheckCircle;
  } else if (norm === 'MEDIUM') {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-300';
    Icon = AlertTriangle;
  } else if (norm === 'HIGH') {
    colorClasses = 'bg-orange-50 text-orange-800 border-orange-300';
    Icon = AlertTriangle;
  } else if (norm === 'CRITICAL') {
    colorClasses = 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse';
    Icon = ShieldAlert;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full border shadow-sm ${colorClasses} ${sizeClasses}`}>
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{norm} RISK</span>
      {score !== undefined && (
        <span className="ml-1 px-1.5 py-0.2 bg-white/70 rounded-full text-[11px] font-bold">
          {score.toFixed(0)}/100
        </span>
      )}
    </span>
  );
};
