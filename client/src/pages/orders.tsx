import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, Clock, CheckCircle, Truck, Home, 
  Phone, MessageCircle, Star, Calendar, MapPin, Eye 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import type { OrderWithDetails } from "@shared/schema";

export default function Orders() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("customer");

  // Fetch customer orders
  const { data: customerOrders = [], isLoading: loadingCustomer } = useQuery<OrderWithDetails[]>({
    queryKey: ['/api/orders'],
  });

  // Fetch tailor orders (if user is a tailor)
  const { data: tailorOrders = [], isLoading: loadingTailor } = useQuery<OrderWithDetails[]>({
    queryKey: ['/api/orders', { type: 'tailor' }],
    enabled: user?.role === 'tailor',
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-500" size={16} />;
      case 'confirmed':
        return <CheckCircle className="text-blue-500" size={16} />;
      case 'picked_up':
        return <Truck className="text-orange-500" size={16} />;
      case 'in_progress':
        return <Package className="text-purple-500" size={16} />;
      case 'quality_check':
        return <Eye className="text-indigo-500" size={16} />;
      case 'ready':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'delivered':
        return <Home className="text-emerald-500" size={16} />;
      case 'cancelled':
        return <Package className="text-red-500" size={16} />;
      default:
        return <Package className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'picked_up':
        return 'bg-orange-100 text-orange-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'quality_check':
        return 'bg-indigo-100 text-indigo-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const OrderCard = ({ order, isCustomer = true }: { order: OrderWithDetails; isCustomer?: boolean }) => (
    <Card className="cultural-shadow hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Order #{order.orderNumber}
            </h3>
            <p className="text-gray-600">{order.blouseType}</p>
            {isCustomer ? (
              <p className="text-sm text-gray-500">Tailor: {order.tailor.businessName}</p>
            ) : (
              <p className="text-sm text-gray-500">
                Customer: {order.customer.firstName} {order.customer.lastName}
              </p>
            )}
          </div>
          <div className="text-right">
            <Badge className={`${getStatusColor(order.status)} mb-2`}>
              {getStatusIcon(order.status)}
              <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
            </Badge>
            <p className="text-lg font-semibold text-emerald-600">
              ₹{order.finalPrice || order.estimatedPrice}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Order Date:</span>
            <span className="font-medium">{formatDate(order.createdAt)}</span>
          </div>
          
          {order.estimatedDelivery && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Est. Delivery:</span>
              <span className="font-medium">{formatDate(order.estimatedDelivery)}</span>
            </div>
          )}

          {order.progress !== undefined && order.progress > 0 && (
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Progress:</span>
                <span className="font-medium">{order.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${order.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 mt-4">
          <Button size="sm" variant="outline" className="flex-1">
            <Eye size={14} className="mr-1" />
            View Details
          </Button>
          
          {isCustomer ? (
            <>
              <Button size="sm" variant="outline">
                <Phone size={14} className="mr-1" />
                Call Tailor
              </Button>
              <Button size="sm" variant="outline">
                <MessageCircle size={14} className="mr-1" />
                Message
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline">
                <Phone size={14} className="mr-1" />
                Call Customer
              </Button>
              {order.status !== 'delivered' && (
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  Update Status
                </Button>
              )}
            </>
          )}
        </div>

        {order.status === 'delivered' && !order.review && isCustomer && (
          <Button size="sm" className="w-full mt-2 bg-golden-500 hover:bg-golden-600">
            <Star size={14} className="mr-1" />
            Leave Review
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const OrderTrackingTimeline = ({ order }: { order: OrderWithDetails }) => {
    const timelineSteps = [
      { status: 'confirmed', label: 'Order Confirmed', icon: CheckCircle },
      { status: 'picked_up', label: 'Material Picked Up', icon: Truck },
      { status: 'in_progress', label: 'Work in Progress', icon: Package },
      { status: 'quality_check', label: 'Quality Check', icon: Eye },
      { status: 'ready', label: 'Ready for Delivery', icon: Package },
      { status: 'delivered', label: 'Delivered', icon: Home },
    ];

    const currentStepIndex = timelineSteps.findIndex(step => step.status === order.status);

    return (
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        <div 
          className="absolute left-6 top-0 w-0.5 bg-emerald-600 transition-all duration-500"
          style={{ height: `${Math.max(0, currentStepIndex) * 80}px` }}
        />
        
        <div className="space-y-6">
          {timelineSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            
            return (
              <div key={step.status} className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 ${
                  isCompleted 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  <step.icon size={20} />
                </div>
                
                <div className="flex-1 pt-2">
                  <h4 className={`font-semibold ${
                    isCompleted ? 'text-gray-800' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </h4>
                  
                  {isCurrent && order.progress !== undefined && (
                    <div className="mt-2 bg-emerald-50 rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-emerald-700">Progress: {order.progress}% Complete</span>
                        {order.estimatedDelivery && (
                          <span className="text-emerald-600 font-medium">
                            Est. completion: {formatDate(order.estimatedDelivery)}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 w-full bg-emerald-200 rounded-full h-2">
                        <div 
                          className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${order.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {isCompleted && step.status !== order.status && (
                    <span className="text-xs text-gray-500">Completed</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-cream-50 pb-20 lg:pb-0">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 font-serif">
                My Orders
              </h1>
              <p className="text-gray-600 mt-1">
                Track your orders and manage your bookings
              </p>
            </div>
            <Link href="/booking">
              <Button className="bg-gradient-to-r from-emerald-600 to-royal-600 hover:from-emerald-700 hover:to-royal-700">
                <Package size={16} className="mr-2" />
                New Order
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="customer">As Customer</TabsTrigger>
            <TabsTrigger value="tailor" disabled={user?.role !== 'tailor'}>
              As Tailor
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="customer" className="mt-6">
            {loadingCustomer ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">{t('common.loading')}</p>
              </div>
            ) : customerOrders.length === 0 ? (
              <Card className="cultural-shadow">
                <CardContent className="p-12 text-center">
                  <Package className="mx-auto text-gray-400 mb-4" size={64} />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start by booking your first blouse with our expert tailors
                  </p>
                  <Link href="/booking">
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Package size={16} className="mr-2" />
                      Book Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-2 gap-6">
                {customerOrders.map((order) => (
                  <OrderCard key={order.id} order={order} isCustomer={true} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="tailor" className="mt-6">
            {loadingTailor ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">{t('common.loading')}</p>
              </div>
            ) : tailorOrders.length === 0 ? (
              <Card className="cultural-shadow">
                <CardContent className="p-12 text-center">
                  <Package className="mx-auto text-gray-400 mb-4" size={64} />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders received</h3>
                  <p className="text-gray-600">
                    Orders from customers will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-2 gap-6">
                {tailorOrders.map((order) => (
                  <OrderCard key={order.id} order={order} isCustomer={false} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Featured Order Tracking */}
        {customerOrders.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 font-serif mb-6">
              Order Tracking
            </h2>
            <Card className="cultural-shadow">
              <CardContent className="p-8">
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <OrderTrackingTimeline order={customerOrders[0]} />
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Order #{customerOrders[0].orderNumber}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium">{customerOrders[0].blouseType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tailor:</span>
                          <span className="font-medium">{customerOrders[0].tailor.businessName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-medium text-emerald-600">
                            ₹{customerOrders[0].finalPrice || customerOrders[0].estimatedPrice}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Button size="sm" variant="outline" className="w-full">
                        <Phone size={14} className="mr-1" />
                        Call Tailor
                      </Button>
                      <Button size="sm" variant="outline" className="w-full">
                        <MessageCircle size={14} className="mr-1" />
                        Send Message
                      </Button>
                      <Button size="sm" variant="outline" className="w-full">
                        <MapPin size={14} className="mr-1" />
                        Support
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
