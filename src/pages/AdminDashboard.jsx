import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  LogOut,
  Power,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Search } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { resultsService, authService, adminService } from "../api/services";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    candidate1: 0,
    candidate2: 0,
    totalVoted: 0,
    totalNotVoted: 0,
    facultyStats: [],
    kandidatData: [], // Store full kandidat data from backend
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("candidates");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [voters, setVoters] = useState([]);
  const [votersLoading, setVotersLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 50,
    total: 0,
    total_pages: 0,
  });
  const [shouldResetPage, setShouldResetPage] = useState(false);
  const [votingStatus, setVotingStatus] = useState(false);
  const [votingStatusLoading, setVotingStatusLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch voters - single source of truth
  useEffect(() => {
    if (activeTab !== "voters") return;

    // If search or filter changed, reset to page 1 first
    if (shouldResetPage) {
      setPagination((prev) => ({ ...prev, current_page: 1 }));
      setShouldResetPage(false);
      return; // Don't fetch yet, wait for pagination state to update
    }

    fetchVoters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, pagination.current_page, shouldResetPage]);

  // Detect search/filter changes
  useEffect(() => {
    if (activeTab === "voters") {
      setShouldResetPage(true);
    }
  }, [search, filter, activeTab]);

  useEffect(() => {
    const admin_token = localStorage.getItem("admin_token");
    if (!admin_token) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  const fetchVoters = async () => {
    setVotersLoading(true);
    try {
      const response = await adminService.getVoters(
        search,
        filter,
        pagination.current_page,
        pagination.per_page
      );

      if (response.status === "success") {
        setVoters(response.data || []);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (error) {
      console.error("Failed to fetch voters:", error);
      toast.error("Gagal memuat data pemilih");
    } finally {
      setVotersLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, current_page: newPage }));
  };

  // Since backend provides voter list, we can now filter it
  const filteredVoters = voters;

  useEffect(() => {
    fetchStats();
    fetchVotingStatus();
    const interval = setInterval(() => {
      fetchStats();
      fetchVotingStatus();
    }, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await resultsService.getSummary();

      if (response.status === "success") {
        // Transform backend response to match frontend structure
        const kandidatData = response.data || [];

        // Fetch all voters to calculate faculty stats
        const votersResponse = await adminService.getVoters("", "all", 1, 5000);
        let facultyStats = [];

        if (votersResponse.status === "success" && votersResponse.data) {
          // Group by fakultas
          const fakultasMap = {};
          votersResponse.data.forEach((voter) => {
            if (!fakultasMap[voter.fakultas]) {
              fakultasMap[voter.fakultas] = { voted: 0, notVoted: 0 };
            }
            if (voter.sudah_memilih) {
              fakultasMap[voter.fakultas].voted++;
            } else {
              fakultasMap[voter.fakultas].notVoted++;
            }
          });

          // Convert to array for chart
          facultyStats = Object.keys(fakultasMap).map((fakultas) => ({
            name: fakultas,
            voted: fakultasMap[fakultas].voted,
            notVoted: fakultasMap[fakultas].notVoted,
          }));
        }

        const transformedStats = {
          candidate1:
            kandidatData.find((k) => k.nomor_urut === 1)?.total_suara || 0,
          candidate2:
            kandidatData.find((k) => k.nomor_urut === 2)?.total_suara || 0,
          totalVoted: response.total_pemilih_sudah_memilih || 0,
          totalNotVoted:
            (response.total_pemilih || 0) -
            (response.total_pemilih_sudah_memilih || 0),
          facultyStats: facultyStats,
          kandidatData: kandidatData, // Store full kandidat data
        };
        setStats(transformedStats);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      toast.error("Gagal memuat statistik");
    } finally {
      setLoading(false);
    }
  };

  const fetchVotingStatus = async () => {
    try {
      const response = await adminService.getVotingStatus();
      if (response.status === "success") {
        setVotingStatus(response.data?.is_open || false);
      }
    } catch (error) {
      console.error("Failed to fetch voting status:", error);
    }
  };

  const handleToggleVoting = async () => {
    setVotingStatusLoading(true);
    try {
      const newStatus = !votingStatus;
      const response = await adminService.toggleVotingStatus(newStatus);
      if (response.status === "success") {
        setVotingStatus(newStatus);
        toast.success(
          newStatus ? "Voting berhasil dibuka" : "Voting berhasil ditutup"
        );
      } else {
        toast.error(response.message || "Gagal mengubah status voting");
      }
    } catch (error) {
      console.error("Failed to toggle voting:", error);
      toast.error("Gagal mengubah status voting");
    } finally {
      setVotingStatusLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success("Logout berhasil");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate("/admin");
    }
  };

  const candidateData = useMemo(
    () => [
      {
        name:
          stats.kandidatData.find((k) => k.nomor_urut === 1)?.nama ||
          "Kandidat 1",
        suara: stats.candidate1,
        color: "hsl(var(--chart-1))",
      },
      {
        name:
          stats.kandidatData.find((k) => k.nomor_urut === 2)?.nama ||
          "Kandidat 2",
        suara: stats.candidate2,
        color: "hsl(var(--chart-2))",
      },
    ],
    [stats.kandidatData, stats.candidate1, stats.candidate2]
  );

  const participationData = useMemo(
    () => [
      {
        name: "Sudah Memilih",
        value: stats.totalVoted,
        color: "hsl(var(--success))",
      },
      {
        name: "Belum Memilih",
        value: stats.totalNotVoted,
        color: "hsl(var(--muted))",
      },
    ],
    [stats.totalVoted, stats.totalNotVoted]
  );

  return (
    <div className="min-h-screen bg-secondary">
      <div className="flex">
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleLogout={handleLogout}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
        />
        <div className="flex-1 max-w-7xl mx-auto py-8 px-4">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Memuat data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Voting Control Toggle */}
              <Card className="shadow-lg mb-6">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Power
                        className={`w-8 h-8 ${
                          votingStatus ? "text-green-500" : "text-red-500"
                        }`}
                      />
                      <div>
                        <h3 className="font-semibold text-lg">Status Voting</h3>
                        <p className="text-sm text-muted-foreground">
                          {votingStatus
                            ? "Voting sedang dibuka"
                            : "Voting sedang ditutup"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleToggleVoting}
                      disabled={votingStatusLoading}
                      className={`relative inline-flex h-12 w-24 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        votingStatus ? "bg-green-500" : "bg-gray-300"
                      } ${
                        votingStatusLoading
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                    >
                      <span
                        className={`inline-block h-10 w-10 transform rounded-full bg-white shadow-lg transition-transform ${
                          votingStatus ? "translate-x-[3.25rem]" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <Card className="shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm p-3 font-medium text-muted-foreground">
                      Jumlah Massa Yang Tercatat
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center p-3 gap-3">
                      <Users className="w-8 h-8 text-primary" />
                      <div className="text-3xl font-bold">
                        {stats.totalVoted + stats.totalNotVoted}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm p-3 font-medium text-muted-foreground">
                      Massa Yg Sudah Memilih
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex p-3 items-center gap-3">
                      <CheckCircle className="w-8 h-8 text-success" />
                      <div className="text-3xl font-bold text-success">
                        {stats.totalVoted}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm p-3 font-medium text-muted-foreground">
                      Massa Yg Belum Memilih
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center p-3 gap-3">
                      <XCircle className="w-8 h-8 text-muted-foreground" />
                      <div className="text-3xl font-bold">
                        {stats.totalNotVoted}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm p-3 font-medium text-muted-foreground">
                      Partisipasi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center p-3 gap-3">
                      <TrendingUp className="w-8 h-8 text-primary" />
                      <div className="text-3xl font-bold">
                        {stats.totalVoted + stats.totalNotVoted > 0
                          ? Math.round(
                              (stats.totalVoted /
                                (stats.totalVoted + stats.totalNotVoted)) *
                                100
                            ).toFixed(1)
                          : 0}
                        %
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
              >
                <TabsContent value="candidates" className="space-y-6">
                  {/* Kandidat Summary Cards */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {stats.kandidatData.map((kandidat) => (
                      <Card key={kandidat.kandidat_id} className="shadow-lg">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center justify-between">
                            <span>Kandidat {kandidat.nomor_urut}</span>
                            <Badge
                              variant="outline"
                              className="text-lg px-3 py-1"
                            >
                              {kandidat.total_suara} suara
                            </Badge>
                          </CardTitle>
                          <CardDescription className="text-base font-semibold text-primary">
                            {kandidat.nama}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground">
                            Persentase:{" "}
                            <span className="font-bold text-primary">
                              {stats.totalVoted > 0
                                ? (
                                    (kandidat.total_suara / stats.totalVoted) *
                                    100
                                  ).toFixed(1)
                                : 0}
                              %
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="shadow-lg pt-5 px-5 pb-3">
                      <CardHeader>
                        <CardTitle>Diagram Batang - Perolehan Suara</CardTitle>
                        <CardDescription>
                          Perbandingan suara antar kandidat
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={candidateData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="suara" fill="hsl(var(--primary))" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card className="shadow-lg pt-5 px-5 pb-3">
                      <CardHeader>
                        <CardTitle>
                          Diagram Lingkaran - Perolehan Suara
                        </CardTitle>
                        <CardDescription>
                          Distribusi suara dalam persentase
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={candidateData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent, value }) => {
                                // Shorten name if too long (show first name only)
                                const shortName = name.split(" ")[0];
                                return `${shortName}: ${value} (${(
                                  percent * 100
                                ).toFixed(0)}%)`;
                              }}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {candidateData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="participation" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="shadow-lg ">
                      <CardHeader>
                        <CardTitle>Data Partisipasi Pemilih</CardTitle>
                        <CardDescription>
                          Perbandingan Pemilih Terlibat dan Tidak Terlibat
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={participationData}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              label={({
                                cx,
                                cy,
                                midAngle,
                                outerRadius,
                                name,
                                percent,
                              }) => {
                                const RADIAN = Math.PI / 180;
                                const radius = outerRadius + 25; // Label di luar chart
                                const x =
                                  cx + radius * Math.cos(-midAngle * RADIAN);
                                const y =
                                  cy + radius * Math.sin(-midAngle * RADIAN);

                                const textColor =
                                  name === "Sudah Memilih"
                                    ? "#22c55e"
                                    : "#1f2937";

                                return (
                                  <text
                                    x={x}
                                    y={y}
                                    fill={textColor}
                                    textAnchor={x > cx ? "start" : "end"}
                                    dominantBaseline="central"
                                    style={{
                                      fontSize: "12px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {`${name}: ${(percent * 100).toFixed(2)}%`}
                                  </text>
                                );
                              }}
                              outerRadius={100}
                              fill="#f7951d"
                              dataKey="value"
                              isAnimationActive={false}
                            >
                              {participationData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card className="shadow-lg pt-5 px-5 pb-3">
                      <CardHeader>
                        <CardTitle>Partisipasi per Fakultas</CardTitle>
                        <CardDescription>
                          Data pemilih berdasarkan fakultas
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={stats.facultyStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar
                              dataKey="voted"
                              fill="hsl(var(--brand-orange))"
                              name="Sudah Memilih"
                            />
                            <Bar
                              dataKey="notVoted"
                              fill="hsl(var(--muted-foreground))"
                              name="Belum Memilih"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="voters" className="space-y-6">
                  <div className="grid grid-cols-1">
                    <Card className="shadow-lg pt-5 px-5 pb-3">
                      <CardHeader className="pb-3">
                        <CardTitle>Daftar Lengkap Data Pemilih</CardTitle>
                        <CardDescription>
                          Filter dan cari data pemilih
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4 pb-3">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              placeholder="Cari NIM atau nama..."
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant={filter === "all" ? "default" : "outline"}
                              onClick={() => setFilter("all")}
                              className={`hover:text-white ${
                                filter === "all"
                                  ? "bg-accent hover:bg-accent"
                                  : ""
                              }`}
                            >
                              Semua
                            </Button>
                            <Button
                              variant={
                                filter === "voted" ? "default" : "outline"
                              }
                              onClick={() => setFilter("voted")}
                              className={`hover:text-white ${
                                filter === "voted"
                                  ? "bg-accent hover:bg-accent"
                                  : ""
                              }`}
                            >
                              Sudah Pilih
                            </Button>
                            <Button
                              variant={
                                filter === "not-voted" ? "default" : "outline"
                              }
                              onClick={() => setFilter("not-voted")}
                              className={`hover:text-white ${
                                filter === "not-voted"
                                  ? "bg-accent hover:bg-accent"
                                  : ""
                              }`}
                            >
                              Belum Pilih
                            </Button>
                          </div>
                        </div>

                        <div className="border rounded-lg">
                          {votersLoading ? (
                            <div className="flex items-center justify-center py-12">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>No</TableHead>
                                  <TableHead>NIM</TableHead>
                                  <TableHead>Nama</TableHead>
                                  <TableHead>Fakultas</TableHead>
                                  <TableHead>Program Studi</TableHead>
                                  <TableHead>Token</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Waktu Memilih</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredVoters.map((voter) => (
                                  <TableRow key={voter.id}>
                                    <TableCell>{voter.id}</TableCell>
                                    <TableCell className="font-medium">
                                      {voter.nim}
                                    </TableCell>
                                    <TableCell>{voter.nama}</TableCell>
                                    <TableCell>{voter.fakultas}</TableCell>
                                    <TableCell>{voter.program_studi}</TableCell>
                                    <TableCell>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(
                                            voter.token
                                          );
                                          toast.success(
                                            "Token berhasil disalin!"
                                          );
                                        }}
                                        className="px-3 py-1.5 rounded-md bg-muted hover:bg-primary hover:text-white font-mono text-sm cursor-pointer transition-all duration-200 active:scale-95"
                                        title="Klik untuk menyalin token"
                                      >
                                        {voter.token}
                                      </button>
                                    </TableCell>
                                    <TableCell>
                                      {voter.sudah_memilih === 1 ? (
                                        <Badge
                                          variant="default"
                                          className="bg-green-500 hover:bg-green-500 p-1 text-center"
                                        >
                                          Sudah Memilih
                                        </Badge>
                                      ) : (
                                        <Badge
                                          variant="secondary"
                                          className="bg-secondary p-1 text-center"
                                        >
                                          Belum Memilih
                                        </Badge>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {voter.waktu_memilih
                                        ? new Date(
                                            voter.waktu_memilih
                                          ).toLocaleString("id-ID")
                                        : "-"}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </div>

                        {!votersLoading && filteredVoters.length === 0 && (
                          <div className="text-center py-12 text-muted-foreground">
                            Tidak ada data pemilih yang sesuai dengan filter
                          </div>
                        )}

                        {/* Pagination Controls */}
                        {!votersLoading && filteredVoters.length > 0 && (
                          <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <div className="text-sm text-muted-foreground">
                              Menampilkan {pagination.from} - {pagination.to}{" "}
                              dari {pagination.total} data
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handlePageChange(pagination.current_page - 1)
                                }
                                disabled={pagination.current_page === 1}
                                className="hover:text-white"
                              >
                                Sebelumnya
                              </Button>

                              <div className="flex items-center gap-1">
                                {/* Show first page */}
                                {pagination.current_page > 3 && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handlePageChange(1)}
                                      className="hover:text-white"
                                    >
                                      1
                                    </Button>
                                    {pagination.current_page > 4 && (
                                      <span className="px-2">...</span>
                                    )}
                                  </>
                                )}

                                {/* Show nearby pages */}
                                {Array.from({ length: 5 }, (_, i) => {
                                  const page = pagination.current_page - 2 + i;
                                  if (
                                    page > 0 &&
                                    page <= pagination.total_pages
                                  ) {
                                    return (
                                      <Button
                                        key={page}
                                        variant={
                                          page === pagination.current_page
                                            ? "default"
                                            : "outline"
                                        }
                                        size="sm"
                                        onClick={() => handlePageChange(page)}
                                        className={`hover:text-white ${
                                          page === pagination.current_page
                                            ? "bg-accent hover:bg-accent"
                                            : ""
                                        }`}
                                      >
                                        {page}
                                      </Button>
                                    );
                                  }
                                  return null;
                                })}

                                {/* Show last page */}
                                {pagination.current_page <
                                  pagination.total_pages - 2 && (
                                  <>
                                    {pagination.current_page <
                                      pagination.total_pages - 3 && (
                                      <span className="px-2">...</span>
                                    )}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handlePageChange(pagination.total_pages)
                                      }
                                      className="hover:text-white"
                                    >
                                      {pagination.total_pages}
                                    </Button>
                                  </>
                                )}
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handlePageChange(pagination.current_page + 1)
                                }
                                disabled={
                                  pagination.current_page ===
                                  pagination.total_pages
                                }
                                className="hover:text-white"
                              >
                                Selanjutnya
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
