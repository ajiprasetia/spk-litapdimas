// src/components/Admin/Proposal/PengajuanProposal.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ProposalServices } from "../../../services/Shared/ProposalServices";
import { TahunAnggaranServices } from "../../../services/Admin/TahunAnggaranServices";
import Pagination from "../../Shared/Pagination";
import {
  Eye,
  Delete,
  Save,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  Users,
  TrendingUp,
  CheckSquare,
  Loader2
} from "lucide-react";

// ===== HELPER COMPONENTS =====
// Komponen untuk indikator workload - Optimized dengan React.memo
const WorkloadIndicator = React.memo(({ workload, maxWorkload = 5 }) => {
  const getColor = (count) => {
    if (count === 0) return 'bg-green-500';
    if (count <= 2) return 'bg-yellow-500';
    if (count <= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTextColor = (count) => {
    if (count === 0) return 'text-green-700';
    if (count <= 2) return 'text-yellow-700';
    if (count <= 4) return 'text-orange-700';
    return 'text-red-700';
  };

  const percentage = Math.min((workload / maxWorkload) * 100, 100);

  return (
    <div className="flex items-center space-x-2">
      <div className="w-16 bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getColor(workload)}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <span className={`text-xs font-medium ${getTextColor(workload)}`}>
        {workload}/{maxWorkload}
      </span>
    </div>
  );
});

// Komponen untuk reviewer card - Optimized dengan React.memo
const ReviewerCard = React.memo(({ reviewer, isSelected, onToggle, disabled }) => {
  const isAvailable = reviewer.current_workload < 3;
  const hasUnreviewedProposals = reviewer.unreviewed_proposals?.length > 0;

  const handleChange = useCallback((e) => {
    onToggle(reviewer.id, e.target.checked);
  }, [reviewer.id, onToggle]);

  return (
    <div
      className={`border rounded-lg p-4 transition-all duration-200 ${
        isSelected
          ? 'border-green-500 bg-green-50 shadow-md'
          : isAvailable
          ? 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
          : 'border-orange-200 bg-orange-50'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <label className="flex items-start space-x-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleChange}
          disabled={disabled}
          className="form-checkbox h-4 w-4 text-green-600 rounded focus:ring-green-500 mt-1"
        />
        <div className="flex-1 min-w-0">
          {/* Header Info */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{reviewer.nama}</p>
              <p className="text-sm text-gray-600">{reviewer.bidang_ilmu}</p>
            </div>
            {/* Status Badge */}
            <div className="flex flex-col items-end space-y-1">
              {reviewer.current_workload === 0 && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Tersedia
                </span>
              )}
              {reviewer.current_workload > 3 && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  Sibuk
                </span>
              )}
            </div>
          </div>

          {/* Workload Indicator */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">Beban Kerja:</span>
              <span className="text-xs text-gray-600">{reviewer.current_workload} proposal</span>
            </div>
            <WorkloadIndicator workload={reviewer.current_workload} />
          </div>

          {/* Daftar proposal yang belum direview */}
          {hasUnreviewedProposals && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <div className="flex items-center mb-2">
                <Clock className="h-3 w-3 text-orange-500 mr-1" />
                <p className="text-xs font-medium text-gray-700">
                  Sedang mereview ({reviewer.unreviewed_proposals.length}):
                </p>
              </div>
              <ul className="text-xs text-gray-600 space-y-1">
                {reviewer.unreviewed_proposals.slice(0, 2).map((prop) => (
                  <li key={prop.id} className="flex items-start">
                    <span className="text-orange-400 mr-1">•</span>
                    <span className="truncate">{prop.judul}</span>
                  </li>
                ))}
                {reviewer.unreviewed_proposals.length > 2 && (
                  <li className="text-gray-500 italic">
                    +{reviewer.unreviewed_proposals.length - 2} proposal lainnya
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </label>
    </div>
  );
});

// ===== MAIN COMPONENT =====
const PengajuanProposal = () => {
  // ===== STATE MANAGEMENT =====
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Tahun Anggaran State
  const [tahunAnggaranList, setTahunAnggaranList] = useState([]);
  const [selectedTahunAnggaran, setSelectedTahunAnggaran] = useState("");
  const [activeTahunAnggaran, setActiveTahunAnggaran] = useState(null);
  const [loadingTahun, setLoadingTahun] = useState(false);

  // Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isVerifikasiModalOpen, setIsVerifikasiModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);

  // Reviewer states
  const [availableReviewers, setAvailableReviewers] = useState([]);
  const [proposalInfo, setProposalInfo] = useState(null);
  const [reviewersLoading, setReviewersLoading] = useState(false);

  // Form states
  const [verifikasiForm, setVerifikasiForm] = useState({
    status: "",
    catatan: "",
    reviewer_ids: []
  });

  // Filter and pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  // Constants
  const itemsPerPage = 10;

  // ===== LIFECYCLE HOOKS =====
  // Load tahun anggaran
  useEffect(() => {
    const loadTahunAnggaran = async () => {
      try {
        setLoadingTahun(true);
        const [allTahun, activeTahun] = await Promise.all([
          TahunAnggaranServices.getAllTahunAnggaran(),
          TahunAnggaranServices.getActiveTahunAnggaran()
        ]);
        setTahunAnggaranList(allTahun);
        setActiveTahunAnggaran(activeTahun);

        // Set default to active tahun anggaran only on first load
        if (activeTahun && selectedTahunAnggaran === "") {
          setSelectedTahunAnggaran(activeTahun.id.toString());
        }
      } catch (error) {
        console.error("Error loading tahun anggaran:", error);
        setError("Gagal memuat tahun anggaran");
      } finally {
        setLoadingTahun(false);
      }
    };

    loadTahunAnggaran();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, selectedTahunAnggaran]);

  // ===== MEMOIZED VALUES =====
  const filteredProposals = useMemo(() => {
    return proposals.filter((item) => {
      const matchSearch =
        item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nama_user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.bidang_ilmu.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "" || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [proposals, searchTerm, statusFilter]);

  const getCurrentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredProposals.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredProposals, currentPage]);

  const getFilteredReviewers = useMemo(() => {
    if (showAvailableOnly) {
      return availableReviewers.filter(r => r.current_workload < 3);
    }
    return availableReviewers;
  }, [availableReviewers, showAvailableOnly]);

  const totalPages = Math.ceil(filteredProposals.length / itemsPerPage);

  const getSelectedTahunInfo = () => {
    const selectedTahun = tahunAnggaranList.find(
      tahun => tahun.id.toString() === selectedTahunAnggaran
    );
    return selectedTahun;
  };

  // ===== DATA LOADING FUNCTIONS =====
  const loadProposals = useCallback(async () => {
    if (!selectedTahunAnggaran) {
      setProposals([]);
      return;
    }

    try {
      setLoading(true);
      const data = await ProposalServices.getAllProposalAdmin(selectedTahunAnggaran);
      setProposals(data);
    } catch (error) {
      console.error("Error loading proposals:", error);
      setError(error.response?.data?.message || "Gagal memuat data proposal");
    } finally {
      setLoading(false);
    }
  }, [selectedTahunAnggaran]);

  useEffect(() => {
    loadProposals();
  }, [loadProposals]);

  // ===== FORM HANDLERS =====
  const handleVerifikasi = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validasi reviewer jika status Tahap Review
      if (verifikasiForm.status === "Tahap Review" && verifikasiForm.reviewer_ids.length === 0) {
        setError("Pilih minimal 1 reviewer terlebih dahulu");
        return;
      }

      // Validasi maksimal 2 reviewer
      if (verifikasiForm.reviewer_ids.length > 2) {
        setError("Maksimal 2 reviewer yang dapat ditugaskan");
        return;
      }

      // Validasi catatan jika status Ditolak
      if (verifikasiForm.status === "Ditolak" && !verifikasiForm.catatan.trim()) {
        setError("Catatan penolakan harus diisi");
        return;
      }

      // Reset catatan jika status bukan Ditolak
      const dataToSend = {
        ...verifikasiForm,
        catatan: verifikasiForm.status === "Ditolak" ? verifikasiForm.catatan : null,
      };

      const response = await ProposalServices.updateStatus(selectedProposal.id, dataToSend);
      setSuccess(response.message);
      await loadProposals();
      handleCloseVerifikasiModal();
    } catch (error) {
      setError(error.response?.data?.message || "Gagal memverifikasi proposal");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewerChange = useCallback((reviewerId, isSelected) => {
    setVerifikasiForm(prev => {
      let newReviewerIds = [...prev.reviewer_ids];
      if (isSelected) {
        if (newReviewerIds.length < 2) {
          newReviewerIds.push(reviewerId);
        }
      } else {
        newReviewerIds = newReviewerIds.filter(id => id !== reviewerId);
      }
      return {
        ...prev,
        reviewer_ids: newReviewerIds
      };
    });
  }, []);

  // ===== MODAL HANDLERS =====
  const handleOpenDetail = useCallback((proposal) => {
    setSelectedProposal(proposal);
    setIsDetailModalOpen(true);
  }, []);

  const handleOpenVerifikasi = useCallback(async (proposal) => {
    // Buka modal dulu untuk animasi yang smooth
    setSelectedProposal(proposal);
    setIsVerifikasiModalOpen(true);

    // Reset form
    setVerifikasiForm({
      status: "",
      catatan: "",
      reviewer_ids: [],
    });

    // Load data reviewer setelah modal terbuka
    if (proposal.status === "Belum Diperiksa") {
      try {
        setReviewersLoading(true);
        const response = await ProposalServices.getAvailableReviewers(proposal.id);
        setAvailableReviewers(response.available_reviewers || []);
        setProposalInfo(response.proposal_info || null);
      } catch (error) {
        setError("Gagal memuat daftar reviewer");
      } finally {
        setReviewersLoading(false);
      }
    }
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setTimeout(() => {
      setSelectedProposal(null);
    }, 300);
  }, []);

  const handleCloseVerifikasiModal = useCallback(() => {
    setIsVerifikasiModalOpen(false);
    setTimeout(() => {
      setSelectedProposal(null);
      setAvailableReviewers([]);
      setProposalInfo(null);
      setVerifikasiForm({
        status: "",
        catatan: "",
        reviewer_ids: [],
      });
      setShowAvailableOnly(false);
      setReviewersLoading(false);
    }, 300);
  }, []);

  // ===== UTILITY FUNCTIONS =====
  const getStatusIcon = (status) => {
    const statusConfig = {
      "Belum Diperiksa": <Clock size={20} className="text-gray-600" />,
      "Ditolak": <XCircle size={20} className="text-red-600" />,
      "Tahap Review": <AlertCircle size={20} className="text-blue-600" />,
      "Dalam Evaluasi Akhir": <Clock size={20} className="text-yellow-600" />,
      "Lolos Pendanaan": <CheckCircle2 size={20} className="text-green-600" />,
      "Tidak Lolos Pendanaan": <XCircle size={20} className="text-red-600" />,
    };
    return statusConfig[status] || <Clock size={20} className="text-gray-600" />;
  };

  const getStatusColor = (status) => {
    const colorConfig = {
      "Belum Diperiksa": "text-gray-600 bg-gray-100",
      "Ditolak": "text-red-600 bg-red-100",
      "Tahap Review": "text-blue-600 bg-blue-100",
      "Dalam Evaluasi Akhir": "text-yellow-600 bg-yellow-100",
      "Lolos Pendanaan": "text-green-600 bg-green-100",
      "Tidak Lolos Pendanaan": "text-red-600 bg-red-100",
    };
    return colorConfig[status] || "text-gray-600 bg-gray-100";
  };

  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
  }, []);

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
          <FileText className="text-white" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Pengajuan Proposal
          </h2>
          <p className="text-gray-600 mt-1">
            Verifikasi dan kelola pengajuan proposal penelitian
          </p>
        </div>
      </div>

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

      {/* ===== SEARCH AND FILTER SECTION ===== */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Filter Tahun Anggaran dengan Label */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Tahun Anggaran:
            </label>
            {loadingTahun ? (
              <div className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-gray-50">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500"></div>
                <span className="text-sm text-gray-500">Memuat...</span>
              </div>
            ) : (
              <select
                value={selectedTahunAnggaran}
                onChange={(e) => setSelectedTahunAnggaran(e.target.value)}
                className="px-4 py-2 border rounded-lg text-gray-700 w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Pilih Tahun Anggaran</option>
                {tahunAnggaranList.map((tahun) => (
                  <option key={tahun.id} value={tahun.id.toString()}>
                    {tahun.tahun_anggaran}
                    {activeTahunAnggaran && tahun.id === activeTahunAnggaran.id && " (Aktif)"}
                    {tahun.status === "Selesai" && " (Selesai)"}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari proposal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg text-gray-700 w-full sm:w-54 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Semua Status</option>
            <option value="Belum Diperiksa">Belum Diperiksa</option>
            <option value="Ditolak">Ditolak</option>
            <option value="Tahap Review">Tahap Review</option>
            <option value="Dalam Evaluasi Akhir">Dalam Evaluasi Akhir</option>
            <option value="Lolos Pendanaan">Lolos Pendanaan</option>
            <option value="Tidak Lolos Pendanaan">Tidak Lolos Pendanaan</option>
          </select>
        </div>
        {!loading && (
          <div className="text-sm text-gray-600">
            {selectedTahunAnggaran && (
              <div className="mb-1">
                Proposal di tahun {getSelectedTahunInfo()?.tahun_anggaran}:{" "}
                <span className="font-medium text-green-600">{filteredProposals.length}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== PROPOSAL TABLE ===== */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
       <table className="min-w-full divide-y divide-gray-200">
         <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peneliti</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detail</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verifikasi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  Memuat data...
                </td>
              </tr>
            ) : !selectedTahunAnggaran ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  Pilih tahun anggaran untuk melihat proposal
                </td>
              </tr>
            ) : filteredProposals.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  {searchTerm || statusFilter 
                    ? "Tidak ada hasil pencarian" 
                    : selectedTahunAnggaran 
                      ? `Tidak ada proposal di tahun ${getSelectedTahunInfo()?.tahun_anggaran}`
                      : "Tidak ada proposal"
                  }
                </td>
              </tr>
            ) : (
              getCurrentItems.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{item.judul}</div>
                    <div className="text-sm text-gray-500">{item.bidang_ilmu}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{item.nama_user}</div>
                    <div className="text-sm text-gray-500">{item.peneliti_id_display}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.reviewers && item.reviewers.length > 0 ? (
                      <div className="text-sm">
                        {item.reviewers.map((reviewer, index) => (
                          <div key={reviewer.id} className="mb-1">
                            <div className="font-medium text-gray-900">{reviewer.reviewer_nama}</div>
                            <div className="text-gray-500">{reviewer.reviewer_id_display}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenDetail(item)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                    >
                      <Eye size={20} />
                      <span className="text-sm">Detail</span>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {item.status === "Belum Diperiksa" ? (
                      <button
                        onClick={() => handleOpenVerifikasi(item)}
                        className="px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md flex items-center gap-2"
                      >
                        <CheckCircle2 size={20} />
                        Verifikasi
                      </button>
                    ) : (
                      <div className="text-sm">-</div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ===== PAGINATION ===== */}
      {filteredProposals.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* ===== DETAIL MODAL ===== */}
      <Transition appear show={isDetailModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCloseDetailModal}>
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
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    Detail Proposal
                  </Dialog.Title>

                  {selectedProposal && (
                    <div className="space-y-6">
                      {/* Info Section */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm col-span-full">
                          <h4 className="text-sm font-medium text-gray-700">Peneliti:</h4>
                          <p className="mt-1 font-medium">Nama: {selectedProposal.nama_user}</p>
                          <p className="text-sm text-gray-500">{selectedProposal.peneliti_id_display}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Bidang Ilmu: {selectedProposal.peneliti_bidang_ilmu || "-"}
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm col-span-full">
                          <h4 className="text-sm font-medium text-gray-700">Judul Proposal:</h4>
                          <p className="mt-1">{selectedProposal.judul}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm col-span-full">
                          <h4 className="text-sm font-medium text-gray-700">Klaster:</h4>
                          <p className="mt-1">{selectedProposal.nama_klaster}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm col-span-full">
                          <h4 className="text-sm font-medium text-gray-700">Bidang Ilmu Penelitian:</h4>
                          <p className="mt-1">{selectedProposal.bidang_ilmu}</p>
                        </div>
                      </div>

                      {/* Outline Section */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="text-sm font-medium text-gray-700">Outline/Gambaran Singkat:</h4>
                        <p className="mt-1 text-gray-600">{selectedProposal.outline}</p>
                      </div>

                      {/* Files Section */}
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() =>
                            window.open(
                              ProposalServices.getProposalFileUrl(selectedProposal.file_proposal),
                              "_blank"
                            )
                          }
                          className="flex items-center gap-2 p-3 text-blue-600 border border-blue-200 hover:text-blue-800 bg-blue-50 rounded-lg"
                        >
                          <FileText size={20} />
                          <span>Lihat Proposal</span>
                        </button>
                        <button
                          onClick={() =>
                            window.open(
                              ProposalServices.getRABFileUrl(selectedProposal.file_rab),
                              "_blank"
                            )
                          }
                          className="flex items-center gap-2 p-3 text-blue-600 border border-blue-200 hover:text-blue-800 bg-blue-50 rounded-lg"
                        >
                          <FileText size={20} />
                          <span>Lihat RAB</span>
                        </button>
                      </div>

                      {/* Status Section */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Status Proposal:</h4>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(selectedProposal.status)}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedProposal.status)}`}>
                            {selectedProposal.status}
                          </span>
                        </div>
                      </div>

                      {/* Notes Section */}
                      {selectedProposal.status === "Ditolak" && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <h4 className="font-medium text-red-700 mb-2">Catatan Admin:</h4>
                          <p className="text-red-600">{selectedProposal.catatan_admin}</p>
                        </div>
                      )}

                      {/* Close Button */}
                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={handleCloseDetailModal}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md flex items-center gap-2"
                        >
                          <Delete className="w-5 h-5" />
                          Tutup
                        </button>
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* ===== VERIFIKASI MODAL ===== */}
      <Transition appear show={isVerifikasiModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCloseVerifikasiModal}>
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
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    Verifikasi Proposal
                  </Dialog.Title>

                  {/* Proposal Info */}
                  {proposalInfo && (
                    <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-800 mb-1">Detail Proposal:</h4>
                          <p className="text-sm"><span className="font-medium">Judul:</span> {proposalInfo.judul}</p>
                          <p className="text-sm"><span className="font-medium">Peneliti:</span> {proposalInfo.peneliti}</p>
                          <p className="text-sm"><span className="font-medium">Bidang Ilmu:</span> {proposalInfo.bidang_ilmu}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleVerifikasi} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status Verifikasi</label>
                      <select
                        value={verifikasiForm.status}
                        onChange={(e) =>
                          setVerifikasiForm({
                            ...verifikasiForm,
                            status: e.target.value,
                            reviewer_ids: e.target.value !== "Tahap Review" ? [] : verifikasiForm.reviewer_ids,
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      >
                        <option value="">Pilih Status</option>
                        <option value="Ditolak">Ditolak</option>
                        <option value="Tahap Review">Lanjut ke Tahap Review</option>
                      </select>
                    </div>

                    {verifikasiForm.status === "Tahap Review" && (
                      <div className="space-y-4">
                        {/* Header untuk pemilihan reviewer */}
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Pilih Reviewer (Maksimal 2)
                            </label>
                            {proposalInfo && (
                              <p className="text-sm text-blue-600 mt-1">
                                Bidang Ilmu: {proposalInfo.bidang_ilmu}
                              </p>
                            )}
                          </div>
                          {/* Filter toggle */}
                          {!reviewersLoading && availableReviewers.length > 0 && (
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="availableOnly"
                                checked={showAvailableOnly}
                                onChange={(e) => setShowAvailableOnly(e.target.checked)}
                                className="form-checkbox h-4 w-4 text-green-600"
                              />
                              <label htmlFor="availableOnly" className="text-sm text-gray-700">
                                Hanya yang tersedia
                              </label>
                            </div>
                          )}
                        </div>

                        {/* Loading State */}
                        {reviewersLoading && (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                            <span className="text-sm text-gray-600">Memuat daftar reviewer...</span>
                          </div>
                        )}

                        {/* Statistik reviewer - Hanya tampil jika data sudah dimuat */}
                        {!reviewersLoading && availableReviewers.length > 0 && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                  <Users className="h-4 w-4 text-gray-500" />
                                  <span>Total: {availableReviewers.length}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <CheckSquare className="h-4 w-4 text-green-500" />
                                  <span>Tersedia: {availableReviewers.filter(r => r.current_workload < 3).length}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <TrendingUp className="h-4 w-4 text-orange-500" />
                                  <span>Sibuk: {availableReviewers.filter(r => r.current_workload >= 3).length}</span>
                                </div>
                              </div>
                              <div className="text-gray-600">
                                Terpilih: {verifikasiForm.reviewer_ids.length}/2
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Daftar reviewer atau pesan */}
                        {!reviewersLoading && (
                          <>
                            {availableReviewers.length === 0 ? (
                              <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                                <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                                <h4 className="font-medium text-yellow-700 mb-1">Tidak Ada Reviewer Tersedia</h4>
                                <p className="text-yellow-600 text-sm">
                                  Tidak ada reviewer yang terdaftar untuk bidang ilmu
                                  "{proposalInfo?.bidang_ilmu}" atau semua reviewer sedang sibuk.
                                </p>
                              </div>
                            ) : getFilteredReviewers.length === 0 ? (
                              <div className="p-6 bg-orange-50 border border-orange-200 rounded-lg text-center">
                                <AlertCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                                <h4 className="font-medium text-orange-700 mb-1">Semua Reviewer Sedang Sibuk</h4>
                                <p className="text-orange-600 text-sm mb-3">
                                  Semua reviewer untuk bidang ilmu ini sedang memiliki beban kerja tinggi.
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setShowAvailableOnly(false)}
                                  className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded hover:bg-orange-200"
                                >
                                  Tampilkan Semua Reviewer
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                                {getFilteredReviewers
                                  .sort((a, b) => a.current_workload - b.current_workload)
                                  .map((reviewer) => (
                                    <ReviewerCard
                                      key={reviewer.id}
                                      reviewer={reviewer}
                                      isSelected={verifikasiForm.reviewer_ids.includes(reviewer.id)}
                                      onToggle={handleReviewerChange}
                                      disabled={
                                        !verifikasiForm.reviewer_ids.includes(reviewer.id) &&
                                        verifikasiForm.reviewer_ids.length >= 2
                                      }
                                    />
                                  ))}
                              </div>
                            )}

                            {/* Informasi tambahan */}
                            {getFilteredReviewers.length > 0 && (
                              <div className="text-xs text-gray-500 space-y-1">
                                <p>• Reviewer diurutkan berdasarkan beban kerja (paling sedikit dulu)</p>
                                <p>• Indikator hijau menunjukkan reviewer tersedia (beban kerja rendah)</p>
                                <p>• Pilih reviewer dengan beban kerja seimbang untuk hasil review optimal</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {verifikasiForm.status === "Ditolak" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Catatan Penolakan</label>
                        <textarea
                          value={verifikasiForm.catatan}
                          onChange={(e) =>
                            setVerifikasiForm({
                              ...verifikasiForm,
                              catatan: e.target.value,
                            })
                          }
                          rows="3"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                          placeholder="Berikan alasan penolakan..."
                        />
                      </div>
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleCloseVerifikasiModal}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md flex items-center gap-2"
                      >
                        <Delete className="w-5 h-5" />
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className={`px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 flex items-center gap-2 transition-colors ${
                          loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <Save className="w-5 h-5" />
                        {loading ? "Menyimpan..." : "Simpan"}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default PengajuanProposal;