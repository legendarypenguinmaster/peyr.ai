'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import FormField from '@/components/auth/FormField';
import SubmitButton from '@/components/auth/SubmitButton';
import { CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Reset password for:', email);
    setEmailSent(true);
    setLoading(false);
  };

  if (emailSent) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We've sent you a password reset link."
        footerText="Remember your password?"
        footerLink="/auth/sign-in"
        footerLinkText="Sign in"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Email sent successfully!</h3>
          <p className="text-sm text-gray-600 mb-6">
            We've sent a password reset link to <strong>{email}</strong>. 
            Please check your email and follow the instructions to reset your password.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setEmailSent(false);
                setEmail('');
              }}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Send another email
            </button>
            <Link
              href="/auth/sign-in"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="No worries, we'll send you reset instructions."
      footerText="Remember your password?"
      footerLink="/auth/sign-in"
      footerLinkText="Sign in"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <FormField
          label="Email address"
          type="email"
          name="email"
          placeholder="Enter your email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <SubmitButton text="Send reset link" loading={loading} />

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Didn't receive the email? Check your spam folder or{' '}
            <button
              type="button"
              onClick={() => {
                setEmailSent(false);
                setEmail('');
              }}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              try again
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
