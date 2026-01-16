// src/pages/Admin/Proposal.jsx
import React, { useState } from 'react';
import TabMenu from '../../components/Shared/TabMenu';
import PengajuanProposal from '../../components/Admin/Proposal/PengajuanProposal';
import PerangkinganProposal from '../../components/Admin/Proposal/PerangkinganProposal';
import { FileText, Trophy } from 'lucide-react';

const Proposal = () => {
  const [activeTab, setActiveTab] = useState('pengajuan');

  const tabs = [
    {
      id: 'pengajuan',
      label: 'Pengajuan Proposal',
      icon: FileText
    },
    {
      id: 'rangking',
      label: 'Perankingan TOPSIS',
      icon: Trophy
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'pengajuan':
        return <PengajuanProposal />;
      case 'rangking':
        return <PerangkinganProposal />;
      default:
        return <PengajuanProposal />;
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

export default Proposal;