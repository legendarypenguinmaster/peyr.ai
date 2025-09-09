'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setRole } from '@/store/authSlice';
import AuthLayout from '@/components/auth/AuthLayout';
import { Check } from 'lucide-react';

export default function SelectRole() {
  const [selectedRole, setSelectedRole] = useState<'founder' | 'mentor' | 'investor' | null>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);

  const roles = [
    {
      id: 'founder' as const,
      title: 'Founder',
      emoji: '👩‍💻',
      description: 'Looking for co-founders to build your startup',
      features: ['Find technical co-founders', 'Connect with business partners', 'Build your team']
    },
    {
      id: 'mentor' as const,
      title: 'Mentor',
      emoji: '🧑‍🏫',
      description: 'Share your expertise with aspiring entrepreneurs',
      features: ['Guide startups', 'Share knowledge', 'Build your network']
    },
    {
      id: 'investor' as const,
      title: 'Investor',
      emoji: '💰',
      description: 'Invest in promising startups and founders',
      features: ['Discover opportunities', 'Track investments', 'Network with founders'],
      disabled: true
    }
  ];

  const handleRoleSelect = (role: 'founder' | 'mentor' | 'investor') => {
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    if (!selectedRole) return;
    
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    dispatch(setRole(selectedRole));
    router.push('/auth/onboarding');
  };

  return (
    <AuthLayout
      title="Choose Your Role"
      subtitle={`Welcome ${user?.firstName}! What brings you to Peyr.ai?`}
      footerText=""
      footerLink=""
      footerLinkText=""
    >
      <div className="space-y-6">
        <div className="grid gap-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                selectedRole === role.id
                  ? 'border-blue-500 bg-blue-50'
                  : role.disabled
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => !role.disabled && handleRoleSelect(role.id)}
            >
              {role.disabled && (
                <div className="absolute top-2 right-2">
                  <span className="bg-gray-400 text-white text-xs px-2 py-1 rounded-full">
                    Coming Soon
                  </span>
                </div>
              )}
              
              <div className="flex items-start space-x-4">
                <div className="text-4xl">{role.emoji}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {role.title}
                  </h3>
                  <p className="text-gray-600 mb-3">{role.description}</p>
                  <ul className="space-y-1">
                    {role.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-500 flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedRole || loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Continue'}
        </button>
      </div>
    </AuthLayout>
  );
}
