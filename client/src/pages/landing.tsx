import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slice, MapPin, Clock, Palette, GraduationCap, Star, Users, Crosshair } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import LanguageSwitcher from "@/components/language-switcher";

export default function Landing() {
  const { t } = useTranslation();
  const [location, setLocation] = useState<string>('');

  useEffect(() => {
    // Simulate location detection
    setTimeout(() => {
      setLocation('Hyderabad, Telangana');
    }, 2000);
  }, []);

  const services = [
    {
      icon: Slice,
      title: t('services.custom.title'),
      description: t('services.custom.desc'),
      color: 'bg-emerald-600',
    },
    {
      icon: Clock,
      title: t('services.alterations.title'),
      description: t('services.alterations.desc'),
      color: 'bg-royal-600',
    },
    {
      icon: Palette,
      title: t('services.consultation.title'),
      description: t('services.consultation.desc'),
      color: 'bg-golden-500',
    },
    {
      icon: GraduationCap,
      title: t('services.learning.title'),
      description: t('services.learning.desc'),
      color: 'bg-pink-600',
    },
  ];

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-golden-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-royal-600 rounded-lg flex items-center justify-center">
                <Slice className="text-white" size={20} />
              </div>
              <h1 className="text-xl font-bold text-gray-800 font-serif">
                {t('app.name')}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-gradient-to-r from-emerald-600 to-royal-600 hover:from-emerald-700 hover:to-royal-700"
              >
                {t('landing.cta.login')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="ethnic-gradient py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-6xl font-bold text-gray-800 font-serif leading-tight">
                  {t('landing.hero.title').split(',')[0]},
                  <span className="text-emerald-600">{t('landing.hero.title').split(',')[1]}</span>
                </h2>
                <p className="text-lg text-gray-600 max-w-lg">
                  {t('landing.hero.subtitle')}
                </p>
              </div>
              
              {/* Location Search */}
              <Card className="cultural-shadow">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {t('landing.find.title')}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="text-emerald-600" size={20} />
                      <span className="text-gray-700">
                        {location || t('landing.find.detecting')}
                      </span>
                      <Button variant="ghost" size="sm" className="ml-auto">
                        <Crosshair size={16} />
                      </Button>
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-emerald-600 to-royal-600 hover:from-emerald-700 hover:to-royal-700"
                      onClick={() => window.location.href = '/api/login'}
                    >
                      <MapPin size={16} className="mr-2" />
                      {t('landing.find.search')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Beautiful traditional saree blouses with intricate embroidery" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              
              {/* Floating Stats Cards */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">500+</div>
                  <div className="text-sm text-gray-600">Expert Tailors</div>
                </div>
              </div>
              
              <div className="absolute -top-6 -right-6 bg-white rounded-xl p-4 shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-royal-600">1000+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 font-serif mb-4">
              {t('services.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From traditional designs to contemporary styles, we offer comprehensive blouse stitching services
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card 
                key={index}
                className="bg-gradient-to-br from-cream-100 to-white hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-golden-400"
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${service.color} rounded-lg flex items-center justify-center mb-4`}>
                    <service.icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  <Button 
                    variant="link" 
                    className="text-emerald-600 hover:text-emerald-700 p-0"
                    onClick={() => window.location.href = '/api/login'}
                  >
                    Learn More →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tailors Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 font-serif mb-4">
              Featured Expert Tailors
            </h2>
            <p className="text-lg text-gray-600">
              Meet some of our top-rated tailors known for their exceptional craftsmanship
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <img 
                    src={`https://images.unsplash.com/photo-150${7 + index}003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200`}
                    alt="Expert tailor"
                    className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-golden-400 shadow-lg mb-4"
                  />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {['Priya Tailoring', 'Rajesh Boutique', 'Meera Designs'][index]}
                  </h3>
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className="w-4 h-4 text-golden-400 fill-current" />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">4.9 ({[127, 89, 156][index]} reviews)</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    {['Specializes in silk blouses', 'Contemporary & traditional designs', 'Expert in embroidery work'][index]}
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = '/api/login'}
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-royal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white font-serif mb-4">
            Ready to Get Your Perfect Blouse?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have found their perfect tailor through BlouseConnect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-emerald-600 hover:bg-gray-50"
              onClick={() => window.location.href = '/api/login'}
            >
              <Users size={20} className="mr-2" />
              Find Tailors Near You
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              onClick={() => window.location.href = '/api/login'}
            >
              <GraduationCap size={20} className="mr-2" />
              Learn Stitching
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-royal-600 rounded-lg flex items-center justify-center">
              <Slice className="text-white" size={16} />
            </div>
            <span className="text-lg font-bold font-serif">{t('app.name')}</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 BlouseConnect. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
