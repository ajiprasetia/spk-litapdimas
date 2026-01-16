// src/pages/User/Beranda.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ProposalServices } from "../../services/Shared/ProposalServices";
import { StatusServices } from "../../services/User/StatusServices";
import {
  FileText,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  CheckSquare,
  ClipboardCheck,
  ChartPie,
  Sparkles,
  User,
  Lightbulb
} from "lucide-react";
import {
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Penggunaan warna yang lebih vibrant
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
    peneliti: {
      status: null,
      proposals: [],
      totalProposals: 0,
      proposalsByStatus: [],
    },
    reviewer: {
      status: null,
      assignments: [],
      totalAssignments: 0,
      pendingReviews: 0,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch statuses first to determine which data to load
        const [penelitiStatus, reviewerStatus] = await Promise.all([
          StatusServices.getPenelitiStatus(),
          StatusServices.getReviewerStatus(),
        ]);

        let proposalData = [];
        let assignmentsData = [];

        // Parallel fetches based on user status
        const fetchPromises = [];

        // If user is a peneliti, fetch proposals
        if (penelitiStatus.status_peneliti === "Terdaftar") {
          fetchPromises.push(
            ProposalServices.getAllProposal().then((data) => {
              proposalData = data;
            })
          );
        }

        // If user is a reviewer, fetch assignments
        if (reviewerStatus.status_reviewer === "Terdaftar") {
          // Assume there's a service to get reviewer assignments
          fetchPromises.push(
            import("../../services/User/PenilaianProposalServices")
              .then((module) =>
                module.PenilaianProposalServices.getDaftarPenugasan()
              )
              .then((data) => {
                assignmentsData = data;
              })
          );
        }

        // Wait for all fetches to complete
        await Promise.all(fetchPromises);

        // Process proposal data
        const statusCounts = {};
        proposalData.forEach((proposal) => {
          statusCounts[proposal.status] =
            (statusCounts[proposal.status] || 0) + 1;
        });

        const proposalsByStatus = Object.entries(statusCounts).map(
          ([name, value]) => ({
            name,
            value,
          })
        );

        // Update state
        setStats({
          peneliti: {
            status: penelitiStatus,
            proposals: proposalData,
            totalProposals: proposalData.length,
            proposalsByStatus,
          },
          reviewer: {
            status: reviewerStatus,
            assignments: assignmentsData,
            totalAssignments: assignmentsData.length,
            pendingReviews: assignmentsData.filter(
              (a) => a.status_penilaian === "Belum Direview"
            ).length,
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

  const isPeneliti = stats.peneliti.status?.status_peneliti === "Terdaftar";
  const isReviewer = stats.reviewer.status?.status_reviewer === "Terdaftar";

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
    <div className="space-y-8">
      {/* Main Info Panel */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 h-14 w-14 rounded-full flex items-center justify-center shadow-md">
              <User className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Selamat Datang, {user?.nama}
              </h2>
              <p className="text-gray-600 mt-1">
                Dashboard overview untuk aktivitas penelitian  Anda
              </p>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isPeneliti && (
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:trangray-y-[-5px] group relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 group-hover:opacity-20 transition-opacity">
                <FileText className="text-white" size={100} />
              </div>
              <div className="flex flex-col mb-3">
                <FileText className="text-white mb-3" size={30} />
                <h4 className="font-medium text-indigo-100 text-lg">Proposal Anda</h4>
              </div>
              <p className="text-3xl font-bold text-white mb-3">
                {stats.peneliti.totalProposals}
              </p>
              <div className="mt-2 text-sm bg-white/20 backdrop-blur-sm p-3 rounded-lg text-white">
                <div className="flex items-center justify-between">
                  <span>Total Proposal Aktif</span>
                  <span className="font-semibold">
                    {stats.peneliti.totalProposals}
                  </span>
                </div>
              </div>
            </div>
          )}

          {isReviewer && (
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:trangray-y-[-5px] group relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 group-hover:opacity-20 transition-opacity">
                <ClipboardCheck className="text-white" size={100} />
              </div>
              <div className="flex flex-col mb-3">
                <ClipboardCheck className="text-white mb-3" size={30} />
                <h4 className="font-medium text-emerald-100 text-lg">Review Anda</h4>
              </div>
              <p className="text-3xl font-bold text-white mb-3">
                {stats.reviewer.totalAssignments}
              </p>
              <div className="mt-2 text-sm bg-white/20 backdrop-blur-sm p-3 rounded-lg text-white">
                <div className="flex items-center justify-between">
                  <span>Menunggu Review</span>
                  <span className="font-semibold">
                    {stats.reviewer.pendingReviews}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Empty status panel for users without peneliti or reviewer status */}
          {!isPeneliti && !isReviewer && (
            <div className="md:col-span-2 bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200 shadow-md">
              <div className="flex items-start gap-4">
                <div className="bg-amber-500 rounded-full h-12 w-12 flex items-center justify-center shrink-0">
                  <Lightbulb className="text-white" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-amber-800 text-lg mb-2">
                    Belum Terdaftar Sebagai Peneliti/Reviewer
                  </h4>
                  <p className="text-amber-700 mb-4">
                    Anda belum terdaftar sebagai peneliti atau reviewer. Untuk
                    mengajukan diri sebagai peneliti atau reviewer, silakan
                    lengkapi profil Anda terlebih dahulu.
                  </p>
                  <button
                    onClick={() => {
                      navigate("/user/profil");
                      window.location.href = "/user/profil";
                    }}
                    className="inline-flex items-center px-4 py-2 rounded-md bg-amber-600 text-white hover:bg-amber-700 transition-colors font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-300"
                  >
                    Lengkapi Profil
                    <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Notifications */}
        {isPeneliti &&
          stats.peneliti.proposals.some(
            (p) => p.status === "Lolos Pendanaan"
          ) && (
            <div className="mt-8 bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-500 p-5 rounded-xl shadow-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-emerald-800">
                    Selamat!
                  </h3>
                  <div className="mt-2 text-emerald-700">
                    <p>Anda memiliki proposal yang lolos pendanaan!</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        navigate("/user/peneliti");
                        window.location.href = "/user/peneliti";
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300"
                    >
                      Lihat Proposal
                      <ArrowRight size={16} className="ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        {isReviewer && stats.reviewer.pendingReviews > 0 && (
          <div className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 border-l-4 border-indigo-500 p-5 rounded-xl shadow-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-indigo-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-indigo-800">
                  Pengingat!
                </h3>
                <div className="mt-2 text-indigo-700">
                  <p>
                    Anda memiliki <span className="font-semibold">{stats.reviewer.pendingReviews}</span> proposal yang
                    belum direview.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      navigate("/user/reviewer");
                      window.location.href = "/user/reviewer";
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
                  >
                    Review Sekarang
                    <ArrowRight size={16} className="ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Proposals */}
      {isPeneliti && stats.peneliti.proposals.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <FileText className="text-green-500 mr-2" size={24} />
              Proposal Anda
            </h3>
            <button
              onClick={() => {
                navigate("/user/peneliti");
                window.location.href = "/user/peneliti";
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300"
            >
              Lihat Semua
              <ArrowRight size={16} className="ml-2" />
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider w-[30%]">
                    Judul
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Klaster
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Tanggal Pengajuan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.peneliti.proposals.slice(0, 5).map((proposal) => (
                  <tr 
                    key={proposal.id} 
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {proposal.judul}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {proposal.nama_klaster}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reviewer */}
      {isReviewer && stats.reviewer.assignments.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <CheckSquare className="text-green-500 mr-2" size={24} />
              Tugas Review
            </h3>
            <button
              onClick={() => {
                navigate("/user/reviewer");
                window.location.href = "/user/reviewer";
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300"
            >
              Lihat Semua
              <ArrowRight size={16} className="ml-2" />
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Judul
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Peneliti
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Klaster
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.reviewer.assignments.slice(0, 5).map((assignment) => (
                  <tr 
                    key={assignment.id} 
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {assignment.judul}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {assignment.nama_peneliti}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {assignment.nama_klaster}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          assignment.status_penilaian === "Sudah Direview"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {assignment.status_penilaian}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Charts and Statistics for Peneliti */}
      {isPeneliti && stats.peneliti.proposalsByStatus.length > 0 && (
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-lg">
          <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <ChartPie className="text-green-500 mr-2" size={24} />
            Statistik Proposal
          </h4>
          <div className="h-80 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.peneliti.proposalsByStatus}
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
                  {stats.peneliti.proposalsByStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        STATUS_COLORS[entry.name] ||
                        COLORS[index % COLORS.length]
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
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Beranda;