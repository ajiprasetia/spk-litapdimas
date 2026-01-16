// src/components/Admin/ManajemenUser/DaftarUser.jsx
import React, { useState, useEffect } from "react";
import { UserServices } from "../../../services/Admin/UserServices";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  Eye,
  Trash2,
  FileText,
  Search,
  Delete,
  Clock,
  AlertCircle,
  CheckCircle2,
  User,
  Users,
  CircleUserRound
} from "lucide-react";
import Pagination from "../../Shared/Pagination";

const DaftarUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await UserServices.getAllUsers();
      setUsers(data);
    } catch (error) {
      setError(error.response?.data?.message || "Tidak terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      try {
        setLoading(true);
        await UserServices.deleteUser(userId);
        setSuccess("User berhasil dihapus");
        loadUsers();
      } catch (error) {
        setError("Gagal menghapus user");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewDetail = async (userId) => {
    try {
      setLoadingDetail(true);
      const data = await UserServices.getUserDetail(userId);
      setSelectedUser(data);
      setIsDetailModalOpen(true);
    } catch (error) {
      setError("Gagal memuat detail user");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setTimeout(() => {
      setSelectedUser(null);
      setLoadingDetail(false);
    }, 200);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Terdaftar":
        return "text-green-600 bg-green-100";
      case "Menunggu Persetujuan":
        return "text-yellow-600 bg-yellow-100";
      case "Revisi Pengajuan":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Terdaftar":
        return <CheckCircle2 size={20} className="text-green-600" />;
      case "Menunggu Persetujuan":
        return <Clock size={20} className="text-yellow-600" />;
      case "Revisi Pengajuan":
        return <AlertCircle size={20} className="text-red-600" />;
      default:
        return <FileText size={20} className="text-gray-600" />;
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
        <div className="bg-gradient-to-r from-green-500 to-green-600 h-14 w-14 rounded-full flex items-center justify-center shadow-md">
          <Users className="text-white" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Daftar User</h2>
          <p className="text-gray-600 mt-1">
            Kelola daftar pengguna terdaftar dalam sistem
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
      {/* Search Bar and Loading Indicator */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari user..."
            className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="text-sm text-gray-500">Memuat data...</div>
          ) : (
            <div className="text-sm text-gray-600">
              Total User:{" "}
              <span className="font-medium text-green-600">
                {filteredUsers.length}
              </span>
              {searchTerm && (
                <span>
                  {" "}
                  dari{" "}
                  <span className="font-medium text-green-600">
                    {users.length}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
       <table className="min-w-full divide-y divide-gray-200">
         <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status Peneliti
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status Reviewer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
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
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  {searchTerm
                    ? "Tidak ada hasil pencarian"
                    : "Tidak ada data user"}
                </td>
              </tr>
            ) : (
              getCurrentItems().map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden border border-gray-200">
                        {user.foto_profil ? (
                          <img
                            src={UserServices.getPhotoUrl(user.foto_profil)}
                            alt={user.nama}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gray-100">
                            <User className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.nama}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(user.status_peneliti)}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          user.status_peneliti
                        )}`}
                      >
                        {user.status_peneliti || "Belum Terdaftar"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(user.status_reviewer)}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          user.status_reviewer
                        )}`}
                      >
                        {user.status_reviewer || "Belum Terdaftar"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewDetail(user.id)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      disabled={loading}
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={loading}
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Detail Modal */}
      <Transition appear show={isDetailModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCloseModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    Detail User
                  </Dialog.Title>

                  {loadingDetail ? (
                    <div className="py-4 text-center text-gray-500">
                      Memuat detail user...
                    </div>
                  ) : (
                    selectedUser && (
                      <div className="space-y-6">
                        {/* Profil Section */}
                        <div className="border-b pb-6">
                          <h4 className="text-md font-medium mb-4">Profil</h4>
                          <div className="flex flex-col md:flex-row gap-6 mb-6">
                             {/* Photo */}
                            <div className="flex-shrink-0">
                              <div className="w-40 h-48 rounded-xl overflow-hidden border border-green-100 shadow-md">
                                {selectedUser.user.foto_profil ? (
                                  <img
                                    src={UserServices.getPhotoUrl(
                                      selectedUser.user.foto_profil
                                    )}
                                    alt={selectedUser.user.nama}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                    <CircleUserRound className="w-32 h-32 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Profil */}
                            <div className="flex flex-col gap-4 flex-grow">
                              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <label className="block text-sm font-medium text-gray-700">
                                  Nama:
                                </label>
                                <p className="mt-1 text-lg">
                                  {selectedUser.user.nama}
                                </p>
                              </div>
                              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <label className="block text-sm font-medium text-gray-700">
                                  Email:
                                </label>
                                <p className="mt-1 text-lg">
                                  {selectedUser.user.email}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                              <label className="block text-sm font-medium text-gray-700">
                                Jenis Kelamin:
                              </label>
                              <p className="mt-1">
                                {selectedUser.user.jenis_kelamin || "-"}
                              </p>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                              <label className="block text-sm font-medium text-gray-700">
                                Nomor WhatsApp:
                              </label>
                              <p className="mt-1">
                                {selectedUser.user.nomor_whatsapp || "-"}
                              </p>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm col-span-full">
                              <label className="block text-sm font-medium text-gray-700">
                                Alamat:
                              </label>
                              <p className="mt-1">
                                {selectedUser.user.alamat || "-"}
                              </p>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                              <label className="block text-sm font-medium text-gray-700">
                                Profesi:
                              </label>
                              <p className="mt-1">
                                {selectedUser.user.profesi || "-"}
                              </p>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                              <label className="block text-sm font-medium text-gray-700">
                                Online Profil:
                              </label>
                              <p className="mt-1">
                                {selectedUser.user.online_profil ? (
                                  <a
                                    href={selectedUser.user.online_profil}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    {selectedUser.user.online_profil}
                                  </a>
                                ) : (
                                  "-"
                                )}
                              </p>
                            </div>

                            {selectedUser.user.profesi === "Dosen" && (
                              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <label className="block text-sm font-medium text-gray-700">
                                  NIDN:
                                </label>
                                <p className="mt-1">
                                  {selectedUser.user.nidn || "-"}
                                </p>
                              </div>
                            )}

                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                              <label className="block text-sm font-medium text-gray-700">
                                NIP/NIY:
                              </label>
                              <p className="mt-1">
                                {selectedUser.user.nip_niy || "-"}
                              </p>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                              <label className="block text-sm font-medium text-gray-700">
                                Jabatan Fungsional:
                              </label>
                              <p className="mt-1">
                                {selectedUser.user.jabatan_fungsional || "-"}
                              </p>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                              <label className="block text-sm font-medium text-gray-700">
                                Bidang Ilmu:
                              </label>
                              <p className="mt-1">
                                {selectedUser.user.bidang_ilmu || "-"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Riwayat Pendidikan Section */}
                        <div className="border-b pb-6">
                          <h4 className="text-md font-medium mb-4">
                            Riwayat Pendidikan
                          </h4>
                          <div className="space-y-4">
                            {selectedUser.pendidikan.length === 0 ? (
                              <p className="text-gray-500 text-center">
                                Belum ada riwayat pendidikan
                              </p>
                            ) : (
                              selectedUser.pendidikan.map((item) => (
                                <div
                                  key={item.id}
                                  className="border p-4 rounded-lg"
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h5 className="font-medium">
                                        Jenjang: {item.jenjang}
                                      </h5>
                                      <p className="text-sm text-gray-600">
                                        Program Studi: {item.program_studi}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Perguruan Tinggi:{" "}
                                        {item.perguruan_tinggi}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        Tahun Lulus: {item.tahun_lulus}
                                      </p>
                                    </div>
                                    {item.file_ijazah && (
                                      <button
                                        onClick={() =>
                                          window.open(
                                            UserServices.getFileUrl(
                                              item.file_ijazah,
                                              "ijazah"
                                            ),
                                            "_blank"
                                          )
                                        }
                                        className="flex items-center text-blue-600 hover:text-blue-800"
                                      >
                                        <FileText size={20} className="mr-1" />
                                        Lihat Ijazah
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Berkas Section */}
                        <div className="border-b pb-6">
                          <h4 className="text-md font-medium mb-4">Berkas</h4>
                          <div className="space-y-4">
                            {selectedUser.berkas.length === 0 ? (
                              <p className="text-gray-500 text-center">
                                Belum ada berkas
                              </p>
                            ) : (
                              selectedUser.berkas.map((item) => (
                                <div
                                  key={item.id}
                                  className="border p-4 rounded-lg"
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <h5 className="font-medium">
                                        Nama Berkas: {item.nama_berkas}
                                      </h5>
                                      <p className="text-sm text-gray-500">
                                        Tanggal Upload:{" "}
                                        {new Date(
                                          item.created_at
                                        ).toLocaleDateString("id-ID", {
                                          day: "numeric",
                                          month: "long",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() =>
                                        window.open(
                                          UserServices.getFileUrl(
                                            item.file_berkas,
                                            "berkas"
                                          ),
                                          "_blank"
                                        )
                                      }
                                      className="flex items-center text-blue-600 hover:text-blue-800"
                                    >
                                      <FileText size={20} className="mr-1" />
                                      Lihat Berkas
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Status Section di Modal View */}
                        <div>
                          <h4 className="text-md font-medium mb-4">Status</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Status Peneliti */}
                            <div className="border rounded-lg p-4">
                              <h5 className="font-medium mb-3">
                                Status Peneliti
                              </h5>
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(
                                    selectedUser.user.status_peneliti
                                  )}
                                  <span
                                    className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                                      selectedUser.user.status_peneliti
                                    )}`}
                                  >
                                    {selectedUser.user.status_peneliti ||
                                      "Belum Terdaftar"}
                                  </span>
                                </div>
                                {selectedUser.user.status_peneliti && (
                                  <>
                                    <div className="text-sm">
                                      <span className="text-gray-600">
                                        Tanggal Pengajuan:
                                      </span>
                                      <p className="text-gray-900">
                                        {selectedUser.peneliti
                                          ?.tanggal_pengajuan
                                          ? new Date(
                                              selectedUser.peneliti.tanggal_pengajuan
                                            ).toLocaleDateString("id-ID", {
                                              day: "numeric",
                                              month: "long",
                                              year: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })
                                          : "-"}
                                      </p>
                                    </div>
                                    {selectedUser.peneliti
                                      ?.tanggal_disetujui && (
                                      <div className="text-sm">
                                        <span className="text-gray-600">
                                          Tanggal Disetujui:
                                        </span>
                                        <p className="text-gray-900">
                                          {new Date(
                                            selectedUser.peneliti.tanggal_disetujui
                                          ).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </p>
                                      </div>
                                    )}
                                    {selectedUser.user.status_peneliti ===
                                      "Revisi Pengajuan" &&
                                      selectedUser.peneliti?.catatan_admin && (
                                        <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-md">
                                          <span className="block text-sm font-medium text-red-800 mb-1">
                                            Catatan Admin:
                                          </span>
                                          <p className="text-sm text-red-600">
                                            {
                                              selectedUser.peneliti
                                                .catatan_admin
                                            }
                                          </p>
                                        </div>
                                      )}
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Status Reviewer */}
                            <div className="border rounded-lg p-4">
                              <h5 className="font-medium mb-3">
                                Status Reviewer
                              </h5>
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(
                                    selectedUser.user.status_reviewer
                                  )}
                                  <span
                                    className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                                      selectedUser.user.status_reviewer
                                    )}`}
                                  >
                                    {selectedUser.user.status_reviewer ||
                                      "Belum Terdaftar"}
                                  </span>
                                </div>
                                {selectedUser.user.status_reviewer && (
                                  <>
                                    <div className="text-sm">
                                      <span className="text-gray-600">
                                        Tanggal Pengajuan:
                                      </span>
                                      <p className="text-gray-900">
                                        {selectedUser.reviewer
                                          ?.tanggal_pengajuan
                                          ? new Date(
                                              selectedUser.reviewer.tanggal_pengajuan
                                            ).toLocaleDateString("id-ID", {
                                              day: "numeric",
                                              month: "long",
                                              year: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })
                                          : "-"}
                                      </p>
                                    </div>
                                    {selectedUser.reviewer
                                      ?.tanggal_disetujui && (
                                      <div className="text-sm">
                                        <span className="text-gray-600">
                                          Tanggal Disetujui:
                                        </span>
                                        <p className="text-gray-900">
                                          {new Date(
                                            selectedUser.reviewer.tanggal_disetujui
                                          ).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </p>
                                      </div>
                                    )}
                                    {selectedUser.user.status_reviewer ===
                                      "Revisi Pengajuan" &&
                                      selectedUser.reviewer?.catatan_admin && (
                                        <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-md">
                                          <span className="block text-sm font-medium text-red-800 mb-1">
                                            Catatan Admin:
                                          </span>
                                          <p className="text-sm text-red-600">
                                            {
                                              selectedUser.reviewer
                                                .catatan_admin
                                            }
                                          </p>
                                        </div>
                                      )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )}

                  {/* Modal Footer */}
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md flex items-center gap-2 transition-colors"
                      onClick={handleCloseModal}
                      disabled={loadingDetail}
                    >
                      <Delete className="w-5 h-5" />
                      Tutup
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default DaftarUser;
