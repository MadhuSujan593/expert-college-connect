import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  GraduationCap, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (e, path) => {
    if (path.includes('#')) {
      const [route, hash] = path.split('#');
      e.preventDefault();
      
      if (location.pathname === '/' || location.pathname === route) {
        // Already on homepage, scroll to section
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        // Navigate to homepage then scroll
        navigate(route);
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 500);
      }
    }
  };

  const footerLinks = {
    platform: [
      { name: 'Find Experts', path: '/login' },
      { name: 'Find Requirements', path: '/login' },
      { name: 'How It Works', path: '/#how-it-works' },
      { name: 'Success Stories', path: '/#success-stories' },
    ],
    company: [
      { name: 'About Us', path: '/about-us' },
      { name: 'Contact', path: '/contact-us' },
      { name: 'Terms & Conditions', path: '/terms-and-conditions' },
      { name: 'Shipping Policy', path: '/shipping-policy' },
      { name: 'Cancellation & Refund', path: '/cancellation-refund-policy' },
    ],
    support: [
      { name: 'FAQ', path: '/contact-us' },
      { name: 'Support', path: '/contact-us' },
      { name: 'Feedback', path: '/contact-us' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
  ];

  return (
    <footer className="bg-foreground text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-heading font-bold">
                VMS Tech Hub
              </span>
            </Link>
            <p className="text-secondary-300 mb-6 max-w-xs">
              Connecting colleges and universities with domain experts for academic excellence and industry collaboration.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-secondary-300">
                <Mail className="w-4 h-4" />
                <span className="text-sm">contact@vmstechhub.com</span>
              </div>
              <div className="flex items-center space-x-3 text-secondary-300">
                <Phone className="w-4 h-4" />
                <span className="text-sm">9000621876</span>
              </div>
              <div className="flex items-center space-x-3 text-secondary-300">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Bangalore, Karnataka, India</span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  {link.path.includes('#') ? (
                    <a
                      href={link.path}
                      onClick={(e) => handleLinkClick(e, link.path)}
                      className="text-secondary-300 hover:text-white transition-colors text-sm cursor-pointer"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      to={link.path}
                      className="text-secondary-300 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-secondary-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-secondary-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-secondary-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-secondary-300 text-sm">
              © {currentYear} VMS CONSULTIX PRIVATE LIMITED. All rights reserved.
            </div>
            
            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-secondary-300 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 