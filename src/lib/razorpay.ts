import Razorpay from 'razorpay';

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  console.warn('Warning: Razorpay API keys are missing in environment variables. Using dummy values for build compilation.');
}

// Fallback to dummy values during static compilation so the constructor doesn't crash
export const razorpay = new Razorpay({
  key_id: keyId || 'rzp_test_dummy_id',
  key_secret: keySecret || 'dummy_secret_val',
});

