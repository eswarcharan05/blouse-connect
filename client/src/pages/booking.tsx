import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  CheckCircle, ArrowLeft, ArrowRight, Upload, 
  User, Scissors, CreditCard, Calendar, MapPin 
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import type { TailorWithUser } from "@shared/schema";

interface BookingData {
  tailorId: number;
  blouseType: string;
  fabricType: string;
  sleeveStyle: string;
  neckline: string;
  measurements: {
    bust: number;
    waist: number;
    shoulder: number;
    length: number;
  };
  specialInstructions: string;
  referenceImages: string[];
  pickupAddress: string;
  pickupDate: string;
  deliveryAddress: string;
  estimatedPrice: number;
}

export default function Booking() {
  const { tailorId } = useParams();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [needMeasurementHelp, setNeedMeasurementHelp] = useState(false);
  
  const [bookingData, setBookingData] = useState<Partial<BookingData>>({
    measurements: { bust: 0, waist: 0, shoulder: 0, length: 0 },
    referenceImages: [],
  });

  // Fetch tailor data if tailorId is provided
  const { data: tailor } = useQuery<TailorWithUser>({
    queryKey: [`/api/tailors/${tailorId}`],
    enabled: !!tailorId,
  });

  // Fetch nearby tailors if no specific tailor selected
  const { data: tailors = [] } = useQuery({
    queryKey: ['/api/tailors/nearby', 17.3850, 78.4867, 20],
    enabled: !tailorId,
  });

  useEffect(() => {
    if (tailorId && tailor) {
      setBookingData(prev => ({ 
        ...prev, 
        tailorId: parseInt(tailorId),
        estimatedPrice: JSON.parse(tailor.priceRange || '{"min": 1200}').min,
      }));
    }
  }, [tailorId, tailor]);

  const createOrderMutation = useMutation({
    mutationFn: async (data: Partial<BookingData>) => {
      const response = await apiRequest('POST', '/api/orders', data);
      return response.json();
    },
    onSuccess: (order) => {
      toast({
        title: "Order Created Successfully!",
        description: `Your order #${order.orderNumber} has been placed.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setLocation('/orders');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const steps = [
    { number: 1, title: "Details", icon: Scissors },
    { number: 2, title: "Measurements", icon: User },
    { number: 3, title: "Confirmation", icon: CheckCircle },
  ];

  const blouseTypes = [
    "Simple Blouse", "Designer Blouse", "Heavy Embroidery", "Contemporary Style"
  ];

  const fabricTypes = [
    "Cotton", "Silk", "Chiffon", "Georgette", "I'll provide fabric"
  ];

  const sleeveStyles = [
    "Sleeveless", "Short Sleeves", "3/4 Sleeves", "Full Sleeves"
  ];

  const necklines = [
    "Round Neck", "V-Neck", "Boat Neck", "Square Neck", "Deep Neck"
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!bookingData.tailorId) {
      toast({
        title: "Error",
        description: "Please select a tailor",
        variant: "destructive",
      });
      return;
    }

    createOrderMutation.mutate(bookingData as BookingData);
  };

  const calculateEstimatedPrice = () => {
    if (!tailor) return 0;
    
    const basePrice = JSON.parse(tailor.priceRange || '{"min": 1200}').min;
    let multiplier = 1;
    
    switch (bookingData.blouseType) {
      case "Designer Blouse":
        multiplier = 1.5;
        break;
      case "Heavy Embroidery":
        multiplier = 2.5;
        break;
      case "Contemporary Style":
        multiplier = 1.3;
        break;
      default:
        multiplier = 1;
    }
    
    return Math.round(basePrice * multiplier);
  };

  useEffect(() => {
    const price = calculateEstimatedPrice();
    setBookingData(prev => ({ ...prev, estimatedPrice: price }));
  }, [bookingData.blouseType, tailor]);

  if (!tailorId && tailors.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 pb-20 lg:pb-0">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 font-serif">
                Book Your Blouse
              </h1>
              <p className="text-gray-600 mt-1">
                Simple booking process in just a few steps
              </p>
            </div>
            <Link href="/tailors">
              <Button variant="outline">
                <ArrowLeft size={16} className="mr-1" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step.number 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircle size={20} />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    currentStep >= step.number ? 'text-gray-700' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 ml-4 ${
                    currentStep > step.number ? 'bg-emerald-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="cultural-shadow">
          <CardContent className="p-8">
            {/* Step 1: Blouse Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Blouse Details</h3>
                
                {/* Tailor Selection */}
                {!tailorId && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">Select Tailor</Label>
                    <div className="grid gap-4 max-h-60 overflow-y-auto">
                      {tailors.slice(0, 5).map((tailorOption: TailorWithUser) => (
                        <div 
                          key={tailorOption.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            bookingData.tailorId === tailorOption.id 
                              ? 'border-emerald-600 bg-emerald-50' 
                              : 'border-gray-200 hover:border-emerald-300'
                          }`}
                          onClick={() => setBookingData(prev => ({ 
                            ...prev, 
                            tailorId: tailorOption.id,
                            estimatedPrice: JSON.parse(tailorOption.priceRange || '{"min": 1200}').min,
                          }))}
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={tailorOption.user.profileImageUrl || ''} />
                              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-royal-600 text-white">
                                {tailorOption.businessName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800">{tailorOption.businessName}</h4>
                              <p className="text-sm text-gray-600">
                                ⭐ {tailorOption.averageRating} • {tailorOption.totalReviews} reviews
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-emerald-600 font-semibold">
                                From ₹{JSON.parse(tailorOption.priceRange || '{"min": 800}').min}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current Tailor (if pre-selected) */}
                {tailor && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={tailor.user.profileImageUrl || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-royal-600 text-white">
                          {tailor.businessName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{tailor.businessName}</h4>
                        <p className="text-sm text-gray-600">
                          ⭐ {tailor.averageRating} • {tailor.totalReviews} reviews
                        </p>
                      </div>
                      <Badge className="bg-emerald-600">Selected</Badge>
                    </div>
                  </div>
                )}
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="blouseType">Blouse Type</Label>
                    <Select 
                      value={bookingData.blouseType} 
                      onValueChange={(value) => setBookingData(prev => ({ ...prev, blouseType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select blouse type" />
                      </SelectTrigger>
                      <SelectContent>
                        {blouseTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="fabricType">Fabric Type</Label>
                    <Select 
                      value={bookingData.fabricType} 
                      onValueChange={(value) => setBookingData(prev => ({ ...prev, fabricType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select fabric" />
                      </SelectTrigger>
                      <SelectContent>
                        {fabricTypes.map(fabric => (
                          <SelectItem key={fabric} value={fabric}>{fabric}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="sleeveStyle">Sleeve Style</Label>
                    <Select 
                      value={bookingData.sleeveStyle} 
                      onValueChange={(value) => setBookingData(prev => ({ ...prev, sleeveStyle: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sleeve style" />
                      </SelectTrigger>
                      <SelectContent>
                        {sleeveStyles.map(style => (
                          <SelectItem key={style} value={style}>{style}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="neckline">Neckline</Label>
                    <Select 
                      value={bookingData.neckline} 
                      onValueChange={(value) => setBookingData(prev => ({ ...prev, neckline: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select neckline" />
                      </SelectTrigger>
                      <SelectContent>
                        {necklines.map(neck => (
                          <SelectItem key={neck} value={neck}>{neck}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="instructions">Special Instructions</Label>
                  <Textarea 
                    id="instructions"
                    placeholder="Any specific design requirements or preferences..."
                    value={bookingData.specialInstructions}
                    onChange={(e) => setBookingData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label>Reference Images (Optional)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                    <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-gray-600">Upload reference images or inspiration photos</p>
                    <Button variant="outline" className="mt-2">
                      Choose Files
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleNext}
                    disabled={!bookingData.tailorId || !bookingData.blouseType}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Next: Measurements
                    <ArrowRight size={16} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Measurements */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Measurements</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="bust">Bust (inches)</Label>
                    <Input 
                      id="bust"
                      type="number" 
                      placeholder="e.g., 34"
                      value={bookingData.measurements?.bust || ''}
                      onChange={(e) => setBookingData(prev => ({ 
                        ...prev, 
                        measurements: { 
                          ...prev.measurements!, 
                          bust: parseFloat(e.target.value) || 0 
                        }
                      }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="waist">Waist (inches)</Label>
                    <Input 
                      id="waist"
                      type="number" 
                      placeholder="e.g., 28"
                      value={bookingData.measurements?.waist || ''}
                      onChange={(e) => setBookingData(prev => ({ 
                        ...prev, 
                        measurements: { 
                          ...prev.measurements!, 
                          waist: parseFloat(e.target.value) || 0 
                        }
                      }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="shoulder">Shoulder (inches)</Label>
                    <Input 
                      id="shoulder"
                      type="number" 
                      placeholder="e.g., 14"
                      value={bookingData.measurements?.shoulder || ''}
                      onChange={(e) => setBookingData(prev => ({ 
                        ...prev, 
                        measurements: { 
                          ...prev.measurements!, 
                          shoulder: parseFloat(e.target.value) || 0 
                        }
                      }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="length">Blouse Length (inches)</Label>
                    <Input 
                      id="length"
                      type="number" 
                      placeholder="e.g., 15"
                      value={bookingData.measurements?.length || ''}
                      onChange={(e) => setBookingData(prev => ({ 
                        ...prev, 
                        measurements: { 
                          ...prev.measurements!, 
                          length: parseFloat(e.target.value) || 0 
                        }
                      }))}
                    />
                  </div>
                </div>
                
                <div className="bg-cream-100 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Need help with measurements?</h4>
                  <p className="text-sm text-gray-600 mb-3">Our tailor can help you with accurate measurements during pickup.</p>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="measurementHelp"
                      checked={needMeasurementHelp}
                      onCheckedChange={setNeedMeasurementHelp}
                    />
                    <label htmlFor="measurementHelp" className="text-sm text-gray-700">
                      Request measurement assistance during pickup
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handlePrevious}>
                    <ArrowLeft size={16} className="mr-1" />
                    Previous
                  </Button>
                  <Button 
                    onClick={handleNext}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Next: Confirmation
                    <ArrowRight size={16} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Order Confirmation</h3>
                
                <div className="bg-cream-100 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Order Summary</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tailor:</span>
                      <span className="font-medium">{tailor?.businessName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Blouse Type:</span>
                      <span className="font-medium">{bookingData.blouseType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Price:</span>
                      <span className="font-medium text-emerald-600">₹{bookingData.estimatedPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Time:</span>
                      <span className="font-medium">5-7 days</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Pickup & Delivery</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pickupAddress">Pickup Address</Label>
                      <Textarea 
                        id="pickupAddress"
                        placeholder="Enter your pickup address..."
                        value={bookingData.pickupAddress}
                        onChange={(e) => setBookingData(prev => ({ ...prev, pickupAddress: e.target.value }))}
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pickupDate">Preferred Pickup Date</Label>
                      <Input 
                        id="pickupDate"
                        type="date"
                        value={bookingData.pickupDate}
                        onChange={(e) => setBookingData(prev => ({ ...prev, pickupDate: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="deliveryAddress">Delivery Address (Optional)</Label>
                    <Textarea 
                      id="deliveryAddress"
                      placeholder="Enter delivery address if different from pickup..."
                      value={bookingData.deliveryAddress}
                      onChange={(e) => setBookingData(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                      rows={2}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handlePrevious}>
                    <ArrowLeft size={16} className="mr-1" />
                    Previous
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={createOrderMutation.isPending || !bookingData.pickupAddress}
                    className="bg-gradient-to-r from-emerald-600 to-royal-600 hover:from-emerald-700 hover:to-royal-700"
                  >
                    {createOrderMutation.isPending ? (
                      "Processing..."
                    ) : (
                      <>
                        <CreditCard size={16} className="mr-1" />
                        Place Order
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
