// src/components/User/Reviewer/PanduanReviewer.jsx
import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  AlertCircle, 
  Clock, 
  FileText, 
  Award, 
  BarChart, 
  ScrollText,
  ListChecks,
  UserCheck,
  Settings,
  Info,
  BookOpen,
  LightbulbIcon,
  ShieldCheck
} from 'lucide-react';
import { KriteriaServices } from '../../../services/Admin/KriteriaServices';

const PanduanReviewer = () => {
  const [kriteria, setKriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadKriteria = async () => {
      try {
        setLoading(true);
        const data = await KriteriaServices.getAllKriteria();
        setKriteria(data);
      } catch (err) {
        console.error("Error loading kriteria:", err);
        setError("Gagal memuat kriteria penilaian");
      } finally {
        setLoading(false);
      }
    };

    loadKriteria();
  }, []);

  // Icon mapping untuk kriteria (sesuaikan dengan kebutuhan)
  const getIconForKriteria = (index) => {
    const icons = [
      <FileText className="h-5 w-5 text-green-600" />,
      <Award className="h-5 w-5 text-blue-600" />,
      <BarChart className="h-5 w-5 text-blue-600" />,
      <Info className="h-5 w-5 text-green-600" />,
      <Clock className="h-5 w-5 text-orange-600" />
    ];
    return icons[index % icons.length];
  };

  return (
    <div className="bg-white rounded-xl p-2 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 h-14 w-14 rounded-full flex items-center justify-center shadow-md">
          <BookOpen className="text-white" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Panduan Reviewer
          </h2>
          <p className="text-gray-600 mt-1">
            Informasi tentang tanggung jawab reviewer proposal penelitian
          </p>
        </div>
      </div>

      {/* Reviewer Responsibilities Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h4 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
          <UserCheck className="text-green-500" size={22} /> 
          Tanggung Jawab Reviewer
        </h4>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-gradient-to-r from-green-50 to-green-50 p-5 rounded-xl border border-green-100 transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <CheckSquare className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h5 className="font-semibold text-green-900">Evaluasi Objektif</h5>
                <p className="text-green-700 mt-2">
                  Melakukan penilaian proposal berdasarkan kriteria yang telah ditetapkan,
                  dengan mempertahankan objektivitas dan menghindari konflik kepentingan.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-5 rounded-xl border border-orange-100 transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h5 className="font-semibold text-orange-900">Ketepatan Waktu</h5>
                <p className="text-orange-700 mt-2">
                  Menyelesaikan tugas review dalam batas waktu yang ditentukan
                  untuk memastikan proses evaluasi tetap berjalan efisien.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-5 rounded-xl border border-green-100 transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <ScrollText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h5 className="font-semibold text-green-900">Pemberian Feedback</h5>
                <p className="text-green-700 mt-2">
                  Memberikan ulasan yang bermanfaat dan konstruktif untuk membantu
                  peneliti dalam meningkatkan kualitas proposal mereka.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-red-50 p-5 rounded-xl border border-red-100 transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <ShieldCheck className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h5 className="font-semibold text-red-900">Kerahasiaan</h5>
                <p className="text-red-700 mt-2">
                  Menjaga kerahasiaan isi proposal dan tidak membagikan informasi proposal
                  dengan pihak yang tidak berwenang.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Process Flow Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h4 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
          <Settings className="text-green-500" size={22} /> 
          Alur Proses Review
        </h4>
        <div className="relative">
          {/* Timeline */}
          <div className="absolute left-4 top-0 h-full w-1 bg-gradient-to-b from-green-200 via-blue-200 to-blue-200 rounded-full"></div>
          
          <div className="space-y-8 relative z-10">
            <div className="relative flex items-start ml-6 pl-6">
              <div className="absolute -left-8 mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md">
                <span className="font-bold">1</span>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-100 w-full">
                <h5 className="font-semibold text-green-800">Penugasan Proposal</h5>
                <p className="text-green-700 mt-2">
                  Admin akan menugaskan proposal kepada Anda. Setelah ditugaskan, proposal akan muncul di daftar penugasan Anda.
                </p>
              </div>
            </div>

            <div className="relative flex items-start ml-6 pl-6">
              <div className="absolute -left-8 mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
                <span className="font-bold">2</span>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 w-full">
                <h5 className="font-semibold text-blue-800">Mempelajari Proposal</h5>
                <p className="text-blue-700 mt-2">
                  Pelajari proposal dengan seksama, termasuk dokumen pendukung seperti RAB dan memastikan Anda memahami tujuan penelitian.
                </p>
              </div>
            </div>

            <div className="relative flex items-start ml-6 pl-6">
              <div className="absolute -left-8 mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
                <span className="font-bold">3</span>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 w-full">
                <h5 className="font-semibold text-blue-800">Memberikan Penilaian</h5>
                <p className="text-blue-700 mt-2">
                  Tentukan skor untuk setiap kriteria penilaian berdasarkan kualitas proposal dan tingkat kesesuaiannya dengan kriteria.
                </p>
              </div>
            </div>

            <div className="relative flex items-start ml-6 pl-6">
              <div className="absolute -left-8 mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md">
                <span className="font-bold">4</span>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-100 w-full">
                <h5 className="font-semibold text-green-800">Mengirimkan Hasil Review</h5>
                <p className="text-green-700 mt-2">
                  Setelah penilaian lengkap, kirimkan hasil review Anda. Nilai akan diproses dalam sistem TOPSIS untuk perangkingan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kriteria Penilaian Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h4 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
          <ListChecks className="text-green-500" size={22} /> 
          Kriteria Penilaian
        </h4>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-green-400 border-t-green-100 rounded-full animate-spin mb-4"></div>
            <p className="text-green-600 font-medium">Memuat kriteria penilaian...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-gradient-to-r from-red-50 to-red-50 border-l-4 border-red-500 rounded-lg shadow-sm flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-500 mt-0.5" />
            <div className="text-red-800 font-medium">{error}</div>
          </div>
        ) : kriteria.length === 0 ? (
          <div className="p-5 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200 flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-orange-500 mt-0.5" />
            <div className="text-orange-700 font-medium">
              Belum ada kriteria yang ditetapkan oleh admin.
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {kriteria.map((item, index) => (
              <div key={item.id} className="bg-gradient-to-r from-gray-50 to-gray-50 p-5 rounded-xl border border-gray-200 transition-all hover:shadow-md">
                <h5 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    {getIconForKriteria(index)}
                  </div>
                  <span>{item.kode_kriteria} - {item.nama_kriteria}</span>
                </h5>
                <div className="flex flex-col md:flex-row md:items-center gap-3 mt-3">
                  <div className="text-sm font-semibold text-green-600 bg-green-50 py-1 px-3 rounded-full">
                    Bobot: {item.bobot}%
                  </div>
                  {/* Visual representation of weight */}
                  <div className="h-3 bg-gray-200 rounded-full flex-grow">
                    <div 
                      className="h-3 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full" 
                      style={{ width: `${item.bobot}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-gray-700 mt-3 bg-white p-3 rounded-lg border border-gray-100">
                  Saat melakukan penilaian, pilih skor pada sub-kriteria yang paling sesuai dengan kualitas proposal.
                </p>
              </div>
            ))}
            
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200 flex items-start gap-3">
              <div className="bg-white p-2 rounded-full shadow-sm">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-blue-800 font-medium">
                  <strong>Catatan:</strong> Kriteria di atas ditetapkan menggunakan metode Fuzzy AHP untuk menentukan bobot relatif 
                  dalam proses penilaian. Setiap kriteria memiliki sub-kriteria dengan tingkatan Low, Middle, dan High.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-green-50 to-green-50 p-6 rounded-xl border border-green-200 shadow-md">
        <div className="flex items-start gap-3 mb-4">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <LightbulbIcon className="h-6 w-6 text-orange-500" />
          </div>
          <h4 className="text-lg font-bold text-green-800">
            Tips Melakukan Review
          </h4>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-green-100 flex items-start gap-3 shadow-sm">
            <div className="bg-green-100 h-6 w-6 rounded-full flex items-center justify-center font-bold text-green-700">1</div>
            <p className="text-green-700">
              Luangkan waktu untuk memahami keseluruhan proposal sebelum memberikan penilaian.
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-green-100 flex items-start gap-3 shadow-sm">
            <div className="bg-green-100 h-6 w-6 rounded-full flex items-center justify-center font-bold text-green-700">2</div>
            <p className="text-green-700">
              Berikan skor yang sesuai dengan pedoman kriteria - jangan ragu memberikan skor rendah jika memang tidak memenuhi kriteria.
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-green-100 flex items-start gap-3 shadow-sm">
            <div className="bg-green-100 h-6 w-6 rounded-full flex items-center justify-center font-bold text-green-700">3</div>
            <p className="text-green-700">
              Jika perlu menyelesaikan review dalam beberapa sesi, pastikan Anda memahami bagian yang sudah Anda nilai sebelumnya.
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-green-100 flex items-start gap-3 shadow-sm">
            <div className="bg-green-100 h-6 w-6 rounded-full flex items-center justify-center font-bold text-green-700">4</div>
            <p className="text-green-700">
              Pertimbangkan secara holistik kualitas dan dampak penelitian - bukan hanya aspek-aspek individual.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanduanReviewer;