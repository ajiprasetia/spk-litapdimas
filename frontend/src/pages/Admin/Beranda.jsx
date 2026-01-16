// src/pages/Admin/Beranda.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { UserServices } from "../../services/Admin/UserServices";
import { KlasterServices } from "../../services/Admin/KlasterServices";
import { KriteriaServices } from "../../services/Admin/KriteriaServices";
import { ProposalServices } from "../../services/Shared/ProposalServices";
import { PenelitiServices } from "../../services/Shared/PenelitiServices";
import { ReviewerServices } from "../../services/Shared/ReviewerServices";
import {
  Users,
  LayoutList,
  Blinds,
  FileText,
  PieChart,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  UserCheck,
  User
} from "lucide-react";
import {
  PieChart as RechartsProPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#10B981", "#4F46E5", "#F59E0B", "#EF4444", "#8B5CF6"];
const STATUS_COLORS = {
  "Belum Diperiksa": "#64748B",
  Ditolak: "#EF4444",
  "Tahap Review": "#4F46E5",
  "Dalam Evaluasi Akhir": "#F59E0B",
  "Lolos Pendanaan": "#10B981",
  "Tidak Lolos Pendanaan": "#E11D48",
};

const Beranda = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    users: {
      total: 0,
      peneliti: 0,
      reviewer: 0,
    },
    klaster: 0,
    kriteria: 0,
    proposal: {
      total: 0,
      byStatus: [],
    },
    recentProposals: [],
    pendingReviews: 0,
    pendingApprovals: {
      peneliti: 0,
      reviewer: 0,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [
          users,
          klasterData,
          kriteriaData,
          proposalData,
          penelitiPengajuan,
          reviewerPengajuan,
        ] = await Promise.all([
          UserServices.getAllUsers(),
          KlasterServices.getAllKlaster(),
          KriteriaServices.getAllKriteria(),
          ProposalServices.getAllProposalAdmin(),
          PenelitiServices.getAllPengajuan(),
          ReviewerServices.getAllPengajuan(),
        ]);

        // Process user data
        const penelitiCount = users.filter(
          (user) => user.status_peneliti === "Terdaftar"
        ).length;
        const reviewerCount = users.filter(
          (user) => user.status_reviewer === "Terdaftar"
        ).length;

        // Process proposal data
        const statusCounts = {};
        proposalData.forEach((proposal) => {
          statusCounts[proposal.status] =
            (statusCounts[proposal.status] || 0) + 1;
        });

        const proposalByStatus = Object.entries(statusCounts).map(
          ([name, value]) => ({
            name,
            value,
          })
        );

        // Calculate pending approvals
        const pendingPenelitiCount = penelitiPengajuan.filter(
          (p) => p.status_peneliti === "Menunggu Persetujuan"
        ).length;

        const pendingReviewerCount = reviewerPengajuan.filter(
          (r) => r.status_reviewer === "Menunggu Persetujuan"
        ).length;

        // Get recent proposals (last 6)
        const recentProposals = [...proposalData]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 6);

        // Update state
        setStats({
          users: {
            total: users.length,
            peneliti: penelitiCount,
            reviewer: reviewerCount,
          },
          klaster: klasterData.length,
          kriteria: kriteriaData.length,
          proposal: {
            total: proposalData.length,
            byStatus: proposalByStatus,
          },
          recentProposals,
          pendingReviews: proposalData.filter(
            (p) => p.status === "Tahap Review"
          ).length,
          pendingApprovals: {
            peneliti: pendingPenelitiCount,
            reviewer: pendingReviewerCount,
          },
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Gagal memuat data dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Belum Diperiksa":
        return <Clock size={20} className="text-gray-600" />;
      case "Ditolak":
        return <XCircle size={20} className="text-red-600" />;
      case "Tahap Review":
        return <AlertCircle size={20} className="text-indigo-600" />;
      case "Dalam Evaluasi Akhir":
        return <Clock size={20} className="text-amber-600" />;
      case "Lolos Pendanaan":
        return <CheckCircle2 size={20} className="text-emerald-600" />;
      case "Tidak Lolos Pendanaan":
        return <XCircle size={20} className="text-rose-600" />;
      default:
        return <Clock size={20} className="text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-10 flex justify-center items-center h-80">
        <div className="text-green-600 animate-pulse flex flex-col items-center">
          <Sparkles className="h-12 w-12 mb-3" />
          <span className="text-lg font-medium">Memuat data dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-10">
        <div className="text-rose-500 flex items-center gap-3 text-lg">
          <AlertCircle size={24} />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-green-500 to-green-600 h-14 w-14 rounded-full flex items-center justify-center shadow-md">
              <User className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Selamat Datang, Admin {user?.nama}
              </h2>
              <p className="text-gray-600 mt-1">
                Ringkasan aktivitas dan statistik sistem pendanaan penelitian
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* User Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:trangray-y-[-5px] group relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="text-white" size={100} />
            </div>
            <div className="flex flex-col mb-3">
              <Users className="text-white mb-3" size={30} />
              <h4 className="font-medium text-indigo-100 text-lg">Total Users</h4>
            </div>
            <p className="text-3xl font-bold text-white mb-3">
              {stats.users.total}
            </p>
            <div className="mt-2 text-sm bg-white/20 backdrop-blur-sm p-3 rounded-lg text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <UserCheck size={16} className="mr-2" />
                  <span>{stats.users.peneliti} Peneliti</span>
                </div>
                <div className="flex items-center">
                  <UserCheck size={16} className="mr-2" />
                  <span>{stats.users.reviewer} Reviewer</span>
                </div>
              </div>
            </div>
          </div>

          {/* Proposal Card */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:trangray-y-[-5px] group relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 group-hover:opacity-20 transition-opacity">
              <FileText className="text-white" size={100} />
            </div>
            <div className="flex flex-col mb-3">
              <FileText className="text-white mb-3" size={30} />
              <h4 className="font-medium text-emerald-100 text-lg">Total Proposal</h4>
            </div>
            <p className="text-3xl font-bold text-white mb-3">
              {stats.proposal.total}
            </p>
            <div className="mt-2 text-sm bg-white/20 backdrop-blur-sm p-3 rounded-lg text-white">
              <div className="flex items-center">
                <span>{stats.proposal.total} Pengajuan Proposal Aktif</span>
              </div>
            </div>
          </div>

          {/* Klaster Card */}
          <div className="bg-gradient-to-br from-violet-500 to-violet-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:trangray-y-[-5px] group relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 group-hover:opacity-20 transition-opacity">
              <Blinds className="text-white" size={100} />
            </div>
            <div className="flex flex-col mb-3">
              <Blinds className="text-white mb-3" size={30} />
              <h4 className="font-medium text-violet-100 text-lg">Total Klaster</h4>
            </div>
            <p className="text-3xl font-bold text-white mb-3">
              {stats.klaster}
            </p>
            <div className="mt-2 text-sm bg-white/20 backdrop-blur-sm p-3 rounded-lg text-white">
              <div className="flex items-center">
                <span>{stats.klaster} Klaster Penelitian Tersedia</span>
              </div>
            </div>
          </div>

          {/* Kriteria Card */}
          <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:trangray-y-[-5px] group relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 group-hover:opacity-20 transition-opacity">
              <LayoutList className="text-white" size={100} />
            </div>
            <div className="flex flex-col mb-3">
              <LayoutList className="text-white mb-3" size={30} />
              <h4 className="font-medium text-rose-100 text-lg">Total Kriteria</h4>
            </div>
            <p className="text-3xl font-bold text-white mb-3">
              {stats.kriteria}
            </p>
            <div className="mt-2 text-sm bg-white/20 backdrop-blur-sm p-3 rounded-lg text-white">
              <div className="flex items-center">
                <span>{stats.kriteria} Kriteria Penilaian Digunakan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Approvals Alert */}
        {(stats.pendingApprovals.peneliti > 0 ||
          stats.pendingApprovals.reviewer > 0) && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-5 rounded-xl shadow-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-amber-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-base font-semibold text-amber-800">
                  Pemberitahuan Penting!
                </h3>
                <div className="mt-2 text-amber-700">
                  <p className="font-medium">
                    Terdapat{" "}
                    <span className="text-amber-800 font-bold">
                      {stats.pendingApprovals.peneliti +
                        stats.pendingApprovals.reviewer}
                    </span>{" "}
                    pengajuan yang menunggu persetujuan:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    {stats.pendingApprovals.peneliti > 0 && (
                      <li>
                        <span className="font-semibold text-amber-800">
                          {stats.pendingApprovals.peneliti}
                        </span>{" "}
                        pengajuan peneliti
                      </li>
                    )}
                    {stats.pendingApprovals.reviewer > 0 && (
                      <li>
                        <span className="font-semibold text-amber-800">
                          {stats.pendingApprovals.reviewer}
                        </span>{" "}
                        pengajuan reviewer
                      </li>
                    )}
                  </ul>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      navigate("/admin/manajemen-users");
                      // Reload halaman untuk menandai menu aktif
                      window.location.href = "/admin/manajemen-users";
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-300"
                  >
                    Lihat Pengajuan
                    <ArrowRight size={16} className="ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Proposals */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <FileText className="text-green-500 mr-2" size={24} />
            Proposal Terbaru
          </h3>
          <button
            onClick={() => {
              navigate("/admin/proposal");
              // Reload halaman untuk menandai menu aktif
              window.location.href = "/admin/proposal";
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300"
          >
            Lihat Semua
            <ArrowRight size={16} className="ml-2" />
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider w-[40%]">
                  Judul
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Peneliti
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Tanggal Pengajuan
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider w-[10%]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentProposals.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <FileText className="h-12 w-12 text-gray-300 mb-3" />
                      <span className="font-medium">Belum ada proposal</span>
                    </div>
                  </td>
                </tr>
              ) : (
                stats.recentProposals.map((proposal) => (
                  <tr 
                    key={proposal.id} 
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {proposal.judul}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {proposal.nama_klaster}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {proposal.nama_user}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(proposal.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(proposal.status)}
                        <span
                          className="ml-2 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                          style={{
                            backgroundColor: `${
                              STATUS_COLORS[proposal.status]
                            }15`,
                            color: STATUS_COLORS[proposal.status],
                          }}
                        >
                          {proposal.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts and Statistics */}
      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-lg">
        <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <PieChart className="text-green-500 mr-2" size={24} />
          Statistik Proposal
        </h4>
        <div className="h-80 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsProPieChart>
              <Pie
                data={stats.proposal.byStatus}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={120}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {stats.proposal.byStatus.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]
                    }
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value} proposal`, "Jumlah"]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  padding: "10px 14px"
                }}
                itemStyle={{ fontWeight: 500 }}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ paddingTop: "20px" }}
              />
            </RechartsProPieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Beranda;