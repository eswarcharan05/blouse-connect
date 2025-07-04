import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slice, MapPin, Package, Star, TrendingUp, Calendar, Bell } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import TailorCard from "@/components/tailor-card";
import Map from "@/components/map";
import { Link } from "wouter";

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to Hyderabad coordinates
          setUserLocation({ lat: 17.3850, lng: 78.4867 });
        }
      );
    } else {
      // Fallback to Hyderabad coordinates
      setUserLocation({ lat: 17.3850, lng: 78.4867 });
    }
  }, []);

  // Fetch nearby tailors
  const { data: nearbyTailors = [] } = useQuery({
    queryKey: ['/api/tailors/nearby', userLocation?.lat, userLocation?.lng],
    enabled: !!userLocation,
  });

  // Fetch user orders
  const { data: recentOrders = [] } = useQuery({
    queryKey: ['/api/orders'],
  });

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['/api/notifications'],
  });

  const recentNotifications = notifications.slice(0, 3);

  return (
    <div className="min-h-screen bg-cream-50 pb-20 lg:pb-0">
      {/* Hero Section */}
      <section className="ethnic-gradient py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-5xl font-bold text-gray-800 font-serif mb-4">
              Welcome back, {user?.firstName || 'there'}!
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover skilled tailors, track your orders, and perfect your blouse designs
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="cultural-shadow">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Slice className="text-white" size={20} />
                </div>
                <div className="text-xl font-bold text-gray-800">{nearbyTailors.length}</div>
                <div className="text-sm text-gray-600">Nearby Tailors</div>
              </CardContent>
            </Card>

            <Card className="cultural-shadow">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-royal-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Package className="text-white" size={20} />
                </div>
                <div className="text-xl font-bold text-gray-800">{recentOrders.length}</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </CardContent>
            </Card>

            <Card className="cultural-shadow">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-golden-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Star className="text-white" size={20} />
                </div>
                <div className="text-xl font-bold text-gray-800">4.8</div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </CardContent>
            </Card>

            <Card className="cultural-shadow">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="text-white" size={20} />
                </div>
                <div className="text-xl font-bold text-gray-800">₹2,400</div>
                <div className="text-sm text-gray-600">Avg Spent</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/tailors">
              <Button className="w-full bg-gradient-to-r from-emerald-600 to-royal-600 hover:from-emerald-700 hover:to-royal-700 h-12">
                <MapPin size={20} className="mr-2" />
                Find Tailors
              </Button>
            </Link>
            
            <Link href="/booking">
              <Button variant="outline" className="w-full h-12 border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                <Slice size={20} className="mr-2" />
                Book Now
              </Button>
            </Link>
            
            <Link href="/orders">
              <Button variant="outline" className="w-full h-12 border-royal-600 text-royal-600 hover:bg-royal-50">
                <Package size={20} className="mr-2" />
                Track Orders
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Map Section */}
            <Card className="cultural-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Tailors Near You</h2>
                  <Link href="/tailors">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </div>
                <Map 
                  tailors={nearbyTailors.slice(0, 5)} 
                  center={userLocation || undefined}
                />
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="cultural-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
                  <Link href="/orders">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </div>
                
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600">No orders yet</p>
                    <p className="text-sm text-gray-500 mb-4">Start by booking your first blouse!</p>
                    <Link href="/booking">
                      <Button className="bg-emerald-600 hover:bg-emerald-700">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.slice(0, 3).map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                            <Slice className="text-white" size={16} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">Order #{order.orderNumber}</h4>
                            <p className="text-sm text-gray-600">{order.blouseType}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-800">{order.status}</div>
                          <div className="text-xs text-gray-500">₹{order.estimatedPrice}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Notifications */}
            <Card className="cultural-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                  <Bell size={20} className="text-gray-400" />
                </div>
                
                <div className="space-y-3">
                  {recentNotifications.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No new notifications</p>
                  ) : (
                    recentNotifications.map((notification: any) => (
                      <div key={notification.id} className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-800 text-sm">{notification.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                        <div className="text-xs text-gray-500 mt-2">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Nearby Tailors List */}
            <Card className="cultural-shadow">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Rated Nearby</h3>
                <div className="space-y-3">
                  {nearbyTailors.slice(0, 3).map((tailor: any) => (
                    <TailorCard 
                      key={tailor.id} 
                      tailor={tailor} 
                      compact={true}
                    />
                  ))}
                </div>
                {nearbyTailors.length > 3 && (
                  <Link href="/tailors">
                    <Button variant="outline" className="w-full mt-4">
                      View All Tailors
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Learning Module CTA */}
            <Card className="bg-gradient-to-br from-golden-400 to-golden-500 text-white cultural-shadow">
              <CardContent className="p-6">
                <div className="text-center">
                  <Calendar className="mx-auto mb-3" size={32} />
                  <h3 className="text-lg font-semibold mb-2">Live Workshop This Weekend</h3>
                  <p className="text-sm opacity-90 mb-4">
                    Learn advanced embroidery techniques from expert tailors
                  </p>
                  <Link href="/learning">
                    <Button variant="secondary" className="w-full">
                      Register Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
