import React, { useState } from 'react';
import { Users, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { GoogleSignIn } from './GoogleSignIn';
import { LanguageSwitch } from './LanguageSwitch';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export const LoginPage: React.FC = () => {
  const { isLoading } = useAuth();
  const { t } = useLanguage();
  const [error, setError] = useState<string>('');

  const handleSignInSuccess = () => {
    setError('');
    // Authentication context will handle the state change
    // and the app will automatically redirect to the main interface
  };

  const handleSignInError = (error: Error) => {
    console.error('Sign-in error:', error);
    setError(error.message || t('auth.authenticationFailed'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-600 rounded-2xl shadow-lg">
              <Users className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ReserveFlow</h1>
          <p className="text-gray-600">{t('nav.reservations')} Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">{t('auth.signInRequired')}</h2>
            </div>
            <p className="text-gray-600 text-sm">
              {t('auth.pleaseSignIn')}
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Google Sign In */}
          <div className="mb-6">
            <GoogleSignIn 
              onSuccess={handleSignInSuccess}
              onError={handleSignInError}
            />
          </div>

          {/* Features */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">{t('common.about')}:</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t('nav.reservations')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t('nav.dashboard')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t('nav.customers')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-amber-500" />
                <span>{t('nav.tableManagement')} ({t('auth.adminAccessRequired')})</span>
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700">
              <strong>{t('auth.secureAuth')}:</strong> {t('auth.secureAuth')}
            </p>
          </div>
        </div>

        {/* Language Switch */}
        <div className="flex justify-center mt-6">
          <LanguageSwitch />
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>{t('common.copyright')} 2024 ReserveFlow. {t('common.allRightsReserved')}.</p>
        </div>
      </div>
    </div>
  );
};