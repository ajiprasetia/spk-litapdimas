//src/components/User/Informasi/TentangSistem.jsx
import React from 'react';
import {BarChart, Brain, Users, FileCheck, Info, Code, Layout, Award } from 'lucide-react';

const TentangSistem = () => {
  return (
    <div className="bg-white rounded-xl p-2 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 h-14 w-14 rounded-full flex items-center justify-center shadow-md">
          <Info className="text-white" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Tentang Sistem
          </h2>
          <p className="text-gray-600 mt-1">
            Informasi tentang sistem pendukung keputusan penelitian
          </p>
        </div>
      </div>

      {/* Panel Fitur */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h4 className="text-lg font-bold text-gray-800 mb-5 flex items-center">
          <Layout className="mr-2 text-green-500" size={22} />
          Fitur Utama
        </h4>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-5 rounded-xl border border-blue-100 transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h5 className="font-semibold text-blue-900">Peneliti & Reviewer</h5>
                <p className="text-blue-700 mt-2">
                  Sistem memungkinkan pengguna mendaftar sebagai peneliti atau reviewer dengan 
                  mekanisme verifikasi oleh admin.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-5 rounded-xl border border-green-100 transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <FileCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h5 className="font-semibold text-green-900">Pengelolaan Proposal</h5>
                <p className="text-green-700 mt-2">
                  Peneliti dapat mengajukan proposal penelitian dan melacak statusnya secara realtime.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-50 p-5 rounded-xl border border-green-100 transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Brain className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h5 className="font-semibold text-green-900">Fuzzy AHP</h5>
                <p className="text-green-700 mt-2">
                  Metode Fuzzy Analytical Hierarchy Process digunakan untuk menentukan bobot kriteria penilaian.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-5 rounded-xl border border-orange-100 transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <BarChart className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h5 className="font-semibold text-orange-900">TOPSIS</h5>
                <p className="text-orange-700 mt-2">
                  Technique for Order Preference by Similarity to Ideal Solution digunakan untuk
                  perangkingan proposal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alur Kerja Sistem */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h4 className="text-lg font-bold text-gray-800 mb-5 flex items-center">
          <Code className="mr-2 text-green-500" size={22} />
          Alur Kerja Sistem
        </h4>
        <div className="relative">
          {/* Timeline */}
          <div className="absolute left-4 top-0 h-full w-1 bg-gradient-to-b from-green-200 via-blue-200 to-green-200 rounded-full"></div>
          
          <div className="space-y-8">
            {/* Step 1 */}
            <div className="relative flex items-start ml-6 pl-6">
              <div className="absolute -left-8 mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md">
                <span className="font-bold">1</span>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 w-full">
                <h5 className="font-semibold text-blue-800">Pendaftaran Peneliti & Reviewer</h5>
                <p className="text-blue-700 mt-2">
                  Pengguna mengajukan diri sebagai peneliti atau reviewer dengan mengunggah dokumen pendukung.
                  Admin melakukan verifikasi dan persetujuan.
                </p>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="relative flex items-start ml-6 pl-6">
              <div className="absolute -left-8 mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md">
                <span className="font-bold">2</span>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-100 w-full">
                <h5 className="font-semibold text-green-800">Pengajuan Proposal</h5>
                <p className="text-green-700 mt-2">
                  Peneliti mengajukan proposal penelitian sesuai dengan klaster yang tersedia. 
                  Admin memverifikasi kelayakan proposal.
                </p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="relative flex items-start ml-6 pl-6">
              <div className="absolute -left-8 mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md">
                <span className="font-bold">3</span>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 w-full">
                <h5 className="font-semibold text-blue-800">Review Proposal</h5>
                <p className="text-blue-700 mt-2">
                  Reviewer melakukan penilaian terhadap proposal berdasarkan kriteria dan subkriteria yang telah ditetapkan.
                </p>
              </div>
            </div>
            
            {/* Step 4 */}
            <div className="relative flex items-start ml-6 pl-6">
              <div className="absolute -left-8 mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-yellow-600 text-white shadow-md">
                <span className="font-bold">4</span>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 w-full">
                <h5 className="font-semibold text-orange-800">Perangkingan TOPSIS</h5>
                <p className="text-orange-700 mt-2">
                  Sistem melakukan perangkingan proposal menggunakan metode TOPSIS berdasarkan hasil penilaian reviewer.
                </p>
              </div>
            </div>
            
            {/* Step 5 */}
            <div className="relative flex items-start ml-6 pl-6">
              <div className="absolute -left-8 mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md">
                <span className="font-bold">5</span>
              </div>
              <div className="bg-red-50 p-4 rounded-xl border border-red-100 w-full">
                <h5 className="font-semibold text-red-800">Penentuan Pendanaan</h5>
                <p className="text-red-700 mt-2">
                  Proposal dengan ranking tertinggi akan mendapatkan pendanaan sesuai kuota klaster yang tersedia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="bg-white p-6 rounded-xl border border-green-200 shadow-md">
        <div className="flex items-start gap-3">
          <div className="bg-white p-2 rounded-lg shadow-sm mt-0.5">
            <Award className="text-green-500" size={22} />
          </div>
          <div>
            <h4 className="text-lg font-bold mb-2">
              Dikembangkan Oleh
            </h4>
              Sistem Pendukung Keputusan ini dikembangkan oleh Aji Prasetia sebagai Syarat Untuk 
              Memperoleh Gelar Sarjana Teknik  Pada Jurusan Teknik Informatika
          </div>
        </div>
      </div>
    </div>
  );
};

export default TentangSistem;