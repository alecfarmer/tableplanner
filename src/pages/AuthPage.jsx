import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, Heart, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function AuthPage() {
  const { user, signInWithEmail, signUpWithEmail, signInWithMagicLink, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = useMemo(() => {
    const r = searchParams.get('redirect');
    // Only allow relative paths to prevent open redirect
    return r && r.startsWith('/') ? r : '/events';
  }, [searchParams]);
  const [mode, setMode] = useState('login'); // login | signup | magic
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  useEffect(() => {
    document.title = 'Sign In — TablePlanner';
  }, []);

  useEffect(() => {
    if (user) navigate(redirectTo, { replace: true });
  }, [user, navigate, redirectTo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'magic') {
        await signInWithMagicLink(email);
        setMagicLinkSent(true);
      } else if (mode === 'signup') {
        await signUpWithEmail(email, password);
        navigate(redirectTo);
      } else {
        await signInWithEmail(email, password);
        navigate(redirectTo);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signInWithGoogle(redirectTo);
    } catch (err) {
      setError(err.message);
    }
  };

  if (magicLinkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-navy mb-3">Check your email</h1>
          <p className="text-gray-500 mb-6">
            We sent a magic link to <strong>{email}</strong>. Click the link to sign in.
          </p>
          <button
            onClick={() => { setMagicLinkSent(false); setMode('login'); }}
            className="text-sm text-teal hover:text-teal-dark font-medium cursor-pointer"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Heart size={20} className="text-teal" fill="#0d9488" />
            <span className="font-serif text-xl font-bold text-navy">TablePlanner</span>
          </Link>
          <h1 className="font-serif text-2xl font-bold text-navy">
            {mode === 'signup' ? 'Create account' : 'Welcome back'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'signup'
              ? 'Sign up to save your events across devices'
              : 'Sign in to access your events'}
          </p>
        </div>

        {/* Google OAuth */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer mb-4"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-surface px-3 text-gray-400">or</span>
          </div>
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="input-field pl-9"
                required
              />
            </div>
          </div>

          {mode !== 'magic' && (
            <div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="input-field pl-9"
                  required
                  minLength={6}
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-coral bg-coral/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                {mode === 'magic' ? 'Send Magic Link' : mode === 'signup' ? 'Create Account' : 'Sign In'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Mode switchers */}
        <div className="mt-4 text-center space-y-2">
          {mode === 'login' && (
            <>
              <button
                onClick={() => setMode('magic')}
                className="text-xs text-gray-500 hover:text-teal cursor-pointer block mx-auto"
              >
                Sign in with magic link instead
              </button>
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <button onClick={() => setMode('signup')} className="text-teal font-medium cursor-pointer">
                  Sign up
                </button>
              </p>
            </>
          )}
          {mode === 'signup' && (
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-teal font-medium cursor-pointer">
                Sign in
              </button>
            </p>
          )}
          {mode === 'magic' && (
            <button
              onClick={() => setMode('login')}
              className="text-sm text-gray-500 hover:text-teal cursor-pointer"
            >
              Back to password sign in
            </button>
          )}
        </div>

        {/* Back to app */}
        <div className="mt-8 text-center">
          <Link to="/app" className="text-xs text-gray-400 hover:text-gray-600">
            Continue without an account (free tier)
          </Link>
        </div>
      </div>
    </div>
  );
}
