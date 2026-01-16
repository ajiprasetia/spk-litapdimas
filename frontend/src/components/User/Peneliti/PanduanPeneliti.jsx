// src/components/User/Peneliti/PanduanPeneliti.jsx
import React from 'react';
import { 
  BookOpen, 
  FileText, 
  Edit,  
  List, 
  Clock, 
  Lightbulb,
  FileUp,
  CalendarClock
} from 'lucide-react';

const PanduanPeneliti = () => {
  return (
    <div className="bg-white rounded-xl p-2 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 h-14 w-14 rounded-full flex items-center justify-center shadow-md">
          <BookOpen className="text-white" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Panduan Peneliti
          </h2>
          <p className="text-gray-600 mt-1">
            Informasi lengkap tentang Peneliti
          </p>
        </div>
      </div>


      {/* Timeline Alur Pengajuan */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h4 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
          <CalendarClock className="text-green-500" size={22} /> 
          Alur Pengajuan Proposal
        </h4>
        <div className="relative">
          {/* Timeline */}
          <div className="absolute left-4 top-0 h-full w-1 bg-gradient-to-b from-green-200 via-blue-200 to-green-200 rounded-full"></div>
          
          <div className="space-y-8 relative z-10">
            <div className="relative flex items-start ml-6 pl-6">
              <div className="absolute -left-8 mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md">
                <span className="font-bold">1</span>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-100 w-full">
                <h5 className="font-semibold text-green-800">Verifikasi Peneliti</h5>
                <p className="text-green-700 mt-2">
                  Pastikan akun Anda telah diverifikasi sebagai Peneliti. Status peneliti aktif dibutuhkan
                  untuk dapat mengajukan proposal.
                </p>
              </div>
            </div>

            <div className="relative flex items-start ml-6 pl-6">
              <div className="absolute -left-8 mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
                <span className="font-bold">2</span>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 w-full">
                <h5 className="font-semibold text-blue-800">Persiapan Proposal</h5>
                <p className="text-blue-700 mt-2">
                  Buat proposal penelitian dan RAB sesuai template dan ketentuan klaster yang dipilih.
                  Dokumen harus dalam format PDF.
                </p>
              </div>
            </div>

            <div className="relative flex items-start ml-6 pl-6">
              <div className="absolute -left-8 mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md">
                <span className="font-bold">3</span>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 w-full">
                <h5 className="font-semibold text-blue-800">Pengajuan Proposal</h5>
                <p className="text-blue-700 mt-2">
                  Unggah proposal melalui sistem dengan memilih klaster dan mengisi semua informasi yang diperlukan.
                </p>
              </div>
            </div>

            <div className="relative flex items-start ml-6 pl-6">
              <div className="absolute -left-8 mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-md">
                <span className="font-bold">4</span>
              </div>
              <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-100 w-full">
                <h5 className="font-semibold text-cyan-800">Verifikasi Admin</h5>
                <p className="text-cyan-700 mt-2">
                  Admin akan memeriksa kelengkapan dokumen dan kesesuaian dengan persyaratan. Proposal yang lolos akan
                  diteruskan ke tahap review.
                </p>
              </div>
            </div>

            <div className="relative flex items-start ml-6 pl-6">
              <div className="absolute -left-8 mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md">
                <span className="font-bold">5</span>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 w-full">
                <h5 className="font-semibold text-orange-800">Tahap Review</h5>
                <p className="text-orange-700 mt-2">
                  Reviewer akan melakukan penilaian terhadap proposal berdasarkan kriteria yang telah ditetapkan.
                </p>
              </div>
            </div>

            <div className="relative flex items-start ml-6 pl-6">
              <div className="absolute -left-8 mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md">
                <span className="font-bold">6</span>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-100 w-full">
                <h5 className="font-semibold text-green-800">Pengumuman Hasil</h5>
                <p className="text-green-700 mt-2">
                  Proposal akan diranking menggunakan metode TOPSIS. Proposal dengan ranking tertinggi 
                  akan mendapatkan pendanaan sesuai kuota klaster.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Petunjuk Pengajuan Proposal */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h4 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
          <FileText className="text-green-500" size={22} /> 
          Petunjuk Pengajuan Proposal
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-5 rounded-xl border border-green-100 transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <Edit className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h5 className="font-semibold text-blue-900">Format Dokumen Proposal</h5>
                <p className="text-blue-700 mt-2">
                  Dokumen proposal harus dibuat mengikuti template yang telah disediakan, mencakup latar belakang, 
                  rumusan masalah, metode penelitian, dan luaran yang diharapkan. Dokumen harus dalam format PDF.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-5 rounded-xl border border-orange-100 transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <FileUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h5 className="font-semibold text-orange-900">Unggah RAB</h5>
                <p className="text-orange-700 mt-2">
                  Rencana Anggaran Biaya (RAB) harus dibuat secara rinci mencakup semua komponen pembiayaan
                  penelitian. Format RAB harus sesuai dengan template dan dalam bentuk PDF.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-50 p-5 rounded-xl border border-green-100 transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <List className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h5 className="font-semibold text-green-900">Pemilihan Klaster</h5>
                <p className="text-green-700 mt-2">
                  Pilih klaster yang sesuai dengan bidang keilmuan dan fokus penelitian Anda. Setiap klaster
                  memiliki persyaratan dan output yang berbeda.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-red-50 p-5 rounded-xl border border-red-100 transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h5 className="font-semibold text-red-900">Perhatikan Batas Waktu</h5>
                <p className="text-red-700 mt-2">
                  Pastikan Anda mengajukan proposal sebelum tenggat waktu yang ditentukan. Proposal yang
                  diajukan setelah tenggat tidak akan diproses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips & Tricks */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-xl border border-orange-200 shadow-md">
        <div className="flex items-start gap-3 mb-4">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <Lightbulb className="h-6 w-6 text-orange-500" />
          </div>
          <h4 className="text-lg font-bold text-orange-800">
            Tips Sukses Pengajuan Proposal
          </h4>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-orange-100 flex items-start gap-3 shadow-sm">
            <div className="bg-orange-100 h-6 w-6 rounded-full flex items-center justify-center font-bold text-orange-700">1</div>
            <p className="text-orange-700">
              Pastikan proposal Anda jelas, ringkas, dan langsung ke pokok permasalahan. Hindari penggunaan kata-kata yang berlebihan.
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-orange-100 flex items-start gap-3 shadow-sm">
            <div className="bg-orange-100 h-6 w-6 rounded-full flex items-center justify-center font-bold text-orange-700">2</div>
            <p className="text-orange-700">
              Berikan latar belakang yang kuat dengan didukung data dan referensi yang valid dan terkini.
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-orange-100 flex items-start gap-3 shadow-sm">
            <div className="bg-orange-100 h-6 w-6 rounded-full flex items-center justify-center font-bold text-orange-700">3</div>
            <p className="text-orange-700">
              Metode penelitian harus dijelaskan secara detail dan logis, dengan alur yang jelas dari pengumpulan data hingga analisis.
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-orange-100 flex items-start gap-3 shadow-sm">
            <div className="bg-orange-100 h-6 w-6 rounded-full flex items-center justify-center font-bold text-orange-700">4</div>
            <p className="text-orange-700">
              Pastikan anggaran yang diajukan realistis dan sesuai dengan kebutuhan penelitian, dengan justifikasi yang kuat.
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-orange-100 flex items-start gap-3 shadow-sm">
            <div className="bg-orange-100 h-6 w-6 rounded-full flex items-center justify-center font-bold text-orange-700">5</div>
            <p className="text-orange-700">
              Tunjukkan kebaharuan (novelty) dan dampak signifikan yang dapat dihasilkan dari penelitian Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanduanPeneliti;