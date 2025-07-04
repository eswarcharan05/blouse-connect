import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import type { TailorWithUser } from "@shared/schema";

interface MapProps {
  tailors: TailorWithUser[];
  center?: { lat: number; lng: number };
  onTailorClick?: (tailor: TailorWithUser) => void;
}

export default function Map({ tailors, center, onTailorClick }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-emerald-100 to-royal-100 rounded-lg flex items-center justify-center">
        <div className="text-center space-y-4">
          <MapPin className="mx-auto text-4xl text-emerald-600" size={48} />
          <p className="text-gray-600">Interactive Map Loading...</p>
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-royal-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-golden-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-emerald-100 to-royal-100 rounded-lg overflow-hidden">
      <div className="absolute inset-4 bg-white rounded-lg shadow-inner">
        <div className="w-full h-full relative">
          {/* Mock Map Interface */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50" ref={mapRef} />
          
          {/* Mock Location Pins */}
          {tailors.slice(0, 5).map((tailor, index) => {
            const positions = [
              { top: '20%', left: '25%' },
              { top: '40%', right: '30%' },
              { bottom: '30%', left: '40%' },
              { top: '60%', right: '20%' },
              { bottom: '20%', left: '60%' },
            ];
            
            const position = positions[index] || positions[0];
            const colors = ['bg-emerald-600', 'bg-royal-600', 'bg-golden-500', 'bg-pink-600', 'bg-purple-600'];
            
            return (
              <button
                key={tailor.id}
                className={`absolute w-6 h-6 ${colors[index % colors.length]} rounded-full border-2 border-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-10`}
                style={position}
                onClick={() => onTailorClick?.(tailor)}
                title={tailor.businessName}
              >
                <MapPin className="text-white" size={12} />
              </button>
            );
          })}
          
          {/* Current Location Indicator */}
          {center && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse" />
              <div className="w-8 h-8 bg-blue-600 bg-opacity-20 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
