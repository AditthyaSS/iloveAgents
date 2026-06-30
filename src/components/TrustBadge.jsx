// src/components/TrustBadge.jsx
import React from 'react';

const TrustBadge = ({ score, badge }) => {
  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'High': return 'bg-green-100 text-green-700 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  return (
    <div className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${getBadgeColor(badge)}`}>
      {badge} Trust • {score}/100
    </div>
  );
};

export default TrustBadge;