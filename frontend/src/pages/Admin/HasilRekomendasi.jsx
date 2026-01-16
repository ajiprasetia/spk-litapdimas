// src/pages/Admin/HasilRekomendasi.jsx
import React, { useState, useEffect, useCallback } from "react";
import { RankingProposalServices } from "../../services/Admin/RankingProposalServices";
import {
  AlertCircle,
  BarChart3,
  Sparkles,
  TrendingUp,
  ListFilter,
  User,
  Target,
  Trophy,
} from "lucide-react";

const HasilRekomendasi = () => {
  const [klasterList, setKlasterList] = useState([]);
  const [selectedKlaster, setSelectedKlaster] = useState("");
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load daftar klaster
  const loadKlasterList = useCallback(async () => {
    try {
      const data = await RankingProposalServices.getKlasterList();
      setKlasterList(data);
      if (data.length > 0) {
        setSelectedKlaster(data[0].id.toString());
      }
    } catch (error) {
      setError("Gagal memuat daftar klaster");
    }
  }, []);

  // Load daftar proposal ranking
  const loadRankings = useCallback(async () => {
    if (!selectedKlaster) return;
    try {
      setLoading(true);
      const data = await RankingProposalServices.getRankingByKlaster(
        selectedKlaster
      );

      // Filter hanya proposal yang lolos pendanaan
      const lolosProposals = data.filter((item) => {
        return item.peringkat <= item.kuota_pendanaan;
      });

      setRankings(lolosProposals);
    } catch (error) {
      setError("Gagal memuat data hasil rekomendasi");
      setRankings([]);
    } finally {
      setLoading(false);
    }
  }, [selectedKlaster]);

  // Load data awal
  useEffect(() => {
    loadKlasterList();
  }, [loadKlasterList]);

  // Load rankings saat klaster berubah
  useEffect(() => {
    if (selectedKlaster) {
      loadRankings();
    }
  }, [selectedKlaster, loadRankings]);

  // Handle perubahan dropdown klaster
  const handleKlasterChange = (e) => {
    setSelectedKlaster(e.target.value);
  };

  // Mendapatkan informasi klaster saat ini
  const getCurrentKlaster = () => {
    return klasterList.find((k) => k.id.toString() === selectedKlaster) || {};
  };

  return (
    <div className="bg-white rounded-xl p-8 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 h-14 w-14 rounded-full flex items-center justify-center shadow-md">
          <Trophy className="text-white" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Hasil Rekomendasi Proposal
          </h2>
          <p className="text-gray-600 mt-1">
            Daftar proposal yang direkomendasikan untuk pendanaan
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-gradient-to-r from-rose-50 to-red-50 border-l-4 border-rose-500 rounded-lg shadow-sm flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-rose-500 mt-0.5" />
          <div className="text-rose-800 font-medium">{error}</div>
        </div>
      )}

      {/* Klaster selector */}
      <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3 mb-3 md:mb-0">
            <div className="bg-indigo-500 p-2 rounded-lg">
              <ListFilter className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Pilih Klaster
              </h3>
            </div>
          </div>

          {/* Container untuk dropdown */}
          <div className="relative md:ml-2 w-full md:w-auto flex-grow">
            <select
              value={selectedKlaster}
              onChange={handleKlasterChange}
              className="pl-4 pr-10 py-3 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full relative shadow-sm text-gray-700 font-medium transition-all duration-200"
            >
              {klasterList.map((klaster) => (
                <option key={klaster.id} value={klaster.id}>
                  {klaster.nama_klaster}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-indigo-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Info Klaster */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-6 rounded-xl shadow-md text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <Target className="w-28 h-28" />
            </div>
            <div className="relative">
              <h4 className="font-medium text-indigo-100 mb-2 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Klaster Penelitian
              </h4>
              <p className="text-2xl font-bold">
                {getCurrentKlaster().nama_klaster || "-"}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 rounded-xl shadow-md text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <BarChart3 className="w-28 h-28" />
            </div>
            <div className="relative">
              <h4 className="font-medium text-emerald-100 mb-2 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Kuota Pendanaan
              </h4>
              <p className="text-2xl font-bold">
                {getCurrentKlaster().kuota_pendanaan || 0} Proposal
              </p>
            </div>
          </div>
        </div>
      </div>

      {/*Hasil Rekomendasi */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 p-5">
          <div className="bg-indigo-500 p-2 rounded-lg">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-indigo-800">
              Proposal Lolos Pendanaan
            </h4>
            <p className="text-sm text-indigo-700">
              Proposal yang direkomendasikan untuk menerima pendanaan
            </p>
          </div>
        </div>

        {/* Proposals Table */}
        <table className="min-w-full">
          <thead className="bg-indigo-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                No
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wide w-[40%]">
                Judul
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                Peneliti
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                Ranking
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                Nilai Preferensi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-4 border-indigo-400 border-t-indigo-100 rounded-full animate-spin mb-3"></div>
                    <p className="text-indigo-600">Memuat data...</p>
                  </div>
                </td>
              </tr>
            ) : rankings.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Trophy size={48} className="text-gray-300 mb-3" />
                    <p className="text-lg font-medium mb-1">
                      Belum ada proposal yang lolos pendanaan
                    </p>
                    <p className="text-sm">
                      Tidak ada proposal yang memenuhi kriteria untuk klaster
                      ini
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              rankings.map((item, index) => (
                <tr
                  key={item.id}
                  className="hover:bg-indigo-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-800">
                      {item.judul}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 italic">
                      {item.bidang_ilmu}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-indigo-100 p-1 rounded-full">
                        <User size={16} className="text-indigo-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">
                          {item.nama_peneliti}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="bg-amber-100 p-1.5 rounded-full">
                        <Trophy size={16} className="text-amber-600" />
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-800">
                        Ranking {item.peringkat}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="bg-emerald-100 p-1.5 rounded-full">
                        <TrendingUp size={16} className="text-emerald-600" />
                      </div>
                      <span className="text-sm font-medium text-emerald-700">
                        {parseFloat(item.nilai_preferensi).toFixed(4)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Ringkasan Hasil */}
      {rankings.length > 0 && (
        <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-500 p-2 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h5 className="text-lg font-bold text-indigo-800">
              Ringkasan Hasil
            </h5>
          </div>
          <p className="text-indigo-700 ml-12 text-lg">
            Total <span className="font-bold">{rankings.length}</span> proposal
            telah lolos pendanaan dari kuota{" "}
            <span className="font-bold">
              {getCurrentKlaster().kuota_pendanaan || 0}
            </span>{" "}
            untuk klaster{" "}
            <span className="font-bold">
              {getCurrentKlaster().nama_klaster || ""}
            </span>
            .
          </p>
        </div>
      )}
    </div>
  );
};

export default HasilRekomendasi;