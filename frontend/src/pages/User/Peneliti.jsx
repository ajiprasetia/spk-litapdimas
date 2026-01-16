// src/pages/User/Peneliti.jsx
import React, { useState } from 'react';
import TabMenu from '../../components/Shared/TabMenu';
import Proposal from '../../components/User/Peneliti/Proposal';
import PanduanPeneliti from '../../components/User/Peneliti/PanduanPeneliti';
import { FileText, BookOpen } from 'lucide-react';

const Peneliti = () => {
  const [activeTab, setActiveTab] = useState('proposal');

  const tabs = [
    {
      id: 'proposal',
      label: 'Proposal',
      icon: FileText
    },
    {
      id: 'panduan',
      label: 'Panduan Peneliti',
      icon: BookOpen
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'proposal':
        return <Proposal />;
      case 'panduan':
        return <PanduanPeneliti />;
      default:
        return <Proposal />;
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

export default Peneliti;