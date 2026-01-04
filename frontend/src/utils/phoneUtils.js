export const extractPhoneDigits = (phone) => {
  if (!phone) return '';
  // Remove all non-digit characters
  return phone.replace(/\D/g, '');
};

export const extractPhoneWithoutCountryCode = (phone) => {
  if (!phone) return '';
  // Remove + and spaces, get only digits
  const digits = phone.replace(/\D/g, '');
  
  // Try to match known country codes and remove them
  const countryCodes = ['91', '1', '44', '61', '49', '33', '81', '86', '55', '52', '65', '971', '966', '27'];
  
  for (const code of countryCodes) {
    if (digits.startsWith(code)) {
      const remaining = digits.substring(code.length);
      // If remaining is 10 digits (typical phone length), return it
      if (remaining.length === 10) {
        return remaining;
      }
    }
  }
  
  // If no country code matched, return last 10 digits (assuming it's a phone number)
  return digits.length > 10 ? digits.substring(digits.length - 10) : digits;
};

export const detectCountryFromPhone = (phone) => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  
  // Country code mapping
  const countryMap = {
    '91': { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
    '1': { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
    '44': { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
    '61': { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
    '49': { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
    '33': { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
    '81': { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
    '86': { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
    '55': { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  };

  // Check which country code the phone starts with
  for (const [code, country] of Object.entries(countryMap)) {
    if (digits.startsWith(code)) {
      return country;
    }
  }

  // Default to India if no match but looks like it might be local? 
  // Or just return null if no strict match found
  return null;
};

export const isValidPhoneNumber = (phone) => {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
};
