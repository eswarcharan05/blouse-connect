import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, Package, TrendingUp, Star, Eye, 
  CheckCircle, XCircle, Clock, DollarSign 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";

export default function Admin() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("30d");

  // Check if user has admin access
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <XCircle className="mx-auto text-red-500 mb-4" size={64} />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access the admin dashboard.
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch admin statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/admin/stats', timeRange],
  });

  const mockStats = {
    totalUsers: 1247,
    totalTailors: 89,
    totalOrders: 356,
    totalRevenue: 428750,
    activeUsers: 892,
    pendingOrders: 23,
    completedOrders: 287,
    averageRating: 4.7,
    recentUsers: [
      { id: '1', name: 'Priya Sharma', email: 'priya@example.com', joinedAt: '2024-03-15', status: 'active' },
      { id: '2', name: 'Rajesh Kumar', email: 'rajesh@example.com', joinedAt: '2024-03-14', status: 'active' },
      { id: '3', name: 'Meera Devi', email: 'meera@example.com', joinedAt: '2024-03-13', status: 'pending' },
    ],
    recentOrders: [
      { id: 'BC123456', customer: 'Anita Reddy', tailor: 'Priya Tailoring', amount: 1800, status: 'in_progress' },
      { id: 'BC123455', customer: 'Sneha Patel', tailor: 'Rajesh Boutique', amount: 2200, status: 'completed' },
      { id: 'BC123454', customer: 'Kavitha Singh', tailor: 'Meera Designs', amount: 1500, status: 'pending' },
    ],
    pendingTailors: [
      { id: 1, name: 'Lakshmi Tailors', owner: 'Lakshmi Devi', experience: 8, applications: '2024-03-10' },
      { id: 2, name: 'Modern Stitching', owner: 'Ravi Kumar', experience: 5, applications: '2024-03-12' },
    ]
  };

  const currentStats = stats || mockStats;

  const StatCard = ({ title, value, icon: Icon, trend, color = "text-gray-600" }: any) => (
    <Card className="cultural-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {trend && (
              <p className="text-xs text-emerald-600 flex items-center mt-1">
                <TrendingUp size={12} className="mr-1" />
                {trend}
              </p>
            )}
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-cream-50 pb-20 lg:pb-0">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 font-serif">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your BlouseConnect platform
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={currentStats.totalUsers.toLocaleString()}
            icon={Users}
            trend="+12% from last month"
            color="text-emerald-600"
          />
          <StatCard
            title="Active Tailors"
            value={currentStats.totalTailors}
            icon={Package}
            trend="+5% from last month"
            color="text-royal-600"
          />
          <StatCard
            title="Total Orders"
            value={currentStats.totalOrders}
            icon={TrendingUp}
            trend="+18% from last month"
            color="text-golden-500"
          />
          <StatCard
            title="Revenue"
            value={`₹${(currentStats.totalRevenue / 1000).toFixed(0)}K`}
            icon={DollarSign}
            trend="+23% from last month"
            color="text-pink-600"
          />
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="tailors">Tailors</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-8 space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="cultural-shadow">
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentStats.recentOrders.map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">#{order.id}</p>
                          <p className="text-sm text-gray-600">{order.customer} → {order.tailor}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-emerald-600">₹{order.amount}</p>
                          <Badge 
                            className={
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Platform Metrics */}
              <Card className="cultural-shadow">
                <CardHeader>
                  <CardTitle>Platform Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Active Users</span>
                      <span className="font-semibold">{currentStats.activeUsers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Pending Orders</span>
                      <span className="font-semibold text-yellow-600">{currentStats.pendingOrders}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Completed Orders</span>
                      <span className="font-semibold text-green-600">{currentStats.completedOrders}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Average Rating</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-golden-400 fill-current" />
                        <span className="font-semibold">{currentStats.averageRating}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="users" className="mt-8">
            <Card className="cultural-shadow">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Joined</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentStats.recentUsers.map((user: any) => (
                        <tr key={user.id} className="border-b">
                          <td className="py-3 px-4 font-medium">{user.name}</td>
                          <td className="py-3 px-4 text-gray-600">{user.email}</td>
                          <td className="py-3 px-4 text-gray-600">{user.joinedAt}</td>
                          <td className="py-3 px-4">
                            <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {user.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Button size="sm" variant="outline">
                              <Eye size={14} className="mr-1" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tailors" className="mt-8">
            <div className="space-y-6">
              {/* Pending Approvals */}
              <Card className="cultural-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2" size={20} />
                    Pending Tailor Approvals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentStats.pendingTailors.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">No pending approvals</p>
                  ) : (
                    <div className="space-y-4">
                      {currentStats.pendingTailors.map((tailor: any) => (
                        <div key={tailor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-semibold text-gray-800">{tailor.name}</h4>
                            <p className="text-sm text-gray-600">Owner: {tailor.owner}</p>
                            <p className="text-sm text-gray-600">{tailor.experience} years experience</p>
                            <p className="text-xs text-gray-500">Applied: {tailor.applications}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                              <CheckCircle size={14} className="mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                              <XCircle size={14} className="mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Active Tailors */}
              <Card className="cultural-shadow">
                <CardHeader>
                  <CardTitle>Active Tailors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-600">
                    <Package size={48} className="mx-auto mb-4 text-gray-400" />
                    <p>Tailor management interface would be here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="orders" className="mt-8">
            <Card className="cultural-shadow">
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-600">
                  <TrendingUp size={48} className="mx-auto mb-4 text-gray-400" />
                  <p>Order management interface would be here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-8">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="cultural-shadow">
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-600">
                    <DollarSign size={48} className="mx-auto mb-4 text-gray-400" />
                    <p>Revenue charts would be displayed here</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="cultural-shadow">
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-600">
                    <Users size={48} className="mx-auto mb-4 text-gray-400" />
                    <p>User growth charts would be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
