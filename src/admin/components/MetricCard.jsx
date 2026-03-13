import React from 'react';

export default function MetricCard({ icon: Icon, label, value, className }) {
  return (
    <div className={`bg-white rounded-2xl p-6 border border-primary/5 ${className || ''}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-accent" />
        </div>
        <span className="font-body text-sm text-primary/50">{label}</span>
      </div>
      <p className="font-heading font-extrabold text-3xl text-primary">{value}</p>
    </div>
  );
}
