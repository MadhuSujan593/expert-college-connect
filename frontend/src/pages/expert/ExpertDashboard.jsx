import React from 'react';

const ExpertDashboard = () => {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-heading font-bold mb-4 text-center">Expert Dashboard</h1>
      <p className="text-secondary-600 mb-8 text-center">
        Welcome to your dashboard! Here you can manage your profile, services, and view opportunities from colleges.
      </p>
      <div className="bg-white rounded-lg shadow-md border border-border p-8 min-h-[200px] flex items-center justify-center">
        <span className="text-secondary-400">Dashboard widgets and stats coming soon...</span>
      </div>
    </div>
  );
};

export default ExpertDashboard;