import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

const CountryCodeSelector = ({ 
  value = '+91', 
  onChange, 
  disabled = false,
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Common country codes with India as default
  const countryCodes = [
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+1', country: 'United States', flag: '🇺🇸' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+34', country: 'Spain', flag: '🇪🇸' },
    { code: '+7', country: 'Russia', flag: '🇷🇺' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+1', country: 'Canada', flag: '🇨🇦' },
    { code: '+52', country: 'Mexico', flag: '🇲🇽' },
    { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
    { code: '+46', country: 'Sweden', flag: '🇸🇪' },
    { code: '+47', country: 'Norway', flag: '🇳🇴' },
    { code: '+45', country: 'Denmark', flag: '🇩🇰' },
    { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
    { code: '+43', country: 'Austria', flag: '🇦🇹' },
    { code: '+32', country: 'Belgium', flag: '🇧🇪' },
    { code: '+351', country: 'Portugal', flag: '🇵🇹' },
    { code: '+30', country: 'Greece', flag: '🇬🇷' },
    { code: '+48', country: 'Poland', flag: '🇵🇱' },
    { code: '+420', country: 'Czech Republic', flag: '🇨🇿' },
    { code: '+36', country: 'Hungary', flag: '🇭🇺' },
    { code: '+40', country: 'Romania', flag: '🇷🇴' },
    { code: '+359', country: 'Bulgaria', flag: '🇧🇬' },
    { code: '+385', country: 'Croatia', flag: '🇭🇷' },
    { code: '+386', country: 'Slovenia', flag: '🇸🇮' },
    { code: '+421', country: 'Slovakia', flag: '🇸🇰' },
    { code: '+370', country: 'Lithuania', flag: '🇱🇹' },
    { code: '+371', country: 'Latvia', flag: '🇱🇻' },
    { code: '+372', country: 'Estonia', flag: '🇪🇪' },
    { code: '+353', country: 'Ireland', flag: '🇮🇪' },
    { code: '+358', country: 'Finland', flag: '🇫🇮' },
    { code: '+354', country: 'Iceland', flag: '🇮🇸' },
    { code: '+376', country: 'Andorra', flag: '🇦🇩' },
    { code: '+377', country: 'Monaco', flag: '🇲🇨' },
    { code: '+378', country: 'San Marino', flag: '🇸🇲' },
    { code: '+39', country: 'Vatican City', flag: '🇻🇦' },
    { code: '+423', country: 'Liechtenstein', flag: '🇱🇮' },
    { code: '+352', country: 'Luxembourg', flag: '🇱🇺' },
    { code: '+356', country: 'Malta', flag: '🇲🇹' },
    { code: '+357', country: 'Cyprus', flag: '🇨🇾' },
    { code: '+90', country: 'Turkey', flag: '🇹🇷' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
    { code: '+974', country: 'Qatar', flag: '🇶🇦' },
    { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
    { code: '+968', country: 'Oman', flag: '🇴🇲' },
    { code: '+962', country: 'Jordan', flag: '🇯🇴' },
    { code: '+961', country: 'Lebanon', flag: '🇱🇧' },
    { code: '+972', country: 'Israel', flag: '🇮🇱' },
    { code: '+20', country: 'Egypt', flag: '🇪🇬' },
    { code: '+27', country: 'South Africa', flag: '🇿🇦' },
    { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
    { code: '+254', country: 'Kenya', flag: '🇰🇪' },
    { code: '+256', country: 'Uganda', flag: '🇺🇬' },
    { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
    { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
    { code: '+251', country: 'Ethiopia', flag: '🇪🇹' },
    { code: '+249', country: 'Sudan', flag: '🇸🇩' },
    { code: '+218', country: 'Libya', flag: '🇱🇾' },
    { code: '+216', country: 'Tunisia', flag: '🇹🇳' },
    { code: '+213', country: 'Algeria', flag: '🇩🇿' },
    { code: '+212', country: 'Morocco', flag: '🇲🇦' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
    { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
    { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
    { code: '+977', country: 'Nepal', flag: '🇳🇵' },
    { code: '+975', country: 'Bhutan', flag: '🇧🇹' },
    { code: '+960', country: 'Maldives', flag: '🇲🇻' },
    { code: '+93', country: 'Afghanistan', flag: '🇦🇫' },
    { code: '+98', country: 'Iran', flag: '🇮🇷' },
    { code: '+964', country: 'Iraq', flag: '🇮🇶' },
    { code: '+963', country: 'Syria', flag: '🇸🇾' },
    { code: '+961', country: 'Lebanon', flag: '🇱🇧' },
    { code: '+972', country: 'Israel', flag: '🇮🇱' },
    { code: '+970', country: 'Palestine', flag: '🇵🇸' },
    { code: '+962', country: 'Jordan', flag: '🇯🇴' },
    { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
    { code: '+974', country: 'Qatar', flag: '🇶🇦' },
    { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
    { code: '+968', country: 'Oman', flag: '🇴🇲' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
    { code: '+974', country: 'Qatar', flag: '🇶🇦' },
    { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
    { code: '+968', country: 'Oman', flag: '🇴🇲' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' },
    { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
    { code: '+66', country: 'Thailand', flag: '🇹🇭' },
    { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
    { code: '+855', country: 'Cambodia', flag: '🇰🇭' },
    { code: '+856', country: 'Laos', flag: '🇱🇦' },
    { code: '+95', country: 'Myanmar', flag: '🇲🇲' },
    { code: '+63', country: 'Philippines', flag: '🇵🇭' },
    { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
    { code: '+673', country: 'Brunei', flag: '🇧🇳' },
    { code: '+670', country: 'East Timor', flag: '🇹🇱' },
    { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
    { code: '+679', country: 'Fiji', flag: '🇫🇯' },
    { code: '+685', country: 'Samoa', flag: '🇼🇸' },
    { code: '+676', country: 'Tonga', flag: '🇹🇴' },
    { code: '+678', country: 'Vanuatu', flag: '🇻🇺' },
    { code: '+687', country: 'New Caledonia', flag: '🇳🇨' },
    { code: '+689', country: 'French Polynesia', flag: '🇵🇫' },
    { code: '+684', country: 'American Samoa', flag: '🇦🇸' },
    { code: '+680', country: 'Palau', flag: '🇵🇼' },
    { code: '+691', country: 'Micronesia', flag: '🇫🇲' },
    { code: '+692', country: 'Marshall Islands', flag: '🇲🇭' },
    { code: '+686', country: 'Kiribati', flag: '🇰🇮' },
    { code: '+688', country: 'Tuvalu', flag: '🇹🇻' },
    { code: '+690', country: 'Tokelau', flag: '🇹🇰' },
    { code: '+683', country: 'Niue', flag: '🇳🇺' },
    { code: '+682', country: 'Cook Islands', flag: '🇨🇰' },
    { code: '+681', country: 'Wallis and Futuna', flag: '🇼🇫' },
    { code: '+679', country: 'Fiji', flag: '🇫🇯' },
    { code: '+685', country: 'Samoa', flag: '🇼🇸' },
    { code: '+676', country: 'Tonga', flag: '🇹🇴' },
    { code: '+678', country: 'Vanuatu', flag: '🇻🇺' },
    { code: '+687', country: 'New Caledonia', flag: '🇳🇨' },
    { code: '+689', country: 'French Polynesia', flag: '🇵🇫' },
    { code: '+684', country: 'American Samoa', flag: '🇦🇸' },
    { code: '+680', country: 'Palau', flag: '🇵🇼' },
    { code: '+691', country: 'Micronesia', flag: '🇫🇲' },
    { code: '+692', country: 'Marshall Islands', flag: '🇲🇭' },
    { code: '+686', country: 'Kiribati', flag: '🇰🇮' },
    { code: '+688', country: 'Tuvalu', flag: '🇹🇻' },
    { code: '+690', country: 'Tokelau', flag: '🇹🇰' },
    { code: '+683', country: 'Niue', flag: '🇳🇺' },
    { code: '+682', country: 'Cook Islands', flag: '🇨🇰' },
    { code: '+681', country: 'Wallis and Futuna', flag: '🇼🇫' },
  ];

  // Remove duplicates and sort
  const uniqueCountryCodes = countryCodes.filter((item, index, self) => 
    index === self.findIndex(t => t.code === item.code)
  ).sort((a, b) => a.country.localeCompare(b.country));

  const filteredCodes = uniqueCountryCodes.filter(country =>
    country.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.includes(searchTerm)
  );

  const selectedCountry = uniqueCountryCodes.find(country => country.code === value) || 
    uniqueCountryCodes.find(country => country.code === '+91');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (code) => {
    onChange(code);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-300 rounded-l-md
          ${disabled 
            ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
            : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
          }
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
        `}
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">{selectedCountry?.flag}</span>
          <span className="font-medium">{selectedCountry?.code}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 w-80 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredCodes.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => handleSelect(country.code)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-gray-50
                  ${value === country.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                `}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{country.flag}</span>
                  <span className="font-medium">{country.code}</span>
                  <span className="text-gray-600">{country.country}</span>
                </div>
                {value === country.code && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </button>
            ))}
            {filteredCodes.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryCodeSelector;
