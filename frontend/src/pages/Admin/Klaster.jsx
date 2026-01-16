// src/pages/Admin/Klaster.jsx
import React, { useState } from 'react';
import TabMenu from '../../components/Shared/TabMenu';
import ManajemenKlaster from '../../components/Admin/Klaster/ManajemenKlaster';
import TahunAnggaran from '../../components/Admin/Klaster/TahunAnggaran';
import { Layers, Calendar } from 'lucide-react';

const Klaster = () => {
  const [activeTab, setActiveTab] = useState('manajemen');

  const tabs = [
    { 
      id: 'manajemen', 
      label: 'Manajemen Klaster',
      icon: Layers
    },
    { 
      id: 'tahun_anggaran', 
      label: 'Tahun Anggaran',
      icon: Calendar
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'manajemen':
        return <ManajemenKlaster />;
      case 'tahun_anggaran':
        return <TahunAnggaran />;
      default:
        return <ManajemenKlaster />;
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

export default Klaster;