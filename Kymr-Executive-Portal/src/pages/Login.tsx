import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { Navigate } from 'react-router-dom';
import { Button, Input } from '../components/ui/DesignSystem';
import { ArrowRight, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const { user, isAuthorized, signInWithGoogle, signInWithEmail, resetPassword, loading, authError, clearError, logOut } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (authError) {
      setIsSubmitting(false);
    }
  }, [authError]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <div className="w-12 h-12 border-t-2 border-brand-ivory rounded-full animate-spin"></div>
      </div>
    );
  }

  // Only redirect if they are both authenticated AND authorized
  if (user && isAuthorized === true) {
    return <Navigate to="/admin" replace />;
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    await signInWithEmail(email, password);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err) {
      // Error handled by context
    }
    setIsSubmitting(false);
  };
  
  const handleSwitchAccount = async () => {
    await logOut();
    clearError();
  };

  const mapAuthError = (err: string) => {
    if (err === 'ACCESS_DENIED') return 'This account does not have access to the KymrStudio Executive Portal.';
    if (err.includes('auth/invalid-credential')) return 'Incorrect email or password.';
    if (err.includes('auth/user-not-found')) return 'Account not found.';
    if (err.includes('auth/too-many-requests')) return 'Too many failed attempts. Try again later.';
    return err;
  };

  return (
    <div className="min-h-screen bg-brand-black text-brand-ivory flex font-sans">
      
      {/* LEFT SIDE - EDITORIAL */}
      <div className="hidden lg:flex w-1/2 p-16 flex-col justify-between border-r border-brand-border">
        <div>
          <h1 className="text-4xl tracking-[0.2em] font-display uppercase leading-tight">
            KymrStudio.
            <br />
            <span className="text-brand-muted">Executive</span>
            <br />
            <span className="text-brand-muted">Portal</span>
          </h1>
        </div>
        <div>
          <p className="text-brand-muted font-mono text-xs uppercase tracking-widest">
            The operating system behind KymrStudio.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative">
        <div className="w-full max-w-sm">
          
          <div className="lg:hidden mb-12">
            <h1 className="text-2xl tracking-[0.2em] font-display uppercase leading-tight">
              KymrStudio.
              <br />
              <span className="text-brand-muted">Executive Portal</span>
            </h1>
          </div>

          <AnimatePresence mode="wait">
            {user && isAuthorized === false ? (
              <motion.div
                key="denied"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-display uppercase tracking-widest mb-4">Access Denied</h2>
                <p className="text-brand-muted mb-8 text-sm">
                  This account does not have access to the KymrStudio Executive Portal.
                </p>
                <Button variant="outline" onClick={handleSwitchAccount} className="w-full h-12">
                  Use Another Account
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-display uppercase tracking-widest mb-8">
                  {view === 'login' ? 'Welcome Back' : 'Reset Password'}
                </h2>

                {authError && authError !== 'ACCESS_DENIED' && (
                  <div className="mb-6 p-4 border border-brand-accent/50 bg-brand-accent/10 text-brand-ivory text-sm">
                    {mapAuthError(authError)}
                  </div>
                )}

                {view === 'login' ? (
                  <form onSubmit={handleEmailLogin} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-brand-muted mb-2">Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-transparent border-b border-brand-border py-2 focus:outline-none focus:border-brand-accent transition-colors font-sans text-brand-ivory placeholder-brand-border"
                          placeholder="name@kymrstudio.com"
                          required
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-[10px] font-mono uppercase tracking-widest text-brand-muted">Password</label>
                          <button type="button" onClick={() => { setView('forgot'); clearError(); }} className="text-[10px] font-mono uppercase tracking-widest text-brand-muted hover:text-brand-ivory transition-colors">
                            Forgot?
                          </button>
                        </div>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-transparent border-b border-brand-border py-2 focus:outline-none focus:border-brand-accent transition-colors font-sans text-brand-ivory placeholder-brand-border"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSubmitting || !email || !password}
                      className="w-full h-12 flex justify-between items-center"
                    >
                      <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>

                    <div className="relative py-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-brand-border"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-brand-black px-4 text-[10px] font-mono uppercase tracking-widest text-brand-muted">Or</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setIsSubmitting(true); signInWithGoogle(); }}
                      disabled={isSubmitting}
                      className="w-full h-12"
                      icon={Mail}
                    >
                      Continue with Google
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-6">
                    {resetSent ? (
                      <div className="space-y-6">
                        <div className="p-4 border border-brand-border bg-brand-charcoal text-brand-ivory text-sm">
                          Reset link sent. Check your inbox for instructions to reset your password.
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => { setView('login'); setResetSent(false); clearError(); }}
                          className="w-full h-12"
                        >
                          Return to Login
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-brand-muted mb-6">
                          Enter your email address and we will send you a link to reset your password.
                        </p>
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-widest text-brand-muted mb-2">Email</label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-transparent border-b border-brand-border py-2 focus:outline-none focus:border-brand-accent transition-colors font-sans text-brand-ivory placeholder-brand-border"
                            placeholder="name@kymrstudio.com"
                            required
                          />
                        </div>

                        <div className="flex gap-4 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => { setView('login'); clearError(); }}
                            className="flex-1 h-12"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting || !email}
                            className="flex-1 h-12"
                          >
                            {isSubmitting ? 'Sending...' : 'Send Link'}
                          </Button>
                        </div>
                      </>
                    )}
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
