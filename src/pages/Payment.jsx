import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';
import { motion } from 'framer-motion';
import { 
  FaMobile, FaCreditCard, FaUniversity, FaCheckCircle, 
  FaLock, FaArrowLeft, FaSpinner, FaPhone, FaMoneyBillWave 
} from 'react-icons/fa';
import { paymentService } from '../services/api';
import toast from 'react-hot-toast';

const Payment = () => {
  const { user } = useAuth();
  const { school, subscribe } = useSchool();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const planId = queryParams.get('plan') || 'professional';

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [step, setStep] = useState(1);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [formData, setFormData] = useState({
    phone: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
    transactionRef: '',
  });

  // Plan details
  const plans = {
    starter: {
      name: 'Starter Plan',
      price: 2500,
      students: 200,
      features: ['Up to 200 students', 'Custom subdomain', 'School branding', 'WebView app']
    },
    professional: {
      name: 'Professional Plan',
      price: 5000,
      students: 500,
      features: ['Up to 500 students', 'Custom subdomain', 'Advanced branding', 'WebView app', 'Priority support', 'API access']
    },
    enterprise: {
      name: 'Enterprise Plan',
      price: 10000,
      students: 'Unlimited',
      features: ['Unlimited students', 'Custom domain', 'Full white-label', 'Custom mobile app', '24/7 support', 'Custom development']
    }
  };

  const selectedPlan = plans[planId] || plans.professional;

  useEffect(() => {
    if (!user || !school) {
      navigate('/login');
    }
  }, [user, school, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleMpesaPayment = async () => {
    if (!formData.phone || formData.phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await paymentService.mpesaSTKPush(
        formData.phone,
        selectedPlan.price
      );

      setPaymentIntent(response);
      toast.success('STK Push sent! Please check your phone.');
      setStep(2);

      // Poll for payment status
      const interval = setInterval(async () => {
        try {
          const status = await paymentService.mpesaStatus(response.checkoutRequestID);
          if (status.status === 'completed') {
            clearInterval(interval);
            await handlePaymentSuccess('mpesa', response.checkoutRequestID);
          } else if (status.status === 'failed') {
            clearInterval(interval);
            toast.error('Payment failed. Please try again.');
            setStep(1);
            setLoading(false);
          }
        } catch (error) {
          console.error('Error polling payment status:', error);
        }
      }, 3000);
    } catch (error) {
      toast.error(error.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  const handleCardPayment = async () => {
    if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCvc) {
      toast.error('Please fill in all card details');
      return;
    }

    setLoading(true);
    try {
      const intent = await paymentService.createPaymentIntent(selectedPlan.price);
      setPaymentIntent(intent);
      
      // In production, you would use Stripe Elements here
      // For demo, we'll simulate successful payment
      setTimeout(async () => {
        await handlePaymentSuccess('card', intent.paymentIntentId);
      }, 2000);
    } catch (error) {
      toast.error(error.message || 'Payment failed');
      setLoading(false);
    }
  };

  const handleBankPayment = async () => {
    if (!formData.accountName || !formData.transactionRef) {
      toast.error('Please provide transaction reference');
      return;
    }

    setLoading(true);
    try {
      // Simulate bank payment verification
      setTimeout(async () => {
        await handlePaymentSuccess('bank', `BANK-${Date.now()}`);
      }, 2000);
    } catch (error) {
      toast.error(error.message || 'Payment verification failed');
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (method, transactionId) => {
    try {
      await subscribe(planId, {
        method,
        transactionId,
        amount: selectedPlan.price,
      });

      toast.success('Payment successful! Your subscription is now active.');
      setTimeout(() => {
        navigate('/setup');
      }, 2000);
    } catch (error) {
      toast.error(error.message || 'Failed to activate subscription');
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (paymentMethod === 'mpesa') {
      handleMpesaPayment();
    } else if (paymentMethod === 'card') {
      handleCardPayment();
    } else if (paymentMethod === 'bank') {
      handleBankPayment();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-primary-600 transition"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Complete Your Subscription</h1>
            <p className="text-primary-100 mt-1">You're just one step away from transforming your school</p>
          </div>

          <div className="grid md:grid-cols-5 divide-x divide-gray-200">
            {/* Left Column - Plan Summary */}
            <div className="md:col-span-2 p-8 bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              
              <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                <h4 className="font-bold text-xl text-primary-600 mb-2">{selectedPlan.name}</h4>
                <div className="mb-4">
                  <span className="text-3xl font-bold">KSh {selectedPlan.price.toLocaleString()}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                
                <ul className="space-y-2">
                  {selectedPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <FaCheckCircle className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-sm text-gray-600">
                <p className="flex items-center mb-2">
                  <FaLock className="mr-2 text-primary-600" />
                  Secure 256-bit SSL encryption
                </p>
                <p className="flex items-center">
                  <FaCheckCircle className="mr-2 text-green-600" />
                  Money-back guarantee
                </p>
              </div>
            </div>

            {/* Right Column - Payment Form */}
            <div className="md:col-span-3 p-8">
              {/* Progress Steps */}
              <div className="flex items-center mb-8">
                <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    1
                  </div>
                  <span className="ml-2 text-sm font-medium">Payment</span>
                </div>
                <div className={`flex-1 h-0.5 mx-4 ${
                  step >= 2 ? 'bg-primary-600' : 'bg-gray-200'
                }`}></div>
                <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium">Confirmation</span>
                </div>
              </div>

              {step === 1 ? (
                <>
                  {/* Payment Method Selection */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('mpesa')}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center transition ${
                        paymentMethod === 'mpesa'
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <FaMobile className={`text-2xl mb-2 ${
                        paymentMethod === 'mpesa' ? 'text-primary-600' : 'text-gray-600'
                      }`} />
                      <span className="text-sm font-medium">M-Pesa</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center transition ${
                        paymentMethod === 'card'
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <FaCreditCard className={`text-2xl mb-2 ${
                        paymentMethod === 'card' ? 'text-primary-600' : 'text-gray-600'
                      }`} />
                      <span className="text-sm font-medium">Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank')}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center transition ${
                        paymentMethod === 'bank'
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <FaUniversity className={`text-2xl mb-2 ${
                        paymentMethod === 'bank' ? 'text-primary-600' : 'text-gray-600'
                      }`} />
                      <span className="text-sm font-medium">Bank</span>
                    </button>
                  </div>

                  <form onSubmit={handleSubmit}>
                    {/* M-Pesa Form */}
                    {paymentMethod === 'mpesa' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            M-Pesa Phone Number
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaPhone className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="e.g., 0712345678"
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            You will receive an STK Push prompt on your phone
                          </p>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h4 className="font-medium text-yellow-800 mb-2">How to pay with M-Pesa:</h4>
                          <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                            <li>Enter your M-Pesa registered phone number</li>
                            <li>Click "Pay Now" to receive an STK Push</li>
                            <li>Enter your M-Pesa PIN on your phone</li>
                            <li>Wait for confirmation</li>
                          </ol>
                        </div>
                      </div>
                    )}

                    {/* Card Payment Form */}
                    {paymentMethod === 'card' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Card Number
                          </label>
                          <input
                            type="text"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            placeholder="1234 5678 9012 3456"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              name="cardExpiry"
                              value={formData.cardExpiry}
                              onChange={handleInputChange}
                              placeholder="MM/YY"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              CVC
                            </label>
                            <input
                              type="text"
                              name="cardCvc"
                              value={formData.cardCvc}
                              onChange={handleInputChange}
                              placeholder="123"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            name="cardName"
                            value={formData.cardName}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                          />
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-800">
                            🔒 Your card details are securely encrypted
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Bank Transfer Form */}
                    {paymentMethod === 'bank' && (
                      <div className="space-y-4">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                          <h4 className="font-medium mb-2">Bank Account Details</h4>
                          <p className="text-sm mb-1"><span className="font-medium">Bank:</span> Equity Bank</p>
                          <p className="text-sm mb-1"><span className="font-medium">Account Name:</span> EduManagerPro Ltd</p>
                          <p className="text-sm mb-1"><span className="font-medium">Account Number:</span> 1234567890</p>
                          <p className="text-sm"><span className="font-medium">Branch:</span> Nairobi CBD</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Holder Name
                          </label>
                          <input
                            type="text"
                            name="accountName"
                            value={formData.accountName}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Transaction Reference
                          </label>
                          <input
                            type="text"
                            name="transactionRef"
                            value={formData.transactionRef}
                            onChange={handleInputChange}
                            placeholder="e.g., MPESA transaction ID"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}

                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 flex items-center justify-center"
                      >
                        {loading ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <FaLock className="mr-2" />
                            Pay KSh {selectedPlan.price.toLocaleString()}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                // Step 2: Processing/Confirmation
                <div className="text-center py-12">
                  {loading ? (
                    <div className="space-y-4">
                      <div className="w-20 h-20 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <h3 className="text-xl font-semibold">Processing Payment</h3>
                      <p className="text-gray-600">Please wait while we confirm your payment...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <FaCheckCircle className="text-4xl text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold">Payment Successful!</h3>
                      <p className="text-gray-600">Redirecting you to setup your school...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <span className="flex items-center">
              <FaLock className="mr-2 text-green-600" />
              SSL Encrypted
            </span>
            <span className="flex items-center">
              <FaCheckCircle className="mr-2 text-green-600" />
              PCI Compliant
            </span>
            <span className="flex items-center">
              <FaMoneyBillWave className="mr-2 text-green-600" />
              Money-back Guarantee
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
