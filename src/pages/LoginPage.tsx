import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await authService.login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div id="login-page" className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-10">
          <h1 id="login-title" className="text-4xl font-bold tracking-tight mb-3">Welcome Back</h1>
          <p className="text-zinc-500">Enter your details to access your account.</p>
        </div>

        <form id="login-form" className="space-y-4" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 ml-1">Email Address</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full h-14 rounded-2xl bg-zinc-50 border-transparent focus:bg-white focus:border-zinc-900 focus:ring-0 transition-all px-6"
            />
          </div>
          <div className="form-group">
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 ml-1">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-14 rounded-2xl bg-zinc-50 border-transparent focus:bg-white focus:border-zinc-900 focus:ring-0 transition-all px-6"
            />
          </div>
          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 text-white h-14 rounded-2xl font-bold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-zinc-500">
          Don't have an account?{' '}
          <Link to="/login" className="text-zinc-900 font-bold hover:underline underline-offset-4">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

