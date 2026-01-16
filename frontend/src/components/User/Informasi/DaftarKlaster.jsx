//src/components/User/Informasi/DaftarKlaster.jsx
import React, { useState, useEffect } from 'react';
import { KlasterServices } from '../../../services/Admin/KlasterServices';
import { 
  BadgeCheck, 
  Users, 
  FileText, 
  Folders, 
  AlertCircle, 
  Award,
  Target,
  Sparkles,
  Layers
} from 'lucide-react';

const DaftarKlaster = () => {
  const [klaster, setKlaster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadKlaster = async () => {
      try {
        setLoading(true);
        const data = await KlasterServices.getAllKlaster();
        setKlaster(data);
      } catch (err) {
        setError('Gagal memuat data klaster');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadKlaster();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-green-100 p-12 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-green-400 border-t-green-100 rounded-full animate-spin mb-4"></div>
          <p className="text-green-600 font-medium">Memuat data klaster...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-gradient-to-r from-red-50 to-red-50 border-l-4 border-red-500 rounded-lg shadow-sm flex items-start gap-3">
        <AlertCircle className="h-6 w-6 text-red-500 mt-0.5" />
        <div className="text-red-800 font-medium">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-2 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 h-14 w-14 rounded-full flex items-center justify-center shadow-md">
          <Layers className="text-white" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Daftar Klaster Penelitian
          </h2>
          <p className="text-gray-600 mt-1">
            Informasi tentang klaster penelitian yang tersedia untuk pendanaan
          </p>
        </div>
      </div>

      {klaster.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-md border border-gray-200 flex flex-col items-center justify-center">
          <Folders className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">Belum Ada Klaster</p>
          <p className="text-gray-500 text-center max-w-md">
            Belum ada klaster penelitian yang tersedia saat ini. Klaster akan ditambahkan oleh administrator.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {klaster.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-5 relative">
                <div className="absolute top-0 right-0 opacity-10">
                  <Award className="h-24 w-24 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{item.nama_klaster}</h3>
                <div className="flex items-center gap-2 text-indigo-100">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Kuota: {item.kuota_pendanaan} Proposal</span>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Persyaratan Administratif */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h4 className="font-semibold text-green-800 flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-green-600" />
                    Persyaratan:
                  </h4>
                  <ul className="space-y-2">
                    {item.persyaratan_administratif.slice(0, 3).map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-green-700">
                        <div className="mt-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                        </div>
                        <span>{req}</span>
                      </li>
                    ))}
                    {item.persyaratan_administratif.length > 3 && (
                      <li className="text-green-600 font-medium flex items-center gap-1 mt-1">
                        <Sparkles className="h-4 w-4" />
                        +{item.persyaratan_administratif.length - 3} persyaratan lainnya
                      </li>
                    )}
                  </ul>
                </div>

                {/* Output */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="font-semibold text-blue-800 flex items-center gap-2 mb-3">
                    <Target className="h-5 w-5 text-blue-600" />
                    Output:
                  </h4>
                  {item.output.length > 0 ? (
                    <ul className="space-y-2">
                      {item.output.slice(0, 3).map((out, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-blue-700">
                          <div className="mt-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                          </div>
                          <span>{out}</span>
                        </li>
                      ))}
                      {item.output.length > 3 && (
                        <li className="text-blue-600 font-medium flex items-center gap-1 mt-1">
                          <Sparkles className="h-4 w-4" />
                          +{item.output.length - 3} output lainnya
                        </li>
                      )}
                    </ul>
                  ) : (
                    <p className="text-blue-600 italic">Tidak ada data output</p>
                  )}
                </div>

                {/* Outcomes */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <h4 className="font-semibold text-purple-800 flex items-center gap-2 mb-3">
                    <BadgeCheck className="h-5 w-5 text-purple-600" />
                    Outcomes:
                  </h4>
                  {item.outcomes.length > 0 ? (
                    <ul className="space-y-2">
                      {item.outcomes.slice(0, 3).map((outcome, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-purple-700">
                          <div className="mt-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                          </div>
                          <span>{outcome}</span>
                        </li>
                      ))}
                      {item.outcomes.length > 3 && (
                        <li className="text-green-600 font-medium flex items-center gap-1 mt-1">
                          <Sparkles className="h-4 w-4" />
                          +{item.outcomes.length - 3} outcome lainnya
                        </li>
                      )}
                    </ul>
                  ) : (
                    <p className="text-green-600 italic">Tidak ada data outcome</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DaftarKlaster;