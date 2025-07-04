import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { MapPin, Search, Filter, Grid, List, Crosshair } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/lib/i18n";
import TailorCard from "@/components/tailor-card";
import Map from "@/components/map";
import type { TailorWithUser } from "@shared/schema";

export default function Tailors() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMap, setShowMap] = useState(false);
  const [filters, setFilters] = useState({
    specialization: "",
    priceRange: [800, 5000],
    rating: 0,
    experience: 0,
  });
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
          setUserLocation({ lat: 17.3850, lng: 78.4867 });
        }
      );
    } else {
      setUserLocation({ lat: 17.3850, lng: 78.4867 });
    }
  }, []);

  // Fetch tailors based on location or search
  const { data: tailors = [], isLoading } = useQuery({
    queryKey: userLocation && !searchQuery 
      ? ['/api/tailors/nearby', userLocation.lat, userLocation.lng, 50]
      : ['/api/tailors/search', searchQuery],
    enabled: !!userLocation || !!searchQuery,
  });

  const specializations = [
    "Silk Blouses", "Embroidery", "Designer Cuts", "Traditional Designs",
    "Contemporary Styles", "Beadwork", "Mirror Work", "Heavy Work"
  ];

  const filteredTailors = tailors.filter((tailor: TailorWithUser) => {
    const priceRange = JSON.parse(tailor.priceRange || '{"min": 800, "max": 5000}');
    const matchesSpecialization = !filters.specialization || 
      tailor.specializations?.includes(filters.specialization);
    const matchesPrice = priceRange.min >= filters.priceRange[0] && 
      priceRange.max <= filters.priceRange[1];
    const matchesRating = parseFloat(tailor.averageRating || '0') >= filters.rating;
    const matchesExperience = (tailor.experience || 0) >= filters.experience;

    return matchesSpecialization && matchesPrice && matchesRating && matchesExperience;
  });

  const handleLocationDetect = () => {
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
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 pb-20 lg:pb-0">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 font-serif">
                Find Expert Tailors
              </h1>
              <p className="text-gray-600 mt-1">
                Discover skilled artisans for your perfect blouse
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative flex-1 lg:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search by name, location, or specialization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLocationDetect}
                className="flex-shrink-0"
              >
                <Crosshair size={16} className="mr-1" />
                Near Me
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="cultural-shadow sticky top-20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                  <Filter size={20} className="text-gray-400" />
                </div>

                <div className="space-y-6">
                  {/* Specialization Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization
                    </label>
                    <Select value={filters.specialization} onValueChange={(value) => 
                      setFilters(prev => ({ ...prev, specialization: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="All specializations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All specializations</SelectItem>
                        {specializations.map(spec => (
                          <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range (₹)
                    </label>
                    <div className="px-2">
                      <Slider
                        value={filters.priceRange}
                        onValueChange={(value) => 
                          setFilters(prev => ({ ...prev, priceRange: value }))
                        }
                        max={10000}
                        min={500}
                        step={100}
                        className="mb-2"
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>₹{filters.priceRange[0]}</span>
                        <span>₹{filters.priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Rating
                    </label>
                    <Select value={filters.rating.toString()} onValueChange={(value) => 
                      setFilters(prev => ({ ...prev, rating: parseInt(value) }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Any rating</SelectItem>
                        <SelectItem value="3">3+ stars</SelectItem>
                        <SelectItem value="4">4+ stars</SelectItem>
                        <SelectItem value="4.5">4.5+ stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Experience Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Experience (years)
                    </label>
                    <Select value={filters.experience.toString()} onValueChange={(value) => 
                      setFilters(prev => ({ ...prev, experience: parseInt(value) }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Any experience</SelectItem>
                        <SelectItem value="2">2+ years</SelectItem>
                        <SelectItem value="5">5+ years</SelectItem>
                        <SelectItem value="10">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setFilters({
                      specialization: "",
                      priceRange: [800, 5000],
                      rating: 0,
                      experience: 0,
                    })}
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3">
            {/* View Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {filteredTailors.length} tailors found
                </span>
                {userLocation && (
                  <Badge variant="secondary" className="text-xs">
                    <MapPin size={12} className="mr-1" />
                    Within 50km
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={showMap ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowMap(!showMap)}
                  className={showMap ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                >
                  <MapPin size={16} className="mr-1" />
                  Map
                </Button>
                <div className="flex border rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-none"
                  >
                    <Grid size={16} />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-none"
                  >
                    <List size={16} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Map View */}
            {showMap && (
              <Card className="mb-6 cultural-shadow">
                <CardContent className="p-6">
                  <Map 
                    tailors={filteredTailors} 
                    center={userLocation || undefined}
                  />
                </CardContent>
              </Card>
            )}

            {/* Tailors Grid/List */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">{t('common.loading')}</p>
              </div>
            ) : filteredTailors.length === 0 ? (
              <Card className="cultural-shadow">
                <CardContent className="p-12 text-center">
                  <Search className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No tailors found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters or search in a different area
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => setFilters({
                      specialization: "",
                      priceRange: [800, 5000],
                      rating: 0,
                      experience: 0,
                    })}
                  >
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid md:grid-cols-2 gap-6" 
                : "space-y-4"
              }>
                {filteredTailors.map((tailor: TailorWithUser) => (
                  <TailorCard 
                    key={tailor.id} 
                    tailor={tailor}
                    compact={viewMode === 'list'}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
