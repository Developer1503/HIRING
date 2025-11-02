// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useApp } from '../contexts/AppContext';
// import { apiClient } from '../config/api'; 
// import { ArrowLeft, Check, X } from 'lucide-react';

// export default function Register() {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     phone: '',
//     experienceLevel: 'fresher' as const,
//     preferredRole: '',
//     agreeToTerms: false,
//   });
//   const [passwordStrength, setPasswordStrength] = useState(0);
//   const { dispatch } = useApp();
//   const navigate = useNavigate();

//   const calculatePasswordStrength = (password: string) => {
//     let strength = 0;
//     if (password.length >= 8) strength++;
//     if (/[a-z]/.test(password)) strength++;
//     if (/[A-Z]/.test(password)) strength++;
//     if (/[0-9]/.test(password)) strength++;
//     if (/[^A-Za-z0-9]/.test(password)) strength++;
//     return strength;
//   };

//   const handlePasswordChange = (password: string) => {
//     setFormData({ ...formData, password });
//     setPasswordStrength(calculatePasswordStrength(password));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
  
//   console.log('🚀 SUBMITTING REGISTRATION');
//   console.log('📦 Form Data:', formData);
  
//   if (formData.password !== formData.confirmPassword) {
//     alert('Passwords do not match');
//     return;
//   }
//   if (!formData.agreeToTerms) {
//     alert('Please agree to the terms and conditions');
//     return;
//   }

//   try {
//     console.log('📡 Calling API register...');
//     console.log('API URL:', import.meta.env.VITE_API_BASE_URL);
    
//     const response = await apiClient.register({
//       name: formData.name,
//       email: formData.email,
//       password: formData.password,
//       phone: formData.phone,
//       experienceLevel: formData.experienceLevel,
//       preferredRole: formData.preferredRole
//     });

//     console.log('✅ API Response:', response);

//     if (response.success) {
//       const user = response.data.user;
//       dispatch({ type: 'SET_USER', payload: user });
//       navigate('/dashboard');
//     } else {
//       alert('Registration failed: ' + response.message);
//     }
//   } catch (error) {
//     console.error('❌ Full Registration error:', error);
    
//     // More detailed error logging
//     if (error instanceof Error) {
//       console.error('Error message:', error.message);
//       console.error('Error stack:', error.stack);
//     }
    
//     // @ts-ignore - Check for axios-style error
//     if (error.response) {
//       console.error('Response data:', error.response.data);
//       console.error('Response status:', error.response.status);
//       alert('Registration failed: ' + JSON.stringify(error.response.data));
//     } else if (error.request) {
//       console.error('Request was made but no response:', error.request);
//       alert('No response from server. Is the backend running?');
//     } else {
//       alert('Registration failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
//     }
//   }
// };

//   // const handleSubmit = (e: React.FormEvent) => {
//   //   e.preventDefault();
//   //   console.log('🚀 SUBMITTING REGISTRATION');
//   //   console.log('📦 Form Data:', formData);

//   //   if (formData.password !== formData.confirmPassword) {
//   //     alert('Passwords do not match');
//   //     return;
//   //   }
//   //   if (!formData.agreeToTerms) {
//   //     alert('Please agree to the terms and conditions');
//   //     return;
//   //   }
//   //    try {
//   //   // This should call the REAL API, not mock
//   //   console.log('📡 Calling API...');
//   //   const response = await apiClient.register({
//   //     name: formData.name,
//   //     email: formData.email,
//   //     password: formData.password,
//   //     phone: formData.phone,
//   //     experienceLevel: formData.experienceLevel,
//   //     preferredRole: formData.preferredRole
//   //   });

//   //   console.log('✅ API Response:', response);

//   //   if (response.success) {
//   //     const user = response.data.user;
//   //     dispatch({ type: 'SET_USER', payload: user });
//   //     navigate('/dashboard');
//   //   }
//   // } catch (error) {
//   //   console.error('❌ Registration error:', error);
//   //   alert('Registration failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
//   // }
//   //   // const newUser = {
//   //   //   id: Date.now().toString(),
//   //   //   name: formData.name,
//   //   //   email: formData.email,
//   //   //   phone: formData.phone,
//   //   //   experienceLevel: formData.experienceLevel,
//   //   //   preferredRole: formData.preferredRole,
//   //   // };

//   //   // dispatch({ type: 'SET_USER', payload: newUser });
//   //   // navigate('/dashboard');
//   // };

//   const getStrengthColor = () => {
//     if (passwordStrength <= 2) return 'bg-red-500';
//     if (passwordStrength <= 3) return 'bg-yellow-500';
//     return 'bg-green-500';
//   };

//   const getStrengthText = () => {
//     if (passwordStrength <= 2) return 'Weak';
//     if (passwordStrength <= 3) return 'Medium';
//     return 'Strong';
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="max-w-2xl mx-auto px-4 py-12">
//         <div className="mb-8">
//           <Link
//             to="/"
//             className="inline-flex items-center text-blue-600 hover:text-blue-500 font-medium"
//           >
//             <ArrowLeft className="w-4 h-4 mr-2" />
//             Back to Sign In
//           </Link>
//         </div>

