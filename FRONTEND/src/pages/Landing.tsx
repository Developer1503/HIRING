// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth';
// import { useApp } from '../contexts/AppContext';
// import { ArrowRight, CheckCircle, Code, Brain, Mic, Shield, Zap, Trophy } from 'lucide-react';

// export default function Landing() {
//   const [formData, setFormData] = useState({ email: '', password: '' });
//   const { login, loading, error } = useAuth(); 
//   const navigate = useNavigate();

//   const handleLogin = (e: React.FormEvent) => {
//     e.preventDefault();
//     // Mock login
//     const mockUser = {
//       id: '1',
//       name: 'John Doe',
//       email: formData.email,
//       experienceLevel: '1-3' as const,
//       preferredRole: 'Full Stack Developer'
//     };
//     dispatch({ type: 'SET_USER', payload: mockUser });
//     navigate('/dashboard');
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//       {/* Header */}
//       <header className="relative z-10 bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-6">
//             <div className="flex items-center space-x-2">
//               <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
//                 <span className="text-white font-bold text-lg">TH</span>
//               </div>
//               <span className="text-2xl font-bold text-gray-900">TechHire Analytics</span>
//             </div>
//             <Link
//               to="/register"
//               className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
//             >
//               Create Account
//             </Link>
//           </div>
//         </div>
//       </header>

//       <div className="relative">
//         {/* Hero Section */}
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//             <div>
//               <h1 className="text-5xl font-bold text-gray-900 leading-tight">
//                 Master Your
//                 <span className="text-blue-600"> Technical Interview</span>
//                 Skills
//               </h1>
//               <p className="mt-6 text-xl text-gray-600 leading-relaxed">
//                 Comprehensive assessment platform featuring coding challenges, aptitude tests, 
//                 and mock interviews with AI-powered analytics to identify your strengths and areas for improvement.
//               </p>
              
//               <div className="mt-8 flex flex-col sm:flex-row gap-4">
//                 <button className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
//                   Start Assessment
//                   <ArrowRight className="ml-2 w-5 h-5" />
//                 </button>
//                 <button className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
//                   View Demo
//                 </button>
//               </div>

//               <div className="mt-12 grid grid-cols-3 gap-8">
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-blue-600">10K+</div>
//                   <div className="text-sm text-gray-600">Assessments Taken</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-blue-600">95%</div>
//                   <div className="text-sm text-gray-600">Success Rate</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-blue-600">24/7</div>
//                   <div className="text-sm text-gray-600">Available</div>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-2xl shadow-xl p-8">
//               <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign In to Your Account</h2>
//               <form onSubmit={handleLogin} className="space-y-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Email Address
//                   </label>
//                   <input
//                     type="email"
//                     required
//                     value={formData.email}
//                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     placeholder="you@example.com"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Password
//                   </label>
//                   <input
//                     type="password"
//                     required
//                     value={formData.password}
//                     onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     placeholder="••••••••"
//                   />
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <label className="flex items-center">
//                     <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
//                     <span className="ml-2 text-sm text-gray-600">Remember me</span>
//                   </label>
//                   <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
//                     Forgot password?
//                   </Link>
//                 </div>
//                 <button
//                   type="submit"
//                   className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   Sign In
//                 </button>
//               </form>
              
//               <p className="mt-6 text-center text-sm text-gray-600">
//                 Don't have an account?{' '}
//                 <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-500">
//                   Create one here
//                 </Link>
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Features Section */}
//         <div className="bg-white py-16">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="text-center mb-16">
//               <h2 className="text-3xl font-bold text-gray-900">
//                 Comprehensive Assessment Process
//               </h2>
//               <p className="mt-4 text-xl text-gray-600">
//                 Three specialized rounds to evaluate your complete skill set
//               </p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//               <div className="text-center p-8 rounded-2xl bg-blue-50 border border-blue-100">
//                 <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
//                   <Code className="w-8 h-8 text-white" />
//                 </div>
//                 <h3 className="text-xl font-bold text-gray-900 mb-4">DSA Round</h3>
//                 <p className="text-gray-600 mb-6">
//                   10 coding problems covering data structures, algorithms, and problem-solving skills
//                 </p>
//                 <ul className="space-y-2 text-sm text-gray-600">
//                   <li className="flex items-center">
//                     <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
//                     Multiple programming languages
//                   </li>
//                   <li className="flex items-center">
//                     <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
//                     Real-time code execution
//                   </li>
//                   <li className="flex items-center">
//                     <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
//                     Time complexity analysis
//                   </li>
//                 </ul>
//               </div>

