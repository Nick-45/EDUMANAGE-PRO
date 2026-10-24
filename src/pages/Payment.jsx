import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';
import { 
  FaMobile, FaCreditCard, FaUniversity, FaCheckCircle, 
  FaLock, FaArrowLeft, FaSpinner, FaPhone, FaMoneyBillWave, FaCheck 
} from 'react-icons/fa';
import { paymentService } from '../services/api';
import toast from 'react-hot-toast';

const Payment = () => {
  const { user } = useAuth();
  const { school, subscribe } = useSchool();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const planId = queryParams.get('plan') || 'standard';

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

  const SETUP_FEE = 4500;

  // Updated Plan details matching your new SaaS pricing strategy
  const plans = {
    standard: {
      name: 'Standard Tier',
      price: 8500,
      population: 'Up to 500 Students',
      includedSms: '1,000 SMS / term',
      features: ['Branded Mobile App (White-Label)', 'Fee Management', 'Student & Teacher Records', 'Results & Grading', 'Timetable Management']
    },
    premium: {
      name: 'Premium Tier',
      price: 15000,
      population: 'Up to 1,000 Students',
      includedSms: '2,500 SMS / term',
      features: ['Everything in Standard', 'Branded Mobile App', 'Transport Management', 'Health Records']
    },
    enterprise: {
      name: 'Enterprise Tier',
      price: 25000,
      population: '1,000+ Students',
      includedSms: '5,000 SMS / term',
      features: ['Everything in Premium', 'Accommodation (Boarding)', 'Priority Support']
    }
  };

  const selectedPlan = plans[planId] || plans.standard;
  const totalDueToday = selectedPlan.price + SETUP_FEE;

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
        totalDueToday // Charging the total amount (Setup + Termly)
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
      const intent = await paymentService.createPaymentIntent(totalDueToday);
      setPaymentIntent(intent);
      
      // In production, you would use Stripe Elements here
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
        amount: totalDueToday,
        setupFeeIncluded: true
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
    <div className="min-h-screen bg-navy-gradient py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-sky-200 hover:text-gold-400 transition"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>

        <div className="bg-navy-900/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl shadow-inner-dark overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-navy-950 to-navy-900 px-8 py-6 border-b border-sky-500/20">
            <h1 className="text-2xl font-display font-bold text-white">Complete Your Subscription</h1>
            <p className="text-sky-100/70 mt-1">You're just one step away from transforming your school</p>
          </div>

          <div className="grid md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-sky-500/20">
            {/* Left Column - Plan Summary */}
            <div className="md:col-span-2 p-8 bg-navy-950/40">
              <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
              
              <div className="bg-navy-900/80 rounded-xl p-6 shadow-inner-dark border border-sky-500/10 mb-6">
                <h4 className="font-bold text-xl text-gold-400 mb-1">{selectedPlan.name}</h4>
                <p className="text-xs text-sky-200/60 mb-4">{selectedPlan.population}</p>
                
                <ul className="space-y-3 mb-6">
                  {selectedPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <FaCheck className="text-gold-400 mt-1 mr-3 flex-shrink-0 text-xs" />
                      <span className="text-sky-100/90">{feature}</span>
                    </li>
                  ))}
                  <li className="flex items-start text-sm">
                    <FaCheck className="text-gold-400 mt-1 mr-3 flex-shrink-0 text-xs" />
                    <span className="text-sky-100/90">Includes {selectedPlan.includedSms}</span>
                  </li>
                </ul>

                <div className="border-t border-sky-500/20 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-sky-100/70">
                    <span>Termly Subscription</span>
                    <span>KSh {selectedPlan.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-sky-100/70">
                    <span>One-time Setup Fee</span>
                    <span>KSh {SETUP_FEE.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white pt-2 border-t border-sky-500/20 mt-2">
                    <span>Total Due Today</span>
                    <span className="text-gold-400 text-lg">KSh {totalDueToday.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-sky-100/60">
                <p className="flex items-center mb-2">
                  <FaLock className="mr-2 text-gold-500" />
                  Secure 256-bit SSL encryption
                </p>
                <p className="flex items-center">
                  <FaCheckCircle className="mr-2 text-green-500" />
                  Cancel anytime at end of term
                </p>
              </div>
            </div>

            {/* Right Column - Payment Form */}
            <div className="md:col-span-3 p-8">
              {/* Progress Steps */}
              <div className="flex items-center mb-8">
                <div className={`flex items-center ${step >= 1 ? 'text-gold-400' : 'text-sky-100/30'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    step >= 1 ? 'bg-gold-500 text-navy-950' : 'bg-navy-800 text-sky-100/50'
                  }`}>
                    1
                  </div>
                  <span className="ml-2 text-sm font-medium">Payment</span>
                </div>
                <div className={`flex-1 h-0.5 mx-4 ${
                  step >= 2 ? 'bg-gold-500' : 'bg-navy-800'
                }`}></div>
                <div className={`flex items-center ${step >= 2 ? 'text-gold-400' : 'text-sky-100/30'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    step >= 2 ? 'bg-gold-500 text-navy-950' : 'bg-navy-800 text-sky-100/50'
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
                      className={`p-4 border-2 rounded-xl flex flex-col items-center transition ${
                        paymentMethod === 'mpesa'
                          ? 'border-gold-500 bg-gold-500/10'
                          : 'border-sky-500/20 bg-navy-950/40 hover:border-sky-500/40'
                      }`}
                    >
                      <FaMobile className={`text-2xl mb-2 ${
                        paymentMethod === 'mpesa' ? 'text-gold-400' : 'text-sky-400'
                      }`} />
                      <span className={`text-sm font-medium ${paymentMethod === 'mpesa' ? 'text-white' : 'text-sky-200'}`}>M-Pesa</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 border-2 rounded-xl flex flex-col items-center transition ${
                        paymentMethod === 'card'
                          ? 'border-gold-500 bg-gold-500/10'
                          : 'border-sky-500/20 bg-navy-950/40 hover:border-sky-500/40'
                      }`}
                    >
                      <FaCreditCard className={`text-2xl mb-2 ${
                        paymentMethod === 'card' ? 'text-gold-400' : 'text-sky-400'
                      }`} />
                      <span className={`text-sm font-medium ${paymentMethod === 'card' ? 'text-white' : 'text-sky-200'}`}>Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank')}
                      className={`p-4 border-2 rounded-xl flex flex-col items-center transition ${
                        paymentMethod === 'bank'
                          ? 'border-gold-500 bg-gold-500/10'
                          : 'border-sky-500/20 bg-navy-950/40 hover:border-sky-500/40'
                      }`}
                    >
                      <FaUniversity className={`text-2xl mb-2 ${
                        paymentMethod === 'bank' ? 'text-gold-400' : 'text-sky-400'
                      }`} />
                      <span className={`text-sm font-medium ${paymentMethod === 'bank' ? 'text-white' : 'text-sky-200'}`}>Bank</span>
                    </button>
                  </div>

                  <form onSubmit={handleSubmit}>
                    {/* M-Pesa Form */}
                    {paymentMethod === 'mpesa' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-sky-100 mb-2">
                            M-Pesa Phone Number
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaPhone className="h-5 w-5 text-sky-500/50" />
                            </div>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="e.g., 0712345678"
                              className="w-full pl-10 pr-4 py-3 bg-navy-950/60 border border-sky-500/30 text-white placeholder-sky-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 transition"
                            />
                          </div>
                          <p className="text-xs text-sky-200/50 mt-2">
                            You will receive an STK Push prompt on your phone
                          </p>
                        </div>

                        <div className="bg-navy-950/40 border border-sky-500/20 rounded-lg p-4">
                          <h4 className="font-medium text-sky-100 mb-2">How to pay with M-Pesa:</h4>
                          <ol className="text-sm text-sky-200/70 space-y-1 list-decimal list-inside">
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
                          <label className="block text-sm font-medium text-sky-100 mb-2">
                            Card Number
                          </label>
                          <input
                            type="text"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            placeholder="1234 5678 9012 3456"
                            className="w-full px-4 py-3 bg-navy-950/60 border border-sky-500/30 text-white placeholder-sky-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 transition"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-sky-100 mb-2">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              name="cardExpiry"
                              value={formData.cardExpiry}
                              onChange={handleInputChange}
                              placeholder="MM/YY"
                              className="w-full px-4 py-3 bg-navy-950/60 border border-sky-500/30 text-white placeholder-sky-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 transition"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-sky-100 mb-2">
                              CVC
                            </label>
                            <input
                              type="text"
                              name="cardCvc"
                              value={formData.cardCvc}
                              onChange={handleInputChange}
                              placeholder="123"
                              className="w-full px-4 py-3 bg-navy-950/60 border border-sky-500/30 text-white placeholder-sky-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 transition"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-sky-100 mb-2">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            name="cardName"
                            value={formData.cardName}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className="w-full px-4 py-3 bg-navy-950/60 border border-sky-500/30 text-white placeholder-sky-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 transition"
                          />
                        </div>
                      </div>
                    )}

                    {/* Bank Transfer Form */}
                    {paymentMethod === 'bank' && (
                      <div className="space-y-4">
                        <div className="bg-navy-950/60 border border-sky-500/20 rounded-lg p-4 mb-4">
                          <h4 className="font-medium text-white mb-2">Bank Account Details</h4>
                          <p className="text-sm text-sky-100/80 mb-1"><span className="font-medium text-sky-300">Bank:</span> Equity Bank</p>
                          <p className="text-sm text-sky-100/80 mb-1"><span className="font-medium text-sky-300">Account Name:</span> Edupriva Technologies</p>
                          <p className="text-sm text-sky-100/80 mb-1"><span className="font-medium text-sky-300">Account Number:</span> </p>
                          <p className="text-sm text-sky-100/80"><span className="font-medium text-sky-300">Branch:</span> Nairobi CBD</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-sky-100 mb-2">
                            Account Holder Name
                          </label>
                          <input
                            type="text"
                            name="accountName"
                            value={formData.accountName}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className="w-full px-4 py-3 bg-navy-950/60 border border-sky-500/30 text-white placeholder-sky-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 transition"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-sky-100 mb-2">
                            Transaction Reference
                          </label>
                          <input
                            type="text"
                            name="transactionRef"
                            value={formData.transactionRef}
                            onChange={handleInputChange}
                            placeholder="e.g., Bank slip number"
                            className="w-full px-4 py-3 bg-navy-950/60 border border-sky-500/30 text-white placeholder-sky-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 transition"
                          />
                        </div>
                      </div>
                    )}

                    <div className="mt-8">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gold-gradient text-navy-950 rounded-xl font-bold hover:shadow-gold-glow-lg transition disabled:opacity-50 flex items-center justify-center shadow-gold-glow"
                      >
                        {loading ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <FaLock className="mr-2" />
                            Pay KSh {totalDueToday.toLocaleString()}
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
                      <div className="w-20 h-20 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <h3 className="text-xl font-semibold text-white">Processing Payment</h3>
                      <p className="text-sky-100/60">Please wait while we confirm your payment...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                        <FaCheckCircle className="text-4xl text-green-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white">Payment Successful!</h3>
                      <p className="text-sky-100/60">Redirecting you to setup your school...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-6 text-sm text-sky-200/60">
            <span className="flex items-center">
              <FaLock className="mr-2 text-green-500" />
              SSL Encrypted
            </span>
            <span className="flex items-center">
              <FaCheckCircle className="mr-2 text-green-500" />
              PCI Compliant
            </span>
            <span className="flex items-center">
              <FaMoneyBillWave className="mr-2 text-green-500" />
              Termly Billing
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
