import { useState } from "react";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, MapPin, Phone, MessageCircle, Calendar, 
  Award, Clock, Heart, Share2, Camera, ChevronLeft 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/lib/i18n";
import { Link } from "wouter";
import type { TailorWithUser, ReviewWithDetails } from "@shared/schema";

export default function TailorProfile() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: tailor, isLoading } = useQuery<TailorWithUser>({
    queryKey: [`/api/tailors/${id}`],
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery<ReviewWithDetails[]>({
    queryKey: [`/api/tailors/${id}/reviews`],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!tailor) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Tailor not found</h2>
            <p className="text-gray-600 mb-4">The tailor you're looking for doesn't exist.</p>
            <Link href="/tailors">
              <Button variant="outline">Back to Tailors</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-golden-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const priceRange = JSON.parse(tailor.priceRange || '{"min": 800, "max": 5000}');

  return (
    <div className="min-h-screen bg-cream-50 pb-20 lg:pb-0">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/tailors">
              <Button variant="ghost" size="sm">
                <ChevronLeft size={20} className="mr-1" />
                Back to Tailors
              </Button>
            </Link>
            <div className="flex items-center space-x-2 ml-auto">
              <Button variant="outline" size="sm">
                <Heart size={16} className="mr-1" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Share2 size={16} className="mr-1" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card className="cultural-shadow">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row md:items-start space-y-6 md:space-y-0 md:space-x-6">
                  <div className="text-center md:text-left">
                    <Avatar className="w-32 h-32 mx-auto md:mx-0 border-4 border-golden-400 shadow-lg">
                      <AvatarImage src={tailor.user.profileImageUrl || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-royal-600 text-white text-2xl">
                        {tailor.businessName[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-800 font-serif mb-2">
                          {tailor.businessName}
                        </h1>
                        <p className="text-lg text-gray-600">
                          Master Tailor • {tailor.experience} years experience
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <MapPin className="text-emerald-600" size={16} />
                          <span className="text-gray-600">
                            {tailor.user.city}, {tailor.user.state}
                          </span>
                        </div>
                      </div>
                      {tailor.isVerified && (
                        <Badge className="bg-emerald-600">
                          <Award size={12} className="mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center space-x-1">
                        <div className="flex">
                          {renderStars(parseFloat(tailor.averageRating || '0'))}
                        </div>
                        <span className="text-lg font-semibold text-gray-800 ml-2">
                          {tailor.averageRating}
                        </span>
                        <span className="text-gray-600">
                          ({tailor.totalReviews} {t('common.reviews')})
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">
                      {tailor.bio || 'Experienced tailor specializing in traditional and modern designs with attention to detail and quality craftsmanship.'}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {tailor.specializations?.map((spec, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="text-emerald-600" size={16} />
                        <span>Delivery: 5-7 days</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="text-emerald-600" size={16} />
                        <span>Serves {tailor.deliveryRadius}km radius</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="portfolio" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
              </TabsList>
              
              <TabsContent value="portfolio" className="space-y-6">
                <Card className="cultural-shadow">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">My Work</h3>
                    {tailor.portfolioImages && tailor.portfolioImages.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {tailor.portfolioImages.map((image, index) => (
                          <div 
                            key={index}
                            className="relative group cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                            onClick={() => setSelectedImage(image)}
                          >
                            <img 
                              src={image}
                              alt={`Portfolio ${index + 1}`}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                              <Camera className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Camera className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-600">No portfolio images available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews" className="space-y-4">
                {reviews.length === 0 ? (
                  <Card className="cultural-shadow">
                    <CardContent className="p-8 text-center">
                      <Star className="mx-auto text-gray-400 mb-4" size={48} />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">No reviews yet</h3>
                      <p className="text-gray-600">Be the first to leave a review!</p>
                    </CardContent>
                  </Card>
                ) : (
                  reviews.map((review) => (
                    <Card key={review.id} className="cultural-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={review.customer.profileImageUrl || ''} />
                              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-royal-600 text-white">
                                {review.customer.firstName?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h5 className="font-semibold text-gray-800">
                                {review.customer.firstName} {review.customer.lastName}
                              </h5>
                              <div className="flex items-center space-x-1">
                                <div className="flex">
                                  {renderStars(review.rating)}
                                </div>
                              </div>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                        {review.images && review.images.length > 0 && (
                          <div className="flex space-x-2 mt-4">
                            {review.images.map((image, index) => (
                              <img 
                                key={index}
                                src={image}
                                alt={`Review ${index + 1}`}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="about">
                <Card className="cultural-shadow">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">About</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Experience</h4>
                        <p className="text-gray-600">
                          {tailor.experience} years of professional tailoring experience
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Specializations</h4>
                        <div className="flex flex-wrap gap-2">
                          {tailor.specializations?.map((spec, index) => (
                            <Badge key={index} variant="outline">{spec}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Working Hours</h4>
                        <p className="text-gray-600">Monday - Saturday: 9:00 AM - 7:00 PM</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Service Area</h4>
                        <p className="text-gray-600">
                          Pickup and delivery within {tailor.deliveryRadius}km radius
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <Card className="cultural-shadow">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Pricing</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Simple Blouse</span>
                    <span className="font-medium">₹{priceRange.min} - ₹{Math.round(priceRange.min * 1.5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Designer Blouse</span>
                    <span className="font-medium">₹{Math.round(priceRange.min * 1.5)} - ₹{Math.round(priceRange.max * 0.8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Heavy Embroidery</span>
                    <span className="font-medium">₹{Math.round(priceRange.max * 0.8)} - ₹{priceRange.max}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Actions */}
            <Card className="cultural-shadow">
              <CardContent className="p-6 space-y-4">
                <Link href={`/booking/${tailor.id}`}>
                  <Button className="w-full bg-gradient-to-r from-emerald-600 to-royal-600 hover:from-emerald-700 hover:to-royal-700">
                    <Calendar size={20} className="mr-2" />
                    Book Now
                  </Button>
                </Link>
                
                <Button variant="outline" className="w-full">
                  <Phone size={20} className="mr-2" />
                  Call Now
                </Button>
                
                <Button variant="outline" className="w-full">
                  <MessageCircle size={20} className="mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="cultural-shadow">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Location</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>{tailor.user.address}</p>
                  <p>{tailor.user.city}, {tailor.user.state} {tailor.user.pincode}</p>
                </div>
                <div className="mt-4 h-32 bg-gradient-to-br from-emerald-100 to-royal-100 rounded-lg flex items-center justify-center">
                  <MapPin className="text-emerald-600" size={32} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={selectedImage}
              alt="Portfolio"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