//               <div className="text-center p-8 rounded-2xl bg-emerald-50 border border-emerald-100">
//                 <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
//                   <Brain className="w-8 h-8 text-white" />
//                 </div>
//                 <h3 className="text-xl font-bold text-gray-900 mb-4">Aptitude Test</h3>
//                 <p className="text-gray-600 mb-6">
//                   25 questions testing quantitative, logical, and verbal reasoning abilities
//                 </p>
//                 <ul className="space-y-2 text-sm text-gray-600">
//                   <li className="flex items-center">
//                     <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
//                     Category-wise analysis
//                   </li>
//                   <li className="flex items-center">
//                     <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
//                     Time management tracking
//                   </li>
//                   <li className="flex items-center">
//                     <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
//                     Detailed explanations
//                   </li>
//                 </ul>
//               </div>

//               <div className="text-center p-8 rounded-2xl bg-purple-50 border border-purple-100">
//                 <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
//                   <Mic className="w-8 h-8 text-white" />
//                 </div>
//                 <h3 className="text-xl font-bold text-gray-900 mb-4">Interview Round</h3>
//                 <p className="text-gray-600 mb-6">
//                   8 voice-recorded questions covering technical, behavioral, and HR topics
//                 </p>
//                 <ul className="space-y-2 text-sm text-gray-600">
//                   <li className="flex items-center">
//                     <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
//                     Communication analysis
//                   </li>
//                   <li className="flex items-center">
//                     <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
//                     Response quality scoring
//                   </li>
//                   <li className="flex items-center">
//                     <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
//                     Speaking pace optimization
//                   </li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Benefits Section */}
//         <div className="bg-gray-50 py-16">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="text-center mb-16">
//               <h2 className="text-3xl font-bold text-gray-900">
//                 Why Choose TechHire Analytics?
//               </h2>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//               <div className="flex items-start space-x-4">
//                 <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                   <Shield className="w-6 h-6 text-blue-600" />
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900 mb-2">Identify Weaknesses</h3>
//                   <p className="text-gray-600">
//                     Get detailed insights into your skill gaps with AI-powered analysis and personalized feedback.
//                   </p>
//                 </div>
//               </div>

//               <div className="flex items-start space-x-4">
//                 <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                   <Zap className="w-6 h-6 text-emerald-600" />
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Personalized Feedback</h3>
//                   <p className="text-gray-600">
//                     Receive customized improvement recommendations based on your performance patterns.
//                   </p>
//                 </div>
//               </div>

//               <div className="flex items-start space-x-4">
//                 <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                   <Trophy className="w-6 h-6 text-purple-600" />
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Progress</h3>
//                   <p className="text-gray-600">
//                     Monitor your improvement over time with comprehensive analytics and progress tracking.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';  // ← MUST HAVE THIS
import { ArrowRight, CheckCircle, Code, Brain, Mic, Shield, Zap, Trophy } from 'lucide-react';

export default function Landing() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, loading, error } = useAuth();  // ← MUST HAVE THIS
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔑 LOGIN BUTTON CLICKED');
    console.log('📧 Email:', formData.email);
    console.log('🔒 Password:', formData.password ? '***' : 'empty');
    
    try {
      console.log('📡 Calling login API...');
      await login({ email: formData.email, password: formData.password });
      console.log('✅ Login successful!');
      navigate('/dashboard');
    } catch (err) {
      console.error('❌ Login error:', err);
      alert('Login failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="relative z-10 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">TH</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">TechHire Analytics</span>
            </div>
            <Link
              to="/register"
              className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      <div className="relative">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                Master Your
                <span className="text-blue-600"> Technical Interview</span>
                Skills
              </h1>
              <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                Comprehensive assessment platform featuring coding challenges, aptitude tests, 
                and mock interviews with AI-powered analytics to identify your strengths and areas for improvement.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  Start Assessment
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
                <button className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                  View Demo
                </button>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">10K+</div>
                  <div className="text-sm text-gray-600">Assessments Taken</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">95%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">24/7</div>
                  <div className="text-sm text-gray-600">Available</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign In to Your Account</h2>
              
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                    Forgot password?
                  </Link>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
              
              <p className="mt-6 text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-500">
                  Create one here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Rest of your landing page content stays the same */}
        {/* Features Section */}
        <div className="bg-white py-16">
          {/* ... your existing features code ... */}
        </div>

        {/* Benefits Section */}
        <div className="bg-gray-50 py-16">
          {/* ... your existing benefits code ... */}
        </div>
      </div>
    </div>
  );
}
