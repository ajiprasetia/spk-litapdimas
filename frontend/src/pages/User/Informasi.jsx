// src/pages/User/Informasi.jsx
import React, { useState } from 'react';
import TabMenu from '../../components/Shared/TabMenu';
import DaftarKlaster from '../../components/User/Informasi/DaftarKlaster';
import TentangSistem from '../../components/User/Informasi/TentangSistem';
import { Layers, Info } from 'lucide-react';

const Informasi = () => {
  const [activeTab, setActiveTab] = useState('klaster');

  const tabs = [
    {
      id: 'klaster',
      label: 'Daftar Klaster',
      icon: Layers
    },
    {
      id: 'tentang',
      label: 'Tentang Sistem',
      icon: Info
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'klaster':
        return <DaftarKlaster />;
      case 'tentang':
        return <TentangSistem />;
      default:
        return <DaftarKlaster />;
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

export default Informasi;