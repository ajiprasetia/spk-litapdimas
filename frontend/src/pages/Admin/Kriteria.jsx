// src/pages/Admin/Kriteria.jsx
import React, { useState } from 'react';
import TabMenu from '../../components/Shared/TabMenu';
import KriteriaManagement from '../../components/Admin/Kriteria/KriteriaManagement';
import BobotKriteria from '../../components/Admin/Kriteria/BobotKriteria';
import SubKriteria from '../../components/Admin/Kriteria/SubKriteria';
import { LayoutList, Scale, ListFilter } from 'lucide-react';

const Kriteria = () => {
  const [activeTab, setActiveTab] = useState('kriteria');

  const tabs = [
    {
      id: 'kriteria',
      label: 'Kriteria',
      icon: LayoutList
    },
    {
      id: 'bobot',
      label: 'Bobot Fuzzy AHP',
      icon: Scale
    },
    {
      id: 'sub_kriteria',
      label: 'Sub Kriteria',
      icon: ListFilter
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'kriteria':
        return <KriteriaManagement />;
      case 'bobot':
        return <BobotKriteria />;
      case 'sub_kriteria':
        return <SubKriteria />;
      default:
        return <KriteriaManagement />;
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

export default Kriteria;