// src/pages/User/Reviewer.jsx
import React, { useState } from 'react';
import TabMenu from '../../components/Shared/TabMenu';
import PenilaianProposal from '../../components/User/Reviewer/PenilaianProposal';
import PanduanReviewer from '../../components/User/Reviewer/PanduanReviewer';
import { ClipboardCheck, BookOpen } from 'lucide-react';

const Reviewer = () => {
  const [activeTab, setActiveTab] = useState('penilaian');

  const tabs = [
    {
      id: 'penilaian',
      label: 'Penilaian Proposal',
      icon: ClipboardCheck
    },
    {
      id: 'panduan',
      label: 'Panduan Reviewer',
      icon: BookOpen
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'penilaian':
        return <PenilaianProposal />;
      case 'panduan':
        return <PanduanReviewer />;
      default:
        return <PenilaianProposal />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <TabMenu
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <div className="mt-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Reviewer;