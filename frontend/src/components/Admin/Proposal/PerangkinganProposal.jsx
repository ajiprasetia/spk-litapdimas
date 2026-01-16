// src/components/Admin/Proposal/PerangkinganProposal.jsx
import React, { useState, useEffect, useCallback } from "react";
import RankingProposalServices from "../../../services/Admin/RankingProposalServices";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  AlertCircle,
  Award,
  ListRestart,
  Calculator,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Delete,
  User,
  BarChart3,
  Trophy
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const HasilRangkingProposal = () => {
  const [klasterList, setKlasterList] = useState([]);
  const [selectedKlaster, setSelectedKlaster] = useState("");
  const [proposals, setProposals] = useState([]);
  const [ranking, setRanking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [detailPerhitungan, setDetailPerhitungan] = useState(null);

  // State untuk modal detail penilaian
  const [isDetailPenilaianOpen, setIsDetailPenilaianOpen] = useState(false);
  const [detailPenilaianData, setDetailPenilaianData] = useState(null);
  const [loadingDetailPenilaian, setLoadingDetailPenilaian] = useState(false);

  const loadKlasterList = useCallback(async () => {
    try {
      // Gunakan RankingProposalServices untuk mendapatkan daftar klaster
      const data = await RankingProposalServices.getKlasterList();
      setKlasterList(data);
      if (data.length > 0) {
        setSelectedKlaster(data[0].id.toString());
      }
    } catch (error) {
      setError("Gagal memuat daftar klaster");
    }
  }, []);

  const loadProposals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await RankingProposalServices.getProposalsByKlaster(
        selectedKlaster
      );
      setProposals(data);
    } catch (error) {
      setError("Gagal memuat data proposal");
    } finally {
      setLoading(false);
    }
  }, [selectedKlaster]);

  const loadRanking = useCallback(async () => {
    try {
      setLoading(true);
      const data = await RankingProposalServices.getRankingByKlaster(
        selectedKlaster
      );
      setRanking(data);
      // Jika ranking ada, ambil data detail perhitungan dari endpoint detail baru
      if (data && data.length > 0) {
        try {
          const detailData = await RankingProposalServices.getDetailPerhitungan(
            selectedKlaster
          );
          setDetailPerhitungan(detailData.detail_perhitungan);
        } catch (err) {
          console.error("Error loading calculation details:", err);
          // Jika error, jangan tampilkan pesan karena tidak mempengaruhi tampilan ranking
        }
      } else {
        // Jika tidak ada ranking, detail perhitungan juga kosong
        setDetailPerhitungan(null);
      }
    } catch (error) {
      // Jika tidak ada ranking, set ke null
      setRanking(null);
      setDetailPerhitungan(null);
    } finally {
      setLoading(false);
    }
  }, [selectedKlaster]);

  useEffect(() => {
    loadKlasterList();
  }, [loadKlasterList]);

  useEffect(() => {
    if (selectedKlaster) {
      loadProposals();
      loadRanking();
    }
  }, [selectedKlaster, loadProposals, loadRanking]);

  // Method untuk membuka detail penilaian
  const handleOpenDetailPenilaian = async (proposalId) => {
    try {
      setLoadingDetailPenilaian(true);
      const response = await RankingProposalServices.getDetailPenilaianProposal(proposalId);
      setDetailPenilaianData(response.data);
      setIsDetailPenilaianOpen(true);
    } catch (error) {
      setError("Gagal memuat detail penilaian");
    } finally {
      setLoadingDetailPenilaian(false);
    }
  };

  const handleCloseDetailPenilaian = () => {
    setIsDetailPenilaianOpen(false);
    setTimeout(() => {
      setDetailPenilaianData(null);
    }, 300);
  };

  const handleCalculateRanking = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      const response = await RankingProposalServices.calculateRanking(
        selectedKlaster
      );
      setRanking(response.ranking);
      setDetailPerhitungan(response.detail_perhitungan);
      setSuccess(response.message);
      // Scroll ke atas halaman
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setError(error.response?.data?.message || "Gagal menghitung ranking");
    } finally {
      setLoading(false);
    }
  };

  const handleResetRanking = async () => {
    if (!window.confirm("Apakah Anda yakin ingin mereset ranking?")) {
      return;
    }
    try {
      setLoading(true);
      setError("");
      const response = await RankingProposalServices.resetRanking(
        selectedKlaster
      );
      setSuccess(response.message);
      setRanking(null);
      setDetailPerhitungan(null);
      await loadProposals();
    } catch (error) {
      setError("Gagal mereset ranking");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Lolos Pendanaan":
        return "text-green-600 bg-green-100";
      case "Tidak Lolos Pendanaan":
        return "text-red-600 bg-red-100";
      case "Sudah Direview":
        return "text-green-600 bg-green-100";
      default:
        return "text-yellow-600 bg-yellow-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Lolos Pendanaan":
        return <CheckCircle2 size={20} className="text-green-600" />;
      case "Tidak Lolos Pendanaan":
        return <XCircle size={20} className="text-red-600" />;
      case "Sudah Direview":
        return <CheckCircle2 size={20} className="text-green-600" />;
      case "Belum Direview":
        return <Clock size={20} className="text-yellow-600" />;
      default:
        return <Clock size={20} className="text-gray-600" />;
    }
  };

  // Cek apakah semua proposal sudah direview
  const allReviewed =
    proposals.length > 0 &&
    !proposals.some((p) => p.status_review === "Belum Direview");

  // Cek apakah tidak ada proposal
  const hasProposals = proposals.length > 0;

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
          <Trophy className="text-white" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Perankingan TOPSIS
          </h2>
          <p className="text-gray-600 mt-1">
            Manajemen ranking proposal penelitian dengan metode TOPSIS
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-gradient-to-r from-red-50 to-red-50 border-l-4 border-red-500 rounded-lg shadow-sm flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-red-500 mt-0.5" />
          <div className="text-red-800 font-medium">{error}</div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-green-50 border-l-4 border-green-500 rounded-lg shadow-sm flex items-start gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-500 mt-0.5" />
          <div className="text-green-800 font-medium">{success}</div>
        </div>
      )}

      {/* Klaster Selector dan Action Buttons */}
      <div className="flex justify-between items-center gap-4">
        <select
          value={selectedKlaster}
          onChange={(e) => setSelectedKlaster(e.target.value)}
          className="px-4 py-2 border rounded-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {klasterList.map((klaster) => (
            <option key={klaster.id} value={klaster.id}>
              {klaster.nama_klaster}
            </option>
          ))}
        </select>

        {/* Action Buttons Rata Kanan */}
        <div className="flex items-center gap-2">
          {/* Tampilkan tombol Reset Ranking jika ada ranking */}
          {ranking && ranking.length > 0 && (
            <button
              onClick={handleResetRanking}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <ListRestart size={24} />
              Reset Ranking
            </button>
          )}

          {/* Tampilkan tombol Ranking TOPSIS jika belum ada ranking */}
          {(!ranking || ranking.length === 0) && (
            <button
              onClick={handleCalculateRanking}
              disabled={loading || !allReviewed || !hasProposals}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2
                ${
                  loading || !allReviewed || !hasProposals
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
            >
              <Calculator size={20} />
              Ranking TOPSIS
            </button>
          )}
        </div>
      </div>

      {/* Proposals Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Judul
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Peneliti
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reviewer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  Memuat data...
                </td>
              </tr>
            ) : proposals.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  Tidak ada proposal
                </td>
              </tr>
            ) : (
              proposals.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {item.judul}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.bidang_ilmu}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {item.nama_peneliti}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.peneliti_id_display}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.reviewers && item.reviewers.length > 0 ? (
                      <div className="text-sm">
                        {item.reviewers.map((reviewer, index) => (
                          <div key={reviewer.id} className="mb-1">
                            <div className="font-medium text-gray-900">
                              {reviewer.reviewer_nama}
                            </div>
                            <div className="text-gray-500">
                              {reviewer.reviewer_id_display}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status_review)}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          item.status_review
                        )}`}
                      >
                        {item.status_review}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Ranking Results */}
      {ranking && ranking.length > 0 && (
        <div className="space-y-6">
          {/* Ranking Table */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Award className="text-yellow-500" />
              Hasil Ranking Proposal
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ranking
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[30%]">
                      Judul
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Peneliti
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nilai Preferensi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detail Penilaian
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ranking.map((item) => {
                    const isLolos = item.peringkat <= item.kuota_pendanaan;
                    const status = isLolos ? "Lolos Pendanaan" : "Tidak Lolos Pendanaan";
                    
                    return (
                      <tr
                        key={item.id}
                        className={
                          isLolos
                            ? "bg-green-50 hover:bg-green-100"
                            : "bg-red-50 hover:bg-red-100"
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                          {item.peringkat}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.judul}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.bidang_ilmu}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {item.nama_peneliti}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {parseFloat(item.nilai_preferensi).toFixed(4)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {isLolos ? (
                              <CheckCircle2 size={20} className="text-green-600" />
                            ) : (
                              <XCircle size={20} className="text-red-600" />
                            )}
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                isLolos ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenDetailPenilaian(item.proposal_id)}
                            disabled={loadingDetailPenilaian}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm disabled:opacity-50"
                          >
                            <Eye size={16} />
                            Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

         {/* Detail TOPSIS*/}
         {detailPerhitungan && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="text-lg font-medium mb-4">
                Detail Perhitungan TOPSIS
              </h4>
              <div className="space-y-6">
                {/* Kriteria dan Bobot */}
                <div className="mb-6 border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium mb-2">Kriteria dan Bobot:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {detailPerhitungan.kriteria.map((k, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium">
                          {k.kode} - {k.nama}{" "}
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          Bobot: {parseFloat(k.bobot).toFixed(2)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Matriks Perhitungan */}
                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium mb-2">Matriks Keputusan:</h5>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                              Alternatif
                            </th>
                            {detailPerhitungan.kriteria.map((k) => (
                              <th
                                key={k.kode}
                                className="px-3 py-2 text-left text-xs font-medium text-gray-500"
                              >
                                {k.kode}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {detailPerhitungan.matriks_keputusan.map((row, i) => (
                            <tr key={i}>
                              <td className="px-3 py-2 text-sm font-medium text-gray-700">
                                {ranking[i]
                                  ? ranking[i].nama_peneliti
                                  : `Alternatif ${i + 1}`}
                              </td>
                              {Array.isArray(row) ? (
                                row.map((val, j) => (
                                  <td
                                    key={j}
                                    className="px-3 py-2 text-sm text-gray-900"
                                  >
                                    {parseFloat(val).toFixed(4)}
                                  </td>
                                ))
                              ) : (
                                <td
                                  colSpan={detailPerhitungan.kriteria.length}
                                  className="px-3 py-2 text-sm text-gray-500"
                                >
                                  Data tidak tersedia
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium mb-2">Matriks Normalisasi:</h5>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                              Alternatif
                            </th>
                            {detailPerhitungan.kriteria.map((k) => (
                              <th
                                key={k.kode}
                                className="px-3 py-2 text-left text-xs font-medium text-gray-500"
                              >
                                {k.kode}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {detailPerhitungan.matriks_normalisasi.map(
                            (row, i) => (
                              <tr key={i}>
                                <td className="px-3 py-2 text-sm font-medium text-gray-700">
                                  {ranking[i]
                                    ? ranking[i].nama_peneliti
                                    : `Alternatif ${i + 1}`}
                                </td>
                                {Array.isArray(row) ? (
                                  row.map((val, j) => (
                                    <td
                                      key={j}
                                      className="px-3 py-2 text-sm text-gray-900"
                                    >
                                      {parseFloat(val).toFixed(4)}
                                    </td>
                                  ))
                                ) : (
                                  <td
                                    colSpan={detailPerhitungan.kriteria.length}
                                    className="px-3 py-2 text-sm text-gray-500"
                                  >
                                    Data tidak tersedia
                                  </td>
                                )}
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium mb-2">Matriks Terbobot:</h5>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                              Alternatif
                            </th>
                            {detailPerhitungan.kriteria.map((k) => (
                              <th
                                key={k.kode}
                                className="px-3 py-2 text-left text-xs font-medium text-gray-500"
                              >
                                {k.kode}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {detailPerhitungan.matriks_terbobot.map((row, i) => (
                            <tr key={i}>
                              <td className="px-3 py-2 text-sm font-medium text-gray-700">
                                {ranking[i]
                                  ? ranking[i].nama_peneliti
                                  : `Alternatif ${i + 1}`}
                              </td>
                              {Array.isArray(row) ? (
                                row.map((val, j) => (
                                  <td
                                    key={j}
                                    className="px-3 py-2 text-sm text-gray-900"
                                  >
                                    {parseFloat(val).toFixed(4)}
                                  </td>
                                ))
                              ) : (
                                <td
                                  colSpan={detailPerhitungan.kriteria.length}
                                  className="px-3 py-2 text-sm text-gray-500"
                                >
                                  Data tidak tersedia
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Solusi Ideal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-lg p-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h5 className="font-medium mb-2 text-green-700">
                        Solusi Ideal Positif (A+):
                      </h5>
                      <div className="flex flex-wrap gap-4">
                        {detailPerhitungan.solusi_ideal.positif.map(
                          (val, i) => (
                            <div key={i} className="bg-white p-2 rounded">
                              <div className="text-xs text-gray-500">
                                {detailPerhitungan.kriteria[i].kode}
                              </div>
                              <div className="font-medium text-green-600">
                                {parseFloat(val).toFixed(4)}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h5 className="font-medium mb-2 text-red-700">
                        Solusi Ideal Negatif (A-):
                      </h5>
                      <div className="flex flex-wrap gap-4">
                        {detailPerhitungan.solusi_ideal.negatif.map(
                          (val, i) => (
                            <div key={i} className="bg-white p-2 rounded">
                              <div className="text-xs text-gray-500">
                                {detailPerhitungan.kriteria[i].kode}
                              </div>
                              <div className="font-medium text-red-600">
                                {parseFloat(val).toFixed(4)}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Jarak dan Preferensi */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium mb-2">
                      Jarak ke Solusi Ideal dan Nilai Preferensi:
                    </h5>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                              Alternatif
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                              D+
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                              D-
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                              Nilai Preferensi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {detailPerhitungan.jarak_solusi.positif.map(
                            (val, i) => (
                              <tr key={i}>
                                <td className="px-3 py-2 text-sm font-medium text-gray-700">
                                  {ranking[i]
                                    ? ranking[i].nama_peneliti
                                    : `Alternatif ${i + 1}`}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900">
                                  {parseFloat(val).toFixed(4)}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900">
                                  {parseFloat(
                                    detailPerhitungan.jarak_solusi.negatif[i]
                                  ).toFixed(4)}
                                </td>
                                <td className="px-3 py-2 text-sm font-medium text-green-600">
                                  {parseFloat(
                                    detailPerhitungan.nilai_preferensi[i]
                                  ).toFixed(4)}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Visualization */}
                  <div className="h-96 mt-8 border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium mb-4">
                      Visualisasi Nilai Preferensi:
                    </h5>
                    <ResponsiveContainer width="100%" height="85%">
                      <LineChart
                        data={ranking.map((item) => ({
                          ranking: item.peringkat,
                          nilai: parseFloat(item.nilai_preferensi).toFixed(4),
                          nama: item.nama_peneliti,
                        }))}
                        margin={{ right: 30, left: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="ranking"
                          label={{
                            value: "Ranking",
                            position: "insideBottom",
                            offset: 0,
                            dy: 10
                          }}
                        />
                        <YAxis
                          label={{
                            value: "Nilai Preferensi",
                            angle: -90,
                            position: "insideLeft",
                            dx: -15,
                            dy: 20
                          }}
                        />
                        <Tooltip
                          formatter={(value, name) => [
                            value,
                            name === "nilai" ? "Nilai Preferensi" : name,
                          ]}
                          labelFormatter={(value) => `Ranking: ${value}`}
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-3 border rounded shadow-md">
                                  <p className="font-medium">{`Ranking: ${label}`}</p>
                                  <p className="text-sm text-gray-700">{`Peneliti: ${payload[0].payload.nama}`}</p>
                                  <p className="text-sm text-green-600">{`Nilai: ${payload[0].value}`}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: 20 }} />
                        <Line
                          type="monotone"
                          dataKey="nilai"
                          name="Nilai Preferensi"
                          stroke="#10B981"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Detail Penilaian */}
      <Transition appear show={isDetailPenilaianOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCloseDetailPenilaian}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    Detail Penilaian Proposal
                  </Dialog.Title>

                  {loadingDetailPenilaian ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="text-gray-500">Memuat detail penilaian...</div>
                    </div>
                  ) : (
                    detailPenilaianData && (
                      <div className="space-y-6">
                        {/* Info Proposal */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Informasi Proposal</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="font-medium">Judul:</span>
                              <p className="text-gray-700">{detailPenilaianData.proposal.judul}</p>
                            </div>
                            <div>
                              <span className="font-medium">Peneliti:</span>
                              <p className="text-gray-700">{detailPenilaianData.proposal.nama_peneliti}</p>
                            </div>
                            <div>
                              <span className="font-medium">Klaster:</span>
                              <p className="text-gray-700">{detailPenilaianData.proposal.nama_klaster}</p>
                            </div>
                            <div>
                              <span className="font-medium">Bidang Ilmu:</span>
                              <p className="text-gray-700">{detailPenilaianData.proposal.bidang_ilmu}</p>
                            </div>
                          </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">Ringkasan Penilaian</h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-800">
                                {detailPenilaianData.summary.jumlah_reviewer}
                              </div>
                              <div className="text-sm text-blue-600">Total Reviewer</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-800">
                                {detailPenilaianData.summary.total_nilai_keseluruhan.toFixed(2)}
                              </div>
                              <div className="text-sm text-blue-600">Total Nilai</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-800">
                                {detailPenilaianData.summary.rata_rata_nilai.toFixed(2)}
                              </div>
                              <div className="text-sm text-blue-600">Rata-rata Nilai</div>
                            </div>
                          </div>
                        </div>

                        {/* Detail Penilaian per Reviewer */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900 flex items-center gap-2">
                            <User className="text-blue-600" />
                            Detail Penilaian per Reviewer
                          </h4>
                          
                          {detailPenilaianData.penilaian_by_reviewer.map((reviewer, index) => (
                            <div key={reviewer.reviewer_id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-center mb-4">
                                <h5 className="font-medium text-gray-900 flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${
                                    index === 0 ? 'bg-blue-500' : 'bg-green-500'
                                  }`}></div>
                                  {reviewer.reviewer_nama}
                                </h5>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-gray-900">
                                    {reviewer.total_nilai.toFixed(2)}
                                  </div>
                                  <div className="text-sm text-gray-500">Total Nilai</div>
                                </div>
                              </div>

                              {/* Tabel Penilaian */}
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-3 py-2 text-left">Kriteria</th>
                                      <th className="px-3 py-2 text-center">Bobot</th>
                                      <th className="px-3 py-2 text-center">Tipe</th>
                                      <th className="px-3 py-2 text-center">Skor</th>
                                      <th className="px-3 py-2 text-center">Nilai</th>
                                      <th className="px-3 py-2 text-left">Deskripsi</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {reviewer.penilaian.map((penilaian, idx) => (
                                      <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-3 py-2">
                                          <div className="font-medium">
                                            {penilaian.kode_kriteria}
                                          </div>
                                          <div className="text-xs text-gray-600">
                                            {penilaian.nama_kriteria}
                                          </div>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                          {penilaian.bobot}%
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            penilaian.tipe === 'High' ? 'bg-green-100 text-green-800' :
                                            penilaian.tipe === 'Middle' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                          }`}>
                                            {penilaian.tipe}
                                          </span>
                                        </td>
                                        <td className="px-3 py-2 text-center font-medium">
                                          {penilaian.skor}
                                        </td>
                                        <td className="px-3 py-2 text-center font-bold text-blue-600">
                                          {penilaian.nilai.toFixed(2)}
                                        </td>
                                        <td className="px-3 py-2 text-xs text-gray-600">
                                          {penilaian.deskripsi}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Visualisasi Perbandingan */}
                        {detailPenilaianData.penilaian_by_reviewer.length > 1 && (
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="font-medium mb-4 flex items-center gap-2">
                              <BarChart3 className="text-blue-600" />
                              Perbandingan Penilaian per Kriteria
                            </h4>
                            <div className="h-80">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={detailPenilaianData.kriteria.map(kriteria => {
                                    const result = { kriteria: kriteria.kode_kriteria };
                                    detailPenilaianData.penilaian_by_reviewer.forEach((reviewer, index) => {
                                      const penilaian = reviewer.penilaian.find(p => p.kriteria_id === kriteria.id);
                                      result[`reviewer_${index + 1}`] = penilaian ? penilaian.nilai : 0;
                                    });
                                    return result;
                                  })}
                                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="kriteria" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  {detailPenilaianData.penilaian_by_reviewer.map((reviewer, index) => (
                                    <Bar
                                      key={reviewer.reviewer_id}
                                      dataKey={`reviewer_${index + 1}`}
                                      name={reviewer.reviewer_nama}
                                      fill={index === 0 ? '#3B82F6' : '#10B981'}
                                    />
                                  ))}
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}

                        {/* Close Button */}
                        <div className="flex justify-end pt-4">
                          <button
                            onClick={handleCloseDetailPenilaian}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md flex items-center gap-2"
                          >
                            <Delete className="w-5 h-5" />
                            Tutup
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default HasilRangkingProposal;