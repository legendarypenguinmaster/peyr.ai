"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { createClient } from "@/lib/supabase/client";
import AuthLayout from "@/components/auth/AuthLayout";
import FormField from "@/components/auth/FormField";
import {
  saveDraftProfile,
  saveDraftMentor,
  nextStep,
  previousStep,
} from "@/store/authSlice";
import { RootState } from "@/store/store";
import { Check, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";

const EXPERTISE_DOMAINS = [
  "Product Management",
  "Marketing & Growth",
  "Sales & Business Development",
  "Finance & Fundraising",
  "Operations & Strategy",
  "Technology & Engineering",
  "UI/UX Design",
  "Data Science & Analytics",
  "Legal & Compliance",
  "Human Resources",
  "Customer Success",
  "Content & Communications",
  "Partnerships",
  "International Expansion",
  "Crisis Management",
];

const INDUSTRIES_OPTIONS = [
  "Technology",
  "Healthcare",
  "Fintech",
  "E-commerce",
  "Education",
  "Gaming",
  "SaaS",
  "AI/ML",
  "Blockchain",
  "Cybersecurity",
  "IoT",
  "Biotech",
  "Real Estate",
  "Transportation",
  "Energy",
  "Food & Beverage",
  "Fashion",
  "Entertainment",
  "Sports",
  "Travel",
  "Social Media",
  "Marketplace",
];

const PAST_ROLES = [
  "CEO/Founder",
  "CTO/Technical Co-founder",
  "VP of Engineering",
  "VP of Product",
  "VP of Marketing",
  "VP of Sales",
  "Head of Operations",
  "Head of Design",
  "Senior Product Manager",
  "Senior Engineer",
  "Marketing Director",
  "Sales Director",
  "Business Development Manager",
  "Investment Banker",
  "Management Consultant",
  "Venture Capitalist",
  "Angel Investor",
  "Board Member",
  "Advisor",
  "Other",
];

const COMMUNICATION_CHANNELS = [
  { value: "email", label: "Email" },
  { value: "video-calls", label: "Video Calls (Zoom, Meet)" },
  { value: "phone", label: "Phone Calls" },
  { value: "slack", label: "Slack/Discord" },
  { value: "in-person", label: "In-person Meetings" },
  { value: "mixed", label: "Mixed (Email + Calls)" },
];

const MENTORSHIP_STYLES = [
  { value: "advice-only", label: "Advice & Guidance Only" },
  { value: "hands-on", label: "Hands-on Support & Implementation" },
  { value: "strategic", label: "Strategic Planning & Direction" },
  { value: "networking", label: "Networking & Introductions" },
  { value: "mixed", label: "Mixed Approach" },
];

export default function MentorOnboarding() {
  const router = useRouter();
  const dispatch = useDispatch();
  const supabase = createClient();

  const { profile, mentor, currentStep, totalSteps } = useSelector(
    (state: RootState) => state.auth
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for each step
  const [step1Data, setStep1Data] = useState({
    name: profile?.name || "",
    title: mentor?.title || "",
    bio: mentor?.bio || "",
  });

  const [step2Data, setStep2Data] = useState({
    expertise_domains: mentor?.expertise_domains || [],
    industries: mentor?.industries || [],
  });

  const [step3Data, setStep3Data] = useState({
    years_experience: mentor?.years_experience || 0,
    past_roles: mentor?.past_roles || [],
  });

  const [step4Data, setStep4Data] = useState({
    availability_hours: mentor?.availability_hours || 0,
    communication_channel: mentor?.communication_channel || "",
  });

  const [step5Data, setStep5Data] = useState({
    mentorship_style: mentor?.mentorship_style || "",
    is_paid: mentor?.is_paid || false,
  });

  const [newExpertise, setNewExpertise] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [newRole, setNewRole] = useState("");

  useEffect(() => {
    const checkAuthentication = async () => {
      // Set total steps for mentor onboarding
      dispatch({ type: "auth/setTotalSteps", payload: 5 });

      try {
        // Check authentication with Supabase directly
        const {
          data: { user: supabaseUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !supabaseUser) {
          console.log("No authenticated user found, redirecting to sign-in");
          router.push("/auth/sign-in");
          return;
        }

        console.log("Authenticated user found:", supabaseUser.id);

        // Get user's role from profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", supabaseUser.id)
          .single();

        if (profileError) {
          console.error("Error getting profile:", profileError);
          router.push("/auth/select-role");
          return;
        }

        if (profile?.role !== "mentor") {
          console.log("User role is not mentor, redirecting to select-role");
          router.push("/auth/select-role");
          return;
        }

        console.log(
          "User is authenticated and has mentor role, proceeding with onboarding"
        );
      } catch (error) {
        console.error("Authentication check failed:", error);
        router.push("/auth/sign-in");
      }
    };

    checkAuthentication();
  }, [router, dispatch, supabase]);

  const handleStep1Change = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setStep1Data({
      ...step1Data,
      [e.target.name]: e.target.value,
    });
  };

  const handleStep3Change = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setStep3Data({
      ...step3Data,
      [e.target.name]:
        e.target.name === "years_experience"
          ? parseInt(e.target.value)
          : e.target.value,
    });
  };

  const handleStep4Change = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setStep4Data({
      ...step4Data,
      [e.target.name]:
        e.target.name === "availability_hours"
          ? parseInt(e.target.value)
          : e.target.value,
    });
  };

  const handleStep5Change = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setStep5Data({
      ...step5Data,
      [e.target.name]:
        e.target.name === "is_paid"
          ? (e.target as HTMLInputElement).checked
          : e.target.value,
    });
  };

  const addExpertise = (expertise: string) => {
    if (!step2Data.expertise_domains.includes(expertise)) {
      setStep2Data({
        ...step2Data,
        expertise_domains: [...step2Data.expertise_domains, expertise],
      });
    }
  };

  const removeExpertise = (expertise: string) => {
    setStep2Data({
      ...step2Data,
      expertise_domains: step2Data.expertise_domains.filter(
        (e) => e !== expertise
      ),
    });
  };

  const addCustomExpertise = () => {
    const expertise = newExpertise.trim();
    if (expertise && !step2Data.expertise_domains.includes(expertise)) {
      addExpertise(expertise);
      setNewExpertise("");
    }
  };

  const addIndustry = (industry: string) => {
    if (!step2Data.industries.includes(industry)) {
      setStep2Data({
        ...step2Data,
        industries: [...step2Data.industries, industry],
      });
    }
  };

  const removeIndustry = (industry: string) => {
    setStep2Data({
      ...step2Data,
      industries: step2Data.industries.filter((i) => i !== industry),
    });
  };

  const addCustomIndustry = () => {
    const industry = newIndustry.trim();
    if (industry && !step2Data.industries.includes(industry)) {
      addIndustry(industry);
      setNewIndustry("");
    }
  };

  const addRole = (role: string) => {
    if (!step3Data.past_roles.includes(role)) {
      setStep3Data({
        ...step3Data,
        past_roles: [...step3Data.past_roles, role],
      });
    }
  };

  const removeRole = (role: string) => {
    setStep3Data({
      ...step3Data,
      past_roles: step3Data.past_roles.filter((r) => r !== role),
    });
  };

  const addCustomRole = () => {
    const role = newRole.trim();
    if (role && !step3Data.past_roles.includes(role)) {
      addRole(role);
      setNewRole("");
    }
  };

  const handleNext = () => {
    // Save current step data to Redux
    if (currentStep === 1) {
      dispatch(saveDraftProfile(step1Data));
    } else if (currentStep === 2) {
      dispatch(saveDraftMentor(step2Data));
    } else if (currentStep === 3) {
      dispatch(saveDraftMentor(step3Data));
    } else if (currentStep === 4) {
      dispatch(saveDraftMentor(step4Data));
    } else if (currentStep === 5) {
      dispatch(saveDraftMentor(step5Data));
    }

    dispatch(nextStep());
  };

  const handlePrevious = () => {
    dispatch(previousStep());
  };

  const handleFinish = async () => {
    setLoading(true);
    setError(null);

    try {
      // Save all data to Redux for later use in review page
      dispatch(
        saveDraftProfile({
          name: step1Data.name,
          email: null, // Will be set from Supabase user in review page
          role: "mentor" as const,
          avatar_url: null, // Will be set in upload-avatar page
        })
      );

      dispatch(
        saveDraftMentor({
          title: step1Data.title,
          bio: step1Data.bio,
          expertise_domains: step2Data.expertise_domains,
          industries: step2Data.industries,
          years_experience: step3Data.years_experience,
          past_roles: step3Data.past_roles,
          availability_hours: step4Data.availability_hours,
          communication_channel: step4Data.communication_channel,
          mentorship_style: step5Data.mentorship_style,
          is_paid: step5Data.is_paid,
        })
      );

      console.log(
        "Mentor onboarding data collected, proceeding to upload avatar"
      );
      router.push("/auth/upload-avatar");
    } catch (err) {
      setError("Failed to proceed. Please try again.");
      console.error("Onboarding error:", err);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return step1Data.name && step1Data.title && step1Data.bio;
      case 2:
        return (
          step2Data.expertise_domains.length > 0 &&
          step2Data.industries.length > 0
        );
      case 3:
        return (
          step3Data.years_experience > 0 && step3Data.past_roles.length > 0
        );
      case 4:
        return (
          step4Data.availability_hours > 0 && step4Data.communication_channel
        );
      case 5:
        return step5Data.mentorship_style;
      default:
        return false;
    }
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-gray-500">
          {Math.round((currentStep / totalSteps) * 100)}% Complete
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <FormField
        label="Full Name"
        type="text"
        name="name"
        placeholder="Enter your full name"
        required
        value={step1Data.name}
        onChange={handleStep1Change}
      />

      <FormField
        label="Professional Title"
        type="text"
        name="title"
        placeholder="e.g., Full Stack Developer, Product Manager, CEO"
        required
        value={step1Data.title}
        onChange={handleStep1Change}
      />

      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Bio <span className="text-red-500">*</span>
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          placeholder="Tell us about your professional background, achievements, and what makes you passionate about mentoring entrepreneurs..."
          required
          value={step1Data.bio}
          onChange={handleStep1Change}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Areas of Expertise <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {EXPERTISE_DOMAINS.filter(
            (expertise) => !step2Data.expertise_domains.includes(expertise)
          ).map((expertise) => (
            <button
              key={expertise}
              type="button"
              onClick={() => addExpertise(expertise)}
              className="px-3 py-1 rounded-full text-sm border transition-colors cursor-pointer bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              {expertise}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add custom expertise..."
            value={newExpertise}
            onChange={(e) => setNewExpertise(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), addCustomExpertise())
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          />
          <button
            type="button"
            onClick={addCustomExpertise}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {step2Data.expertise_domains.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {step2Data.expertise_domains.map((expertise) => (
              <span
                key={expertise}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
              >
                {expertise}
                <button
                  type="button"
                  onClick={() => removeExpertise(expertise)}
                  className="ml-2 text-purple-600 hover:text-purple-800 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Industries <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {INDUSTRIES_OPTIONS.filter(
            (industry) => !step2Data.industries.includes(industry)
          ).map((industry) => (
            <button
              key={industry}
              type="button"
              onClick={() => addIndustry(industry)}
              className="px-3 py-1 rounded-full text-sm border transition-colors cursor-pointer bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              {industry}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add custom industry..."
            value={newIndustry}
            onChange={(e) => setNewIndustry(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), addCustomIndustry())
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          />
          <button
            type="button"
            onClick={addCustomIndustry}
            className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {step2Data.industries.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {step2Data.industries.map((industry) => (
              <span
                key={industry}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-100 text-pink-800"
              >
                {industry}
                <button
                  type="button"
                  onClick={() => removeIndustry(industry)}
                  className="ml-2 text-pink-600 hover:text-pink-800 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="years_experience"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Years of Experience <span className="text-red-500">*</span>
        </label>
        <select
          id="years_experience"
          name="years_experience"
          required
          value={step3Data.years_experience}
          onChange={handleStep3Change}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
        >
          <option value={0}>Select years of experience</option>
          <option value={5}>5+ years</option>
          <option value={10}>10+ years</option>
          <option value={15}>15+ years</option>
          <option value={20}>20+ years</option>
          <option value={25}>25+ years</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Past Roles <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {PAST_ROLES.filter(
            (role) => !step3Data.past_roles.includes(role)
          ).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => addRole(role)}
              className="px-3 py-1 rounded-full text-sm border transition-colors cursor-pointer bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              {role}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add custom role..."
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), addCustomRole())
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          />
          <button
            type="button"
            onClick={addCustomRole}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {step3Data.past_roles.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {step3Data.past_roles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
              >
                {role}
                <button
                  type="button"
                  onClick={() => removeRole(role)}
                  className="ml-2 text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="availability_hours"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Hours per Month <span className="text-red-500">*</span>
        </label>
        <input
          id="availability_hours"
          name="availability_hours"
          type="number"
          min="1"
          max="40"
          placeholder="e.g., 8"
          required
          value={step4Data.availability_hours}
          onChange={handleStep4Change}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          How many hours per month can you dedicate to mentoring?
        </p>
      </div>

      <div>
        <label
          htmlFor="communication_channel"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Preferred Communication Channel{" "}
          <span className="text-red-500">*</span>
        </label>
        <select
          id="communication_channel"
          name="communication_channel"
          required
          value={step4Data.communication_channel}
          onChange={handleStep4Change}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="">Select your preferred communication method</option>
          {COMMUNICATION_CHANNELS.map((channel) => (
            <option key={channel.value} value={channel.value}>
              {channel.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="mentorship_style"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Mentorship Style <span className="text-red-500">*</span>
        </label>
        <select
          id="mentorship_style"
          name="mentorship_style"
          required
          value={step5Data.mentorship_style}
          onChange={handleStep5Change}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="">Select your mentorship approach</option>
          {MENTORSHIP_STYLES.map((style) => (
            <option key={style.value} value={style.value}>
              {style.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center">
        <input
          id="is_paid"
          name="is_paid"
          type="checkbox"
          checked={step5Data.is_paid}
          onChange={handleStep5Change}
          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
        />
        <label htmlFor="is_paid" className="ml-2 block text-sm text-gray-700">
          I offer paid mentorship services
        </label>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center">
          <Check className="w-5 h-5 text-purple-600 mr-2" />
          <p className="text-sm text-purple-800">
            Your mentorship style and availability will help founders find the
            right mentor for their needs.
          </p>
        </div>
      </div>
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Basic Information";
      case 2:
        return "Expertise Areas";
      case 3:
        return "Experience";
      case 4:
        return "Availability";
      case 5:
        return "Mentorship Style";
      default:
        return "Onboarding";
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1:
        return "Tell us about yourself";
      case 2:
        return "What are your areas of expertise?";
      case 3:
        return "What's your professional background?";
      case 4:
        return "How much time can you commit?";
      case 5:
        return "How do you prefer to mentor?";
      default:
        return "Complete your mentor profile";
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return null;
    }
  };

  return (
    <AuthLayout
      title={getStepTitle()}
      subtitle={getStepSubtitle()}
      footerText=""
      footerLink=""
      footerLinkText=""
      imageSrc="/images/collaborate-safely.jpg"
      imageAlt="Mentor onboarding"
      layout="form-right"
    >
      <div className="w-full max-w-2xl mx-auto">
        {renderProgressBar()}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {renderCurrentStep()}

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </button>

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={loading || !isStepValid()}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {loading ? "Finishing..." : "Finish"}
              <Check className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
