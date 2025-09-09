'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setProfile } from '@/store/authSlice';
import AuthLayout from '@/components/auth/AuthLayout';
import FormField from '@/components/auth/FormField';
import { Clock } from 'lucide-react';

export default function Onboarding() {
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, role } = useAppSelector((state) => state.auth);

  // Founder form state
  const [founderForm, setFounderForm] = useState({
    skills: '',
    goals: '',
    experience: '',
    location: ''
  });

  // Mentor form state
  const [mentorForm, setMentorForm] = useState({
    expertise: '',
    yearsOfExperience: '',
    availability: ''
  });

  const handleFounderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFounderForm({
      ...founderForm,
      [e.target.name]: e.target.value
    });
  };

  const handleMentorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setMentorForm({
      ...mentorForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let profileData;
    if (role === 'founder') {
      profileData = {
        skills: founderForm.skills.split(',').map(s => s.trim()).filter(s => s),
        goals: founderForm.goals,
        experience: founderForm.experience,
        location: founderForm.location
      };
    } else if (role === 'mentor') {
      profileData = {
        expertise: mentorForm.expertise.split(',').map(s => s.trim()).filter(s => s),
        yearsOfExperience: parseInt(mentorForm.yearsOfExperience),
        availability: mentorForm.availability
      };
    }
    
    dispatch(setProfile(profileData));
    router.push('/auth/review');
  };

  const renderFounderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
          Skills & Technologies <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <input
            id="skills"
            name="skills"
            type="text"
            placeholder="e.g., React, Node.js, Python, Marketing, Sales"
            required
            value={founderForm.skills}
            onChange={handleFounderChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">Separate multiple skills with commas</p>
        </div>
      </div>

      <div>
        <label htmlFor="goals" className="block text-sm font-medium text-gray-700">
          What are your goals? <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <textarea
            id="goals"
            name="goals"
            rows={3}
            placeholder="Describe what you want to achieve and what kind of co-founder you're looking for..."
            required
            value={founderForm.goals}
            onChange={handleFounderChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
          Experience Level <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <select
            id="experience"
            name="experience"
            required
            value={founderForm.experience}
            onChange={handleFounderChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select your experience level</option>
            <option value="beginner">Beginner (0-2 years)</option>
            <option value="intermediate">Intermediate (2-5 years)</option>
            <option value="experienced">Experienced (5-10 years)</option>
            <option value="expert">Expert (10+ years)</option>
          </select>
        </div>
      </div>

      <FormField
        label="Location"
        type="text"
        name="location"
        placeholder="e.g., San Francisco, CA"
        required
        value={founderForm.location}
        onChange={handleFounderChange}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Continue'}
      </button>
    </form>
  );

  const renderMentorForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="expertise" className="block text-sm font-medium text-gray-700">
          Areas of Expertise <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <input
            id="expertise"
            name="expertise"
            type="text"
            placeholder="e.g., Product Management, Marketing, Finance, Technology"
            required
            value={mentorForm.expertise}
            onChange={handleMentorChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">Separate multiple areas with commas</p>
        </div>
      </div>

      <div>
        <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700">
          Years of Experience <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <select
            id="yearsOfExperience"
            name="yearsOfExperience"
            required
            value={mentorForm.yearsOfExperience}
            onChange={handleMentorChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select years of experience</option>
            <option value="5">5+ years</option>
            <option value="10">10+ years</option>
            <option value="15">15+ years</option>
            <option value="20">20+ years</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
          Availability <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <select
            id="availability"
            name="availability"
            required
            value={mentorForm.availability}
            onChange={handleMentorChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select your availability</option>
            <option value="1-2 hours/week">1-2 hours per week</option>
            <option value="3-5 hours/week">3-5 hours per week</option>
            <option value="5-10 hours/week">5-10 hours per week</option>
            <option value="10+ hours/week">10+ hours per week</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Continue'}
      </button>
    </form>
  );

  const renderInvestorForm = () => (
    <div className="text-center py-8">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
        <Clock className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
      <p className="text-gray-600 mb-6">
        Investor features are currently under development. We'll notify you when they're ready!
      </p>
      <button
        onClick={() => router.push('/auth/review')}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Continue
      </button>
    </div>
  );

  const getTitle = () => {
    switch (role) {
      case 'founder':
        return 'Tell us about yourself';
      case 'mentor':
        return 'Share your expertise';
      case 'investor':
        return 'Investor Setup';
      default:
        return 'Complete your profile';
    }
  };

  const getSubtitle = () => {
    switch (role) {
      case 'founder':
        return 'Help us match you with the perfect co-founder';
      case 'mentor':
        return 'Let founders know how you can help them';
      case 'investor':
        return 'Investor features coming soon';
      default:
        return 'Complete your profile setup';
    }
  };

  return (
    <AuthLayout
      title={getTitle()}
      subtitle={getSubtitle()}
      footerText=""
      footerLink=""
      footerLinkText=""
    >
      {role === 'founder' && renderFounderForm()}
      {role === 'mentor' && renderMentorForm()}
      {role === 'investor' && renderInvestorForm()}
    </AuthLayout>
  );
}
