import { useEffect, useState } from "react";
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
import { Users, CheckCircle, XCircle, TrendingUp, LogOut } from "lucide-react";
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
import { API_BASE_URL } from "../config/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    candidate1: 0,
    candidate2: 0,
    totalVoted: 0,
    totalNotVoted: 0,
    facultyStats: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("candidates");
  const [voters, setVoters] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // added
  const navigate = useNavigate();

  useEffect(() => {
    fetchVoters();
  }, []);

  useEffect(()=>{
    const admin_token = localStorage.getItem("admin_token");
    if(!admin_token){
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  const fetchVoters = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/voters` , {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setVoters(data.voters);
      }
    } catch (error) {
      console.error("Failed to fetch voters:", error);
    }
  };

  const filteredVoters = voters.filter((voter) => {
    const matchesSearch =
      voter.nim.toLowerCase().includes(search.toLowerCase()) ||
      voter.name.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "voted" && voter.hasVoted) ||
      (filter === "not-voted" && !voter.hasVoted);

    return matchesSearch && matchesFilter;
  });

  const votedCount = voters.filter((v) => v.hasVoted).length;
  const notVotedCount = voters.length - votedCount;

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    toast.success("Logout berhasil");
    navigate("/admin");
  };

  const candidateData = [
    {
      name: "Kandidat 1",
      value: stats.candidate1,
      color: "hsl(var(--chart-1))",
    },
    {
      name: "Kandidat 2",
      value: stats.candidate2,
      color: "hsl(var(--chart-2))",
    },
  ];

  const participationData = [
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
  ];

  return (
    <div className="min-h-screen bg-secondary">
      <div className="flex">
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleLogout={handleLogout}
          collapsed={sidebarCollapsed} // added
          onToggle={() => setSidebarCollapsed((v) => !v)} // added
        />
        <div className="flex-1 max-w-7xl mx-auto py-8 px-4">
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
                        )
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
                        <Bar dataKey="value" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="shadow-lg pt-5 px-5 pb-3">
                  <CardHeader>
                    <CardTitle>Diagram Lingkaran - Perolehan Suara</CardTitle>
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
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {candidateData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
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
                <Card className="shadow-lg pt-5 px-5 pb-3">
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
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={100}
                          fill="#f7951d"
                          dataKey="value"
                        >
                          {participationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
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
                        >
                          Semua
                        </Button>
                        <Button
                          variant={filter === "voted" ? "default" : "outline"}
                          onClick={() => setFilter("voted")}
                        >
                          Sudah Pilih
                        </Button>
                        <Button
                          variant={
                            filter === "not-voted" ? "default" : "outline"
                          }
                          onClick={() => setFilter("not-voted")}
                        >
                          Belum Pilih
                        </Button>
                      </div>
                    </div>

                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>NIM</TableHead>
                            <TableHead>Nama</TableHead>
                            <TableHead>Fakultas</TableHead>
                            <TableHead>Program Studi</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Waktu Memilih</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredVoters.map((voter) => (
                            <TableRow key={voter.nim}>
                              <TableCell className="font-medium">
                                {voter.nim}
                              </TableCell>
                              <TableCell>{voter.name}</TableCell>
                              <TableCell>{voter.faculty}</TableCell>
                              <TableCell>{voter.program}</TableCell>
                              <TableCell>
                                {voter.hasVoted ? (
                                  <Badge
                                    variant="default"
                                    className="bg-success p-2"
                                  >
                                    Sudah Memilih
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="bg-secondary p-2"
                                  >
                                    Belum Memilih
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>{voter.votedAt || "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {filteredVoters.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        Tidak ada data pemilih yang sesuai dengan filter
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
