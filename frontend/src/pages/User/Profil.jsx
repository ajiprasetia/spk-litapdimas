// src/pages/User/Profil.jsx
import React, { useState } from 'react';
import TabMenu from '../../components/Shared/TabMenu';
import ProfilUser from '../../components/User/Profil/ProfilUser';
import RiwayatPendidikan from '../../components/User/Profil/RiwayatPendidikan';
import PengajuanPeneliti from '../../components/User/Profil/PengajuanPeneliti';
import PengajuanReviewer from '../../components/User/Profil/PengajuanReviewer';
import BerkasUser from '../../components/User/Profil/BerkasUser';
import { User, GraduationCap, Files, BookText, BookCheck } from 'lucide-react';

const Profil = () => {
  const [activeTab, setActiveTab] = useState('profil');

  const tabs = [
    {
      id: 'profil',
      label: 'Biodata',
      icon: User
    },
    {
      id: 'pendidikan',
      label: 'Riwayat Pendidikan',
      icon: GraduationCap
    },
    {
      id: 'berkas',
      label: 'Berkas',
      icon: Files
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
      case 'profil':
        return <ProfilUser />;
      case 'pendidikan':
        return <RiwayatPendidikan />;
      case 'berkas':
        return <BerkasUser />;
      case 'peneliti':
        return <PengajuanPeneliti />;
      case 'reviewer':
        return <PengajuanReviewer />;
      default:
        return <ProfilUser />;
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

export default Profil;