import Link from 'next/link';
import { Shield } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  footerText: string;
  footerLink: string;
  footerLinkText: string;
}

export default function AuthLayout({ 
  children, 
  title, 
  subtitle, 
  footerText, 
  footerLink, 
  footerLinkText 
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/" className="flex items-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Peyr.ai</h1>
              <p className="text-sm text-gray-600">Dream. Pair. Do.</p>
            </div>
          </Link>
        </div>

        {/* Title and Subtitle */}
        <div className="mt-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
        </div>
      </div>

      {/* Form Content */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          {footerText}{' '}
          <Link href={footerLink} className="font-medium text-blue-600 hover:text-blue-500">
            {footerLinkText}
          </Link>
        </p>
      </div>
    </div>
  );
}
