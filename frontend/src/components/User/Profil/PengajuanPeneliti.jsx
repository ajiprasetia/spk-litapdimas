// src/components/User/Profil/PengajuanPeneliti.jsx
import React, { useState, useEffect } from 'react';
import { PenelitiServices } from '../../../services/Shared/PenelitiServices';
import { 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Send, 
  Clock, 
  UserCircle, 
  GraduationCap, 
  FileUp, 
  FileCheck,
  CalendarDays,
  BookText
} from 'lucide-react';

const PengajuanPeneliti = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [statusPeneliti, setStatusPeneliti] = useState(null);

  useEffect(() => {
    loadStatusPeneliti();
  }, []);

  const loadStatusPeneliti = async () => {
    try {
      const response = await PenelitiServices.getStatusPeneliti();
      setStatusPeneliti(response);
    } catch (error) {
      setError(error.response?.data?.message || "Tidak terhubung ke server");
    }
  };

  const handleAjukanPeneliti = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const response = await PenelitiServices.ajukanPeneliti();
      setSuccess(response.message);
      loadStatusPeneliti();
    } catch (error) {
      setError(error.response?.data?.message || 'Gagal mengajukan peneliti');
    } finally {
      setLoading(false);
    }
  };

  const handleAjukanRevisi = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const response = await PenelitiServices.ajukanRevisi();
      setSuccess(response.message);
      loadStatusPeneliti();
    } catch (error) {
      setError(error.response?.data?.message || 'Gagal mengajukan revisi');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Terdaftar':
        return 'bg-white text-green-600';
      case 'Menunggu Persetujuan':
        return 'bg-white text-orange-600';
      case 'Revisi Pengajuan':
        return 'bg-white text-red-600';
      default:
        return 'bg-white text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Terdaftar':
        return <CheckCircle2 className="text-green-600" size={22} />;
      case 'Menunggu Persetujuan':
        return <Clock className="text-orange-600" size={22} />;
      case 'Revisi Pengajuan':
        return <AlertCircle className="text-red-600" size={22} />;
      default:
        return <FileText className="text-gray-600" size={22} />;
    }
  };

  const getBgGradient = (status) => {
    switch (status) {
      case 'Terdaftar':
        return 'from-green-100 to-green-100';
      case 'Menunggu Persetujuan':
        return 'from-yellow-100 to-yellow-100';
      case 'Revisi Pengajuan':
        return 'from-red-100 to-red-100';
      default:
        return 'from-gray-100 to-gray-100';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Timer untuk auto-hide pesan setelah 3 detik
      useEffect(() => {
        if (success || error) {
          const timer = setTimeout(() => {
            setSuccess("");
            setError("");
          }, 3000);
          return () => clearTimeout(timer);
        }
      }, [success, error]);
  
  return (
    <div className="bg-white rounded-xl p-2 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 h-14 w-14 rounded-full flex items-center justify-center shadow-md">
          <BookText className="text-white" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Pengajuan Peneliti
          </h2>
          <p className="text-gray-600 mt-1">
            Ajukan diri Anda sebagai peneliti untuk mengakses fitur penelitian
          </p>
        </div>
      </div>

      {/* Status Section */}
      <div className={`bg-gradient-to-r ${getBgGradient(statusPeneliti?.status_peneliti)} rounded-xl p-6 border border-gray-200 shadow-md`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-white h-12 w-12 rounded-full flex items-center justify-center shadow-sm">
              {getStatusIcon(statusPeneliti?.status_peneliti)}
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">Status Pengajuan</p>
              <div className="flex items-center">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(statusPeneliti?.status_peneliti)}`}>
                  {statusPeneliti?.status_peneliti || 'Belum Terdaftar'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div>
            {statusPeneliti?.status_peneliti === 'Belum Terdaftar' && (
              <button
                onClick={handleAjukanPeneliti}
                disabled={loading}
                className={`flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg 
                  hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transition-all duration-200 font-medium
                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2
                  ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Ajukan Sebagai Peneliti</span>
                  </>
                )}
              </button>
            )}
            
            {statusPeneliti?.status_peneliti === 'Revisi Pengajuan' && (
              <button
                onClick={handleAjukanRevisi}
                disabled={loading}
                className={`flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg 
                  hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transition-all duration-200 font-medium
                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2
                  ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Ajukan Revisi</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* Timestamp Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {statusPeneliti?.tanggal_pengajuan && (
            <div className="flex items-center gap-3">
              <CalendarDays className="text-green-500" size={18} />
              <div>
                <p className="text-xs text-gray-500">Tanggal Pengajuan</p>
                <p className="text-sm font-medium text-gray-700">{formatDate(statusPeneliti.tanggal_pengajuan)}</p>
              </div>
            </div>
          )}
          
          {statusPeneliti?.tanggal_disetujui && (
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-green-500" size={18} />
              <div>
                <p className="text-xs text-gray-500">Tanggal Disetujui</p>
                <p className="text-sm font-medium text-gray-700">{formatDate(statusPeneliti.tanggal_disetujui)}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Catatan Admin untuk Revisi */}
        {statusPeneliti?.status_peneliti === 'Revisi Pengajuan' && (
          <div className="mt-4 p-4 bg-white border-l-4 border-red-500 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2 flex items-center">
              <AlertCircle className="mr-2" size={18} />
              Catatan dari Admin:
            </h4>
            <p className="text-red-700 ml-6">{statusPeneliti.catatan_admin}</p>
          </div>
        )}
        
        {/* Success/Error Messages */}
        {success && (
          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-green-50 border-l-4 border-green-500 rounded-lg shadow-sm flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-500 mt-0.5" />
            <div className="text-green-800 font-medium">{success}</div>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-red-50 border-l-4 border-red-500 rounded-lg shadow-sm flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-500 mt-0.5" />
            <div className="text-red-800 font-medium">{error}</div>
          </div>
        )}
      </div>

      {/* Syarat Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-500 p-2 rounded-lg">
            <FileCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Syarat Pengajuan Peneliti</h3>
            <p className="text-gray-600 text-sm">Lengkapi persyaratan berikut untuk mengajukan diri sebagai peneliti</p>
          </div>
        </div>
        
        <div className="grid gap-4">
          {/* Profil Requirement */}
          <div className="flex items-start gap-4 p-5 bg-blue-50 rounded-xl border border-blue-100 transition-all hover:shadow-md">
            <div className="bg-white p-2 rounded-full shadow-sm">
              <UserCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-1">Data Profil</h4>
              <p className="text-blue-700">Melengkapi semua data profil yang diperlukan seperti informasi pribadi dan kontak</p>
            </div>
          </div>

          {/* Education Requirement */}
          <div className="flex items-start gap-4 p-5 bg-blue-50 rounded-xl border border-blue-100 transition-all hover:shadow-md">
            <div className="bg-white p-2 rounded-full shadow-sm">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-1">Riwayat Pendidikan</h4>
              <p className="text-blue-700">Mengisi riwayat pendidikan terakhir beserta bukti ijazah yang telah diupload</p>
            </div>
          </div>

          {/* Document Upload Requirement */}
          <div className="flex items-start gap-4 p-5 bg-blue-50 rounded-xl border border-blue-100 transition-all hover:shadow-md">
            <div className="bg-white p-2 rounded-full shadow-sm">
              <FileUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-800 mb-1">Berkas Yang Diperlukan</h4>
              <div className="pl-2 space-y-3">
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <p className="text-blue-700 font-medium">Kartu NIDN (Khusus untuk Dosen)</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <p className="text-blue-700 font-medium">SK Jabatan Fungsional terakhir (Wajib)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PengajuanPeneliti;