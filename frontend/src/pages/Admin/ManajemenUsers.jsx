// src/pages/Admin/ManajemenUsers.jsx
import React, { useState } from 'react';
import TabMenu from '../../components/Shared/TabMenu';
import DaftarUser from '../../components/Admin/ManajemenUser/DaftarUser';
import PengajuanPeneliti from '../../components/Admin/ManajemenUser/PengajuanPeneliti';
import PengajuanReviewer from '../../components/Admin/ManajemenUser/PengajuanReviewer';
import { Users, BookText, BookCheck } from 'lucide-react';

const ManajemenUsers = () => {
  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
    {
      id: 'users',
      label: 'Daftar User',
      icon: Users
    },
    {
      id: 'peneliti',
      label: 'Peneliti',
      icon: BookText
    },
    {
      id: 'reviewer',
      label: 'Reviewer',
      icon: BookCheck
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <DaftarUser />;
      case 'peneliti':
        return <PengajuanPeneliti />;
      case 'reviewer':
        return <PengajuanReviewer />;
      default:
        return <DaftarUser />;
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

export default ManajemenUsers;