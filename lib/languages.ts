// All languages of India from different states (case-sensitive)
export const INDIAN_LANGUAGES = [
  // Northern India
  'Hindi',
  'Punjabi',
  'Urdu',
  'Kashmiri',
  'Dogri',
  'Pahari',
  'Ladakhi',
  
  // Southern India
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Tulu',
  
  // Eastern India
  'Bengali',
  'Assamese',
  'Manipuri',
  'Nagamese',
  'Bodo',
  'Khasi',
  'Garo',
  'Tripuri',
  'Chakma',
  'Mizo',
  'Arunachali',
  'Maithili',
  
  // Western India
  'Gujarati',
  'Marathi',
  'Konkani',
  'Sindhi',
  'Bhili',
  
  // Central India
  'Hindi',
  'Marathi',
  'Chhattisgarhi',
  'Muria',
  'Gondi',
  
  // Indo-Aryan Languages
  'Odia',
  'Punjabi',
  'Sindhi',
  'Urdu',
  'Hindi',
  'Nepali',
  'Maithili',
  'Bhojpuri',
  'Magahi',
  'Angika',
  'Rajasthani',
  'Haryanvi',
  'Bundeli',
  'Awadhi',
  'Bagheli',
  'Malvi',
  'Nimadi',
  'Chattisgarhi',
  
  // Dravidian Languages
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Tulu',
  'Gondi',
  'Konda-Dora',
  'Kui',
  
  // Munda Languages (Austro-Asiatic)
  'Santali',
  'Mundari',
  'Kharia',
  
  // Tibeto-Burman Languages
  'Bodo',
  'Mizo',
  'Manipuri',
  'Nagamese',
  'Khasi',
  'Garo',
  'Chakma',
  'Arunachali',
  'Tripuri',
  'Ladakhi',
  'Kashmiri',
  'Balti',
  'Monpa',
  'Lepcha',
  'Limbu',
  'Rai',
  'Gurung',
  'Newari',
  'Sherpa',
  
  // Official Languages
  'English',
  
  // Other significant languages
  'Maithili',
  'Dogri',
  'Santhali',
  'Bodo',
  'Konkani',
  'Chhattisgarhi',
  'Haryanvi',
  'Rajasthani',
  'Magahi',
  'Bhojpuri',
  'Angika',
  'Awadhi',
  'Bagheli',
  'Malvi',
  'Pahari',
  'Muria',
  'Konda-Dora',
  'Kui',
  'Gondi',
];

// Remove duplicates and sort alphabetically
export const SORTED_LANGUAGES = Array.from(new Set(INDIAN_LANGUAGES)).sort();