//         <div className="bg-white rounded-2xl shadow-xl p-8">
//           <div className="text-center mb-8">
//             <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
//             <p className="text-gray-600 mt-2">Join TechHire Analytics and start your assessment journey</p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Full Name *
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.name}
//                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   placeholder="John Doe"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Email Address *
//                 </label>
//                 <input
//                   type="email"
//                   required
//                   value={formData.email}
//                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   placeholder="you@example.com"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Password *
//               </label>
//               <input
//                 type="password"
//                 required
//                 value={formData.password}
//                 onChange={(e) => handlePasswordChange(e.target.value)}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="••••••••"
//               />
//               {formData.password && (
//                 <div className="mt-2">
//                   <div className="flex items-center justify-between mb-1">
//                     <span className="text-xs text-gray-600">Password Strength</span>
//                     <span className={`text-xs font-medium ${
//                       passwordStrength <= 2 ? 'text-red-600' : 
//                       passwordStrength <= 3 ? 'text-yellow-600' : 'text-green-600'
//                     }`}>
//                       {getStrengthText()}
//                     </span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-2">
//                     <div
//                       className={`h-2 rounded-full transition-all ${getStrengthColor()}`}
//                       style={{ width: `${(passwordStrength / 5) * 100}%` }}
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Confirm Password *
//               </label>
//               <input
//                 type="password"
//                 required
//                 value={formData.confirmPassword}
//                 onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="••••••••"
//               />
//               {formData.confirmPassword && (
//                 <div className="mt-2 flex items-center">
//                   {formData.password === formData.confirmPassword ? (
//                     <div className="flex items-center text-green-600">
//                       <Check className="w-4 h-4 mr-1" />
//                       <span className="text-xs">Passwords match</span>
//                     </div>
//                   ) : (
//                     <div className="flex items-center text-red-600">
//                       <X className="w-4 h-4 mr-1" />
//                       <span className="text-xs">Passwords don't match</span>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Phone Number
//                 </label>
//                 <input
//                   type="tel"
//                   value={formData.phone}
//                   onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   placeholder="+1 (555) 000-0000"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Experience Level *
//                 </label>
//                 <select
//                   required
//                   value={formData.experienceLevel}
//                   onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as any })}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 >
//                   <option value="fresher">Fresher</option>
//                   <option value="1-3">1-3 Years</option>
//                   <option value="3+">3+ Years</option>
//                 </select>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Preferred Job Role *
//               </label>
//               <select
//                 required
//                 value={formData.preferredRole}
//                 onChange={(e) => setFormData({ ...formData, preferredRole: e.target.value })}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               >
//                 <option value="">Select a role</option>
//                 <option value="Frontend Developer">Frontend Developer</option>
//                 <option value="Backend Developer">Backend Developer</option>
//                 <option value="Full Stack Developer">Full Stack Developer</option>
//                 <option value="Mobile Developer">Mobile Developer</option>
//                 <option value="DevOps Engineer">DevOps Engineer</option>
//                 <option value="Data Scientist">Data Scientist</option>
//                 <option value="Product Manager">Product Manager</option>
//               </select>
//             </div>

//             <div className="flex items-center">
//               <input
//                 type="checkbox"
//                 id="terms"
//                 checked={formData.agreeToTerms}
//                 onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
//                 className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//               />
//               <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
//                 I agree to the{' '}
//                 <button type="button" className="text-blue-600 hover:text-blue-500">
//                   Terms and Conditions
//                 </button>{' '}
//                 and{' '}
//                 <button type="button" className="text-blue-600 hover:text-blue-500">
//                   Privacy Policy
//                 </button>
//               </label>
//             </div>

//             <button
//               type="submit"
//               className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               Create Account
//             </button>
//           </form>

//           <div className="mt-8 text-center">
//             <p className="text-gray-600">
//               Already have an account?{' '}
//               <Link to="/" className="text-blue-600 font-semibold hover:text-blue-500">
//                 Sign in here
//               </Link>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';  // ← ADD THIS
import { ArrowLeft, Check, X } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    experienceLevel: 'fresher' as const,
    preferredRole: '',
    agreeToTerms: false,
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { register, loading, error } = useAuth();  // ← ADD THIS
  const navigate = useNavigate();

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password });
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 SUBMITTING REGISTRATION');
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (!formData.agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    try {
      console.log('📡 Calling register...');
      
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        experienceLevel: formData.experienceLevel,
        preferredRole: formData.preferredRole
      });

      console.log('✅ Registration successful!');
      
      // Now login the user
      alert('Registration successful! Please log in.');
      navigate('/');
      
    } catch (err) {
      console.error('❌ Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      alert('Registration failed: ' + errorMessage);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-500 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
            <p className="text-gray-600 mt-2">Join TechHire Analytics and start your assessment journey</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ... rest of your form JSX stays the same ... */}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Password Strength</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength <= 2 ? 'text-red-600' : 
                      passwordStrength <= 3 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {getStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
              {formData.confirmPassword && (
                <div className="mt-2 flex items-center">
                  {formData.password === formData.confirmPassword ? (
                    <div className="flex items-center text-green-600">
                      <Check className="w-4 h-4 mr-1" />
                      <span className="text-xs">Passwords match</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <X className="w-4 h-4 mr-1" />
                      <span className="text-xs">Passwords don't match</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level *
                </label>
                <select
                  required
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="fresher">Fresher</option>
                  <option value="1-3">1-3 Years</option>
                  <option value="3+">3+ Years</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Job Role *
              </label>
              <select
                required
                value={formData.preferredRole}
                onChange={(e) => setFormData({ ...formData, preferredRole: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a role</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Mobile Developer">Mobile Developer</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Product Manager">Product Manager</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <button type="button" className="text-blue-600 hover:text-blue-500">
                  Terms and Conditions
                </button>{' '}
                and{' '}
                <button type="button" className="text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </button>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/" className="text-blue-600 font-semibold hover:text-blue-500">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
