import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

export default function LoginPage({ onLogin, onNavigateSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        // Fetch user info from Google using the access token
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();
        
        // Send user info to our backend to create/update user
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: userInfo }),
        });
        const data = await res.json();
        
        if (data.success) {
          showMessage('Authentication successful. Redirecting...');
          setTimeout(() => {
            setIsLoading(false);
            onLogin(data.user);
          }, 1000);
        } else {
          showMessage('Authentication failed.', 'error');
          setIsLoading(false);
        }
      } catch (error) {
        console.error(error);
        showMessage('Network error during login.', 'error');
        setIsLoading(false);
      }
    },
    onError: errorResponse => {
        console.log(errorResponse);
        showMessage('Google Login Failed', 'error');
    },
  });



  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        showMessage('Authentication successful. Redirecting...');
        setTimeout(() => {
          setIsLoading(false);
          onLogin(data.user);
        }, 1000);
      } else {
        showMessage(data.message || 'Login failed.', 'error');
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      showMessage('Network error during login.', 'error');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#15181e]" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header / Logo */}
      <div className="absolute top-8 left-8 z-30 flex items-center gap-2">
        <img src="/logo.png" className="w-8 h-8" alt="Logo" />
        <span className="text-xl font-bold tracking-tight text-white">Paperbase</span>
        <nav className="ml-12 hidden md:flex gap-8 text-sm font-medium text-gray-400">
          <a href="#" className="hover:text-white transition-colors">Home</a>
        </nav>
      </div>

      {/* Left Form Side */}
      <div className="flex-1 p-8 md:p-16 flex flex-col justify-center z-20" style={{ maxWidth: '650px' }}>
        <div className="max-w-md w-full">
          <span className="text-gray-500 uppercase tracking-widest text-xs font-bold mb-4 block">Welcome Back</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-white">
            Sign in to Paperbase<span className="text-blue-500">.</span>
          </h1>
          <p className="text-gray-400 mb-10">
            New Member?{' '}
            <button
              onClick={onNavigateSignup}
              className="text-blue-500 underline underline-offset-4 font-medium hover:text-blue-400 transition-colors bg-transparent border-none cursor-pointer"
            >
              Sign up
            </button>
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 ml-1">EMAIL ADDRESS</label>
              <div className="flex items-center px-3 rounded-xl bg-[#22262e] border border-[#333942] focus-within:border-blue-500 focus-within:shadow-[0_0_0_2px_rgba(59,130,246,0.2)] transition-all">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-white py-4 px-1 placeholder:text-gray-600"
                  placeholder="e.g. alex@company.com"
                />
                <svg className="w-5 h-5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-semibold text-gray-500">PASSWORD</label>
                <button type="button" className="text-blue-500 underline underline-offset-4 text-xs font-medium hover:text-blue-400 transition-colors bg-transparent border-none cursor-pointer">
                  Forgot?
                </button>
              </div>
              <div className="flex items-center px-3 rounded-xl bg-[#22262e] border border-[#333942] focus-within:border-blue-500 focus-within:shadow-[0_0_0_2px_rgba(59,130,246,0.2)] transition-all">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-white py-4 px-1 placeholder:text-gray-600"
                  placeholder="••••••••"
                />
                <svg className="w-5 h-5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => googleLogin()}
                className="flex-1 py-4 px-8 rounded-full bg-[#333942] border border-[#444b55] text-white font-semibold hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-4 px-10 rounded-full bg-blue-500 text-white font-semibold hover:brightness-110 transition-all shadow-[0_4px_15px_rgba(59,130,246,0.3)] active:scale-[0.98] disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Image Side */}
      <div
        className="absolute top-0 right-0 h-full hidden lg:block"
        style={{
          width: '55%',
          background: "url('https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=80&w=2070') no-repeat center center",
          backgroundSize: 'cover',
          zIndex: 10,
        }}
      >
        {/* Dark gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #15181e 0%, rgba(15, 23, 42, 0.7) 100%)' }} />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            zIndex: 15,
          }}
        />

        {/* Wave divider */}
        <svg
          className="absolute top-0 h-full pointer-events-none"
          style={{ left: '-1px', width: '150px', fill: '#15181e' }}
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <path d="M100 0 C 40 30, 40 70, 100 100 L 0 100 L 0 0 Z" />
        </svg>

        {/* Hero text */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center px-12 sm:px-20 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-2xl max-w-xl pl-10 tracking-tight">
            Welcome to India's fastest-growing educational archive.
          </h2>
        </div>

        {/* Watermark */}
        <img
          src="/logo.png"
          className="absolute bottom-10 right-10 w-12 opacity-80 brightness-0 invert"
          style={{ zIndex: 30 }}
          alt=""
        />
      </div>

      {/* Notification Toast */}
      {message && (
        <div
          className={`fixed top-8 right-8 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 bg-gray-800 border ${
            message.type === 'success' ? 'border-blue-500/50' : 'border-red-500/50'
          }`}
          style={{ animation: 'toastSlideIn 0.3s ease-out' }}
        >
          {message.type === 'success' ? (
            <svg className="w-6 h-6 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <div className="text-sm font-medium text-white">{message.text}</div>
        </div>
      )}
    </div>
  );
}
