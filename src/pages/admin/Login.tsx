import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { Eye, EyeOff, Shield, AlertTriangle, Loader, Database, CheckCircle, UserPlus, Mail, Lock, User } from 'lucide-react';
import SEOHead from '../../components/SEOHead';
import ModernCard from '../../components/ModernCard';
import ModernButton from '../../components/ModernButton';

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'editor' as 'admin' | 'editor'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const { login, loading: authLoading, error: authError, isAuthenticated } = useAuth();
  const { isConnected, connectionError } = useDatabase();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateLoginForm = () => {
    const errors: Record<string, string> = {};
    
    if (!loginData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!loginData.password) {
      errors.password = 'Password is required';
    } else if (loginData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = () => {
    const errors: Record<string, string> = {};
    
    if (!registerData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (registerData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!registerData.username.trim()) {
      errors.username = 'Username is required';
    } else if (registerData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(registerData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }
    
    if (!registerData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!registerData.password) {
      errors.password = 'Password is required';
    } else if (registerData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) return;
    
    setIsLoading(true);
    setValidationErrors({});

    try {
      const success = await login(loginData.email, loginData.password);
      if (success) {
        navigate('/admin');
      }
    } catch (err) {
      console.error('Login submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRegisterForm()) return;
    
    setIsLoading(true);
    setValidationErrors({});

    try {
      const { supabase } = await import('../../lib/supabase');
      
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            name: registerData.name,
            username: registerData.username,
            role: registerData.role
          }
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Create user profile in users table
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          username: registerData.username,
          email: registerData.email,
          name: registerData.name,
          role: registerData.role,
          status: 'active',
          password_hash: 'managed_by_supabase_auth'
        }]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't throw error here as auth user was created successfully
      }

      alert('Account created successfully! Please check your email for verification.');
      setActiveTab('login');
      setRegisterData({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'editor'
      });
    } catch (error) {
      console.error('Registration error:', error);
      setValidationErrors({ 
        form: error instanceof Error ? error.message : 'Registration failed. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    formType: 'login' | 'register'
  ) => {
    const { name, value } = e.target;
    
    if (formType === 'login') {
      setLoginData(prev => ({ ...prev, [name]: value }));
    } else {
      setRegisterData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const isFormLoading = isLoading || authLoading;

  return (
    <>
      <SEOHead
        title="Admin Login - MDRRMO Pio Duran"
        description="Secure admin access to MDRRMO Pio Duran management system"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-yellow-500 p-4 rounded-full shadow-lg animate-pulse-glow">
                <Shield className="h-12 w-12 text-blue-950" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">MDRRMO Admin</h1>
            <p className="text-blue-200">Municipal Disaster Risk Reduction & Management Office</p>
            <p className="text-blue-300 text-sm mt-1">Pio Duran, Albay</p>
          </div>

          {/* Connection Status */}
          {!isConnected && (
            <ModernCard className="mb-6 p-4 bg-red-50 border border-red-200">
              <div className="flex items-start">
                <Database className="text-red-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <h4 className="text-red-800 font-medium mb-1">Database Connection Issue</h4>
                  <p className="text-red-600 text-sm">
                    {connectionError || 'Unable to connect to database. Some features may not work properly.'}
                  </p>
                  <Link 
                    to="/admin/setup" 
                    className="text-red-600 hover:text-red-800 text-sm font-medium underline mt-2 inline-block"
                  >
                    Setup Database Connection →
                  </Link>
                </div>
              </div>
            </ModernCard>
          )}

          {/* Auth Form */}
          <ModernCard variant="glass" className="p-8 shadow-2xl">
            {/* Tab Navigation */}
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  activeTab === 'login'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  activeTab === 'register'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Register
              </button>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {activeTab === 'login' ? 'Sign In to Dashboard' : 'Create Admin Account'}
            </h2>

            {/* Error Display */}
            {(authError || validationErrors.form) && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertTriangle className="text-red-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <h4 className="text-red-800 font-medium mb-1">Authentication Error</h4>
                  <p className="text-red-600 text-sm">{authError || validationErrors.form}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline w-4 h-4 mr-2" />
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => handleInputChange(e, 'login')}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      validationErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email address"
                    required
                    disabled={isFormLoading}
                    autoComplete="email"
                  />
                  {validationErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="inline w-4 h-4 mr-2" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={loginData.password}
                      onChange={(e) => handleInputChange(e, 'login')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-12 ${
                        validationErrors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your password"
                      required
                      disabled={isFormLoading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                      disabled={isFormLoading}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                  )}
                </div>

                <ModernButton
                  type="submit"
                  disabled={isFormLoading || !isConnected}
                  loading={isFormLoading}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  {isFormLoading ? 'Signing In...' : 'Sign In'}
                </ModernButton>
              </form>
            )}

            {/* Register Form */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline w-4 h-4 mr-2" />
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={registerData.name}
                      onChange={(e) => handleInputChange(e, 'register')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        validationErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                      required
                      disabled={isFormLoading}
                    />
                    {validationErrors.name && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={registerData.username}
                      onChange={(e) => handleInputChange(e, 'register')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        validationErrors.username ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Choose a username"
                      required
                      disabled={isFormLoading}
                    />
                    {validationErrors.username && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.username}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline w-4 h-4 mr-2" />
                    Email Address
                  </label>
                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => handleInputChange(e, 'register')}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      validationErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email address"
                    required
                    disabled={isFormLoading}
                    autoComplete="email"
                  />
                  {validationErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={registerData.role}
                    onChange={(e) => handleInputChange(e, 'register')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    disabled={isFormLoading}
                  >
                    <option value="editor">Editor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="inline w-4 h-4 mr-2" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="register-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={registerData.password}
                      onChange={(e) => handleInputChange(e, 'register')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-12 ${
                        validationErrors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Create a password"
                      required
                      disabled={isFormLoading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                      disabled={isFormLoading}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={registerData.confirmPassword}
                      onChange={(e) => handleInputChange(e, 'register')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-12 ${
                        validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Confirm your password"
                      required
                      disabled={isFormLoading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                      disabled={isFormLoading}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.confirmPassword}</p>
                  )}
                </div>

                <ModernButton
                  type="submit"
                  disabled={isFormLoading || !isConnected}
                  loading={isFormLoading}
                  variant="success"
                  size="lg"
                  icon={UserPlus}
                  className="w-full"
                >
                  {isFormLoading ? 'Creating Account...' : 'Create Account'}
                </ModernButton>
              </form>
            )}

            {/* Connection Status */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start">
                {isConnected ? (
                  <CheckCircle className="text-green-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
                ) : (
                  <Database className="text-red-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
                )}
                <div>
                  <h3 className="text-sm font-medium text-blue-800 mb-1">
                    {isConnected ? 'Database Connected' : 'Database Offline'}
                  </h3>
                  <p className="text-xs text-blue-700">
                    {isConnected 
                      ? 'Authentication system is online and ready'
                      : 'Please configure Supabase connection to enable authentication'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Demo Credentials (only show if connected) */}
            {isConnected && activeTab === 'login' && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start">
                  <Shield className="text-green-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <h3 className="text-sm font-medium text-green-800 mb-1">Demo Credentials</h3>
                    <div className="text-xs text-green-700 space-y-1">
                      <p><strong>Admin:</strong> admin@mdrrmo.gov.ph / admin123</p>
                      <p><strong>Director:</strong> director@mdrrmo.gov.ph / admin123</p>
                      <p><strong>Operations:</strong> operations@mdrrmo.gov.ph / admin123</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Registration Info */}
            {activeTab === 'register' && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start">
                  <UserPlus className="text-yellow-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800 mb-1">Account Registration</h3>
                    <div className="text-xs text-yellow-700 space-y-1">
                      <p>• First registered user automatically becomes Administrator</p>
                      <p>• Email verification may be required</p>
                      <p>• Account will be active immediately after creation</p>
                      <p>• You can change your password after first login</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ModernCard>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-blue-200 text-sm">
              © 2025 MDRRMO Pio Duran, Albay. All rights reserved.
            </p>
            <div className="mt-2">
              <Link 
                to="/" 
                className="text-blue-300 hover:text-white text-sm underline"
              >
                ← Back to Website
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;