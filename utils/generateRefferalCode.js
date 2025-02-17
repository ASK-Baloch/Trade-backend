// Helper function to generate a unique referral code for a new user
const generateReferralCode = (fullname) => {
  const namePart = fullname.split(' ').map(word => word[0].toUpperCase()).join('');
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const paddedNumber = String(randomDigits).padStart(4, '0'); 

  const siteUrl = process.env.URL || 'http://localhost:3000';
  
  return `${siteUrl}/refferral//${namePart}${paddedNumber}`;
};

export {generateReferralCode} 