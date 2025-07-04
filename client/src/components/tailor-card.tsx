import { Star, MapPin, Phone, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { TailorWithUser } from "@shared/schema";
import { useTranslation } from "@/lib/i18n";
import { Link } from "wouter";

interface TailorCardProps {
  tailor: TailorWithUser;
  distance?: number;
  compact?: boolean;
}

export default function TailorCard({ tailor, distance, compact = false }: TailorCardProps) {
  const { t } = useTranslation();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-golden-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (compact) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={tailor.user.profileImageUrl || ''} />
              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-royal-600 text-white">
                {tailor.businessName[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-800 truncate">{tailor.businessName}</h4>
                {distance && (
                  <span className="text-sm text-gray-500 flex-shrink-0">
                    {distance.toFixed(1)} {t('common.km')}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-1 mt-1">
                <div className="flex">
                  {renderStars(parseFloat(tailor.averageRating || '0'))}
                </div>
                <span className="text-sm text-gray-600">
                  {tailor.averageRating} ({tailor.totalReviews} {t('common.reviews')})
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mt-1 truncate">
                {tailor.specializations?.join(', ') || 'General tailoring'}
              </p>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-medium text-emerald-600">
                  {t('common.from')} ₹{JSON.parse(tailor.priceRange || '{"min": 800}').min}
                </span>
                <Link href={`/tailors/${tailor.id}`}>
                  <Button size="sm" variant="outline" className="text-xs">
                    <Eye size={12} className="mr-1" />
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow group">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={tailor.user.profileImageUrl || ''} />
            <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-royal-600 text-white text-lg">
              {tailor.businessName[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">
                  {tailor.businessName}
                </h3>
                <p className="text-sm text-gray-600">
                  {tailor.experience} years experience
                </p>
              </div>
              {distance && (
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin size={14} className="mr-1" />
                  {distance.toFixed(1)} {t('common.km')}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-1 mt-2">
              <div className="flex">
                {renderStars(parseFloat(tailor.averageRating || '0'))}
              </div>
              <span className="text-sm text-gray-600 ml-2">
                {tailor.averageRating} ({tailor.totalReviews} {t('common.reviews')})
              </span>
            </div>
            
            <p className="text-gray-600 mt-2 line-clamp-2">
              {tailor.bio || 'Experienced tailor specializing in traditional and modern designs.'}
            </p>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {tailor.specializations?.slice(0, 3).map((spec, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {spec}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm">
                <span className="text-gray-600">Starting from </span>
                <span className="font-semibold text-emerald-600">
                  ₹{JSON.parse(tailor.priceRange || '{"min": 800}').min}
                </span>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Phone size={14} className="mr-1" />
                  Contact
                </Button>
                <Link href={`/tailors/${tailor.id}`}>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
