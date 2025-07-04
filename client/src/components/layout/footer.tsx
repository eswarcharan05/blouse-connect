import { Slice, Facebook, Instagram, Youtube, Phone, Mail, MapPin } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-royal-600 rounded-lg flex items-center justify-center">
                <Slice className="text-white" size={20} />
              </div>
              <h3 className="text-xl font-bold font-serif">{t('app.name')}</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Connecting you with skilled tailors for perfect blouse stitching. Quality craftsmanship meets modern convenience.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Custom Stitching</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Quick Alterations</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Design Consultation</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Learning Workshops</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Home Pickup & Delivery</a></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Track Your Order</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Size Guide</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Become a Tailor</a></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-3 text-gray-300 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="text-emerald-400" size={16} />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="text-emerald-400" size={16} />
                <span>support@blouseconnect.com</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="text-emerald-400 mt-1" size={16} />
                <span>Available in Hyderabad, Chennai, Bangalore, Mumbai, Delhi</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 BlouseConnect. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </div>
    </footer>
  );
}
