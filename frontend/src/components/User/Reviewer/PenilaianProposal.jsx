// src/components/User/Reviewer/PenilaianProposal.jsx
import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { PenilaianProposalServices } from "../../../services/User/PenilaianProposalServices";
import {
  FileText,
  Eye,
  Save,
  Search,
  Clock,
  CheckCircle2,
  CheckSquare,
  Delete,
  ClipboardCheck,
  AlertCircle
} from "lucide-react";

const PenilaianProposal = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPenilaianModalOpen, setIsPenilaianModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [detailPenilaian, setDetailPenilaian] = useState(null);
  const [kriteria, setKriteria] = useState([]);
  const [formPenilaian, setFormPenilaian] = useState({
    nilai: [],
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const data = await PenilaianProposalServices.getDaftarPenugasan();
      setProposals(data);
    } catch (error) {
      setError(error.response?.data?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (proposal) => {
    try {
      const data = await PenilaianProposalServices.getDetailPenilaian(
        proposal.id
      );
      setSelectedProposal(data.proposal);
      setDetailPenilaian(data.penilaian);
      setIsDetailModalOpen(true);
    } catch (error) {
      setError("Gagal memuat detail proposal");
    }
  };

  const handleStartPenilaian = async (proposal) => {
    try {
      const data = await PenilaianProposalServices.getDetailPenilaian(
        proposal.id
      );
      setSelectedProposal(data.proposal);
      setKriteria(data.kriteria);

      // Initialize form dengan kriteria
      const initialNilai = data.kriteria.map((k) => ({
        kriteria_id: k.id,
        nama_kriteria: k.nama_kriteria,
        bobot: k.bobot,
        sub_kriteria_id: null,
        skor: null,
        nilai: 0,
      }));

      setFormPenilaian({
        nilai: initialNilai,
      });

      setIsPenilaianModalOpen(true);
    } catch (error) {
      setError("Gagal memuat form penilaian");
    }
  };

  const handleSkorChange = (kriteriaId, subKriteriaId, skor, bobot) => {
    const updatedNilai = formPenilaian.nilai.map((item) => {
      if (item.kriteria_id === kriteriaId) {
        const nilai = (parseFloat(skor) * parseFloat(bobot)) / 100;
        return {
          ...item,
          sub_kriteria_id: subKriteriaId,
          skor: parseFloat(skor),
          nilai: parseFloat(nilai.toFixed(4)),
        };
      }
      return item;
    });

    setFormPenilaian({
      nilai: updatedNilai,
    });
  };

  const calculateTotalNilai = () => {
    return formPenilaian.nilai
      .reduce((sum, item) => sum + (item.nilai || 0), 0)
      .toFixed(2);
  };

  const handleSubmitPenilaian = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Validate all scores are filled
      const incomplete = formPenilaian.nilai.some((item) => !item.skor);
      if (incomplete) {
        throw new Error("Semua kriteria harus diberi skor");
      }

      await PenilaianProposalServices.submitPenilaian({
        proposal_id: selectedProposal.id,
        penilaian: formPenilaian.nilai,
      });

      setSuccess("Penilaian berhasil disimpan");
      await loadProposals();
      handleClosePenilaianModal();
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setTimeout(() => {
      setSelectedProposal(null);
      setDetailPenilaian(null);
    }, 300);
  };

  const handleClosePenilaianModal = () => {
    setIsPenilaianModalOpen(false);
    setTimeout(() => {
      setSelectedProposal(null);
      setKriteria([]);
      setFormPenilaian({
        nilai: [],
      });
    }, 300);
  };

  const filteredProposals = proposals.filter(
    (proposal) =>
      proposal.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.nama_peneliti.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <ClipboardCheck className="text-white" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Penilaian Proposal
          </h2>
          <p className="text-gray-600 mt-1">
            Review dan nilai proposal penelitian yang ditugaskan
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
      {/* Search Section */}
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Cari proposal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Proposals Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
       <table className="min-w-full divide-y divide-gray-200">
         <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Judul
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Peneliti
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Detail
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  Memuat data...
                </td>
              </tr>
            ) : filteredProposals.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  {searchTerm
                    ? "Tidak ada hasil pencarian"
                    : "Tidak ada proposal"}
                </td>
              </tr>
            ) : (
              filteredProposals.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {item.judul}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.nama_klaster}
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
                    <div className="flex items-center gap-2">
                      {item.status_penilaian === "Sudah Direview" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      )}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item.status_penilaian === "Sudah Direview"
                            ? "text-green-600 bg-green-100"
                            : "text-yellow-600 bg-yellow-100"
                        }`}
                      >
                        {item.status_penilaian}
                      </span>
                    </div>
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
                  <td className="px-6 py-4 whitespace-nowrap text-xm font-medium">
                    {item.status_penilaian === "Belum Direview" ? (
                      <button
                        onClick={() => handleStartPenilaian(item)}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
                      >
                        <CheckSquare size={20} />
                        <span className="text-sm">Review</span>
                      </button>
                    ) : (
                      <span className="text-sm text-green-600">
                        -
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <Transition appear show={isDetailModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={handleCloseDetailModal}
        >
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
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    Detail Proposal
                  </Dialog.Title>

                  {selectedProposal && (
                    <div className="space-y-6">
                      {/* Info Section */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm col-span-full">
                          <h4 className="text-sm font-medium text-gray-700">
                            Peneliti:
                          </h4>
                          <p className="mt-1 font-medium">
                            Nama: {selectedProposal.nama_user}
                          </p>
                          <p className="text-sm text-gray-500">
                            {selectedProposal.peneliti_id_display}
                          </p>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm col-span-full">
                          <h4 className="text-sm font-medium text-gray-700">
                            Judul Proposal:
                          </h4>
                          <p className="mt-1">{selectedProposal.judul}</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm col-span-full">
                          <h4 className="text-sm font-medium text-gray-700">
                            Klaster:
                          </h4>
                          <p className="mt-1">
                            {selectedProposal.nama_klaster}
                          </p>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm col-span-full">
                          <h4 className="text-sm font-medium text-gray-700">
                            Bidang Ilmu:
                          </h4>
                          <p className="mt-1">{selectedProposal.bidang_ilmu}</p>
                        </div>
                      </div>

                      {/* Outline Section */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="text-sm font-medium text-gray-700">
                          Outline/Gambaran Singkat:
                        </h4>
                        <p className="mt-1 text-gray-600">
                          {selectedProposal.outline}
                        </p>
                      </div>

                      {/* Files Section */}
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() =>
                            window.open(
                              PenilaianProposalServices.getProposalFileUrl(
                                selectedProposal.file_proposal
                              ),
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
                              PenilaianProposalServices.getRABFileUrl(
                                selectedProposal.file_rab
                              ),
                              "_blank"
                            )
                          }
                          className="flex items-center gap-2 p-3 text-blue-600 border border-blue-200 hover:text-blue-800 bg-blue-50 rounded-lg"
                        >
                          <FileText size={20} />
                          <span>Lihat RAB</span>
                        </button>
                      </div>

                      {/* Penilaian Section */}
                      {detailPenilaian && (
                        <div className="space-y-4">
                          {/* Tabel Hasil Penilaian */}
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h4 className="font-medium text-green-800 mb-2">
                              Hasil Penilaian
                            </h4>

                            <table className="min-w-full divide-y divide-green-200">
                              <thead>
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-green-700">
                                    Kriteria
                                  </th>
                                  <th className="px-4 py-2 text-center text-xs font-medium text-green-700">
                                    Bobot
                                  </th>
                                  <th className="px-4 py-2 text-center text-xs font-medium text-green-700">
                                    Skor
                                  </th>
                                  <th className="px-4 py-2 text-center text-xs font-medium text-green-700">
                                    Nilai
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-green-200">
                                {detailPenilaian.detail.map((item, index) => (
                                  <tr key={index}>
                                    <td className="px-4 py-2 text-sm text-green-700">
                                       {item.kode_kriteria} - {item.nama_kriteria} 
                                    </td>
                                    <td className="px-4 py-2 text-sm text-center text-green-700">
                                      {item.bobot_kriteria}%
                                    </td>
                                    <td className="px-4 py-2 text-sm text-center text-green-700">
                                      {item.skor}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-center text-green-700">
                                      {item.nilai}
                                    </td>
                                  </tr>
                                ))}
                                <tr className="font-medium">
                                  <td
                                    colSpan="3"
                                    className="px-4 py-2 text-right text-green-700"
                                  >
                                    Total Nilai:
                                  </td>
                                  <td className="px-4 py-2 text-center text-green-700">
                                    {detailPenilaian.total_nilai}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
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

      {/* Penilaian Modal */}
      <Transition appear show={isPenilaianModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={handleClosePenilaianModal}
        >
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
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    Form Penilaian Proposal
                  </Dialog.Title>

                  {selectedProposal && (
                    <form
                      onSubmit={handleSubmitPenilaian}
                      className="space-y-6"
                    >
                      {/* Info Proposal */}
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700">
                          Detail Proposal:
                        </h4>
                        <p className="mt-1 font-medium">
                          Pengusul: {selectedProposal.nama_user}
                        </p>
                        <p className="text-gray-900 mt-1">
                          Judul: {selectedProposal.judul}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Klaster: {selectedProposal.nama_klaster}
                        </p>
                      </div>

                      {/* Penilaian Cards */}
                      <div className="grid gap-6">
                        {kriteria.map((item) => {
                          const formValue = formPenilaian.nilai.find(
                            (val) => val.kriteria_id === item.id
                          );

                          return (
                            <div
                              key={item.id}
                              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {item.kode_kriteria} - {item.nama_kriteria}
                                  </h4>
                                  <p className="text-sm text-blue-600 mt-1">
                                    Bobot: {item.bobot}%
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-gray-900">
                                    Nilai:{" "}
                                    {formValue?.nilai?.toFixed(2) || "0.00"}
                                  </p>
                                </div>
                              </div>

                              {/* Skor Dropdown & Description */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Pilih Skor
                                </label>
                                <div className="space-y-2">
                                  <select
                                    value={formValue?.sub_kriteria_id || ""}
                                    onChange={(e) => {
                                      const subKriteria =
                                        item.sub_kriteria.find(
                                          (sub) =>
                                            sub.id === parseInt(e.target.value)
                                        );
                                      if (subKriteria) {
                                        handleSkorChange(
                                          item.id,
                                          subKriteria.id,
                                          subKriteria.skor,
                                          item.bobot
                                        );
                                      }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    required
                                  >
                                    <option value="">Pilih Skor</option>
                                    {item.sub_kriteria.map((sub) => (
                                      <option key={sub.id} value={sub.id}>
                                        {sub.tipe} (Skor: {sub.skor}) -{" "}
                                        {sub.deskripsi}
                                      </option>
                                    ))}
                                  </select>

                                  {/* Show selected description */}
                                  {formValue?.sub_kriteria_id && (
                                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-green-800">
                                          {
                                            item.sub_kriteria.find(
                                              (sub) =>
                                                sub.id ===
                                                formValue.sub_kriteria_id
                                            )?.tipe
                                          }
                                        </span>
                                        <span className="text-green-800">
                                          Skor: {formValue.skor}
                                        </span>
                                      </div>
                                      <p className="text-sm text-green-700">
                                        {
                                          item.sub_kriteria.find(
                                            (sub) =>
                                              sub.id ===
                                              formValue.sub_kriteria_id
                                          )?.deskripsi
                                        }
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Total Nilai */}
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-green-800">
                            Total Nilai:
                          </h4>
                          <p className="text-2xl font-bold text-green-800">
                            {calculateTotalNilai()}
                          </p>
                        </div>
                      </div>

                      {/* Submit Buttons */}
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={handleClosePenilaianModal}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md flex items-center gap-2 transition-colors"
                        >
                          <Delete className="w-5 h-5" />
                          Batal
                        </button>

                        <button
                          type="submit"
                          disabled={loading}
                          className={`px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md flex items-center gap-2 ${
                            loading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          <Save className="w-5 h-5" />
                          {loading ? "Menyimpan..." : "Submit Penilaian"}
                        </button>
                      </div>
                    </form>
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

export default PenilaianProposal;
