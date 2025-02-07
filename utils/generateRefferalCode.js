// Helper function to generate a unique referral code

// Helper function to generate a unique referral code
const generateReferralCode = (fullname, email) => {
  const namePart = fullname.split(' ').map(word => word[0].toUpperCase()).join('');
  const emailPart = email.split('@')[0].toUpperCase(); 
  const randomDigits = Math.floor(10000000000 + Math.random() * 90000000000);
  const paddedNumber = String(randomDigits).padStart(11, '0'); 
  
  return `${namePart}${emailPart}${paddedNumber}`;
};

export {generateReferralCode}