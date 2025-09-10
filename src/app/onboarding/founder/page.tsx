"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { createClient } from "@/lib/supabase/client";
import AuthLayout from "@/components/auth/AuthLayout";
import FormField from "@/components/auth/FormField";
import {
  saveDraftProfile,
  saveDraftFounder,
  setCurrentStep,
  nextStep,
  previousStep,
  completeOnboarding,
} from "@/store/authSlice";
import { RootState } from "@/store/store";
import { Check, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";

const SKILLS_OPTIONS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "Java",
  "Go",
  "Rust",
  "Product Management",
  "UI/UX Design",
  "Marketing",
  "Sales",
  "Finance",
  "Operations",
  "Machine Learning",
  "Data Science",
  "DevOps",
  "Cloud Computing",
  "Blockchain",
  "Mobile Development",
  "Web Development",
  "Backend Development",
  "Frontend Development",
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

const COMMITMENT_LEVELS = [
  { value: "part-time", label: "Part-time (10-20 hours/week)" },
  { value: "full-time", label: "Full-time (40+ hours/week)" },
  { value: "weekend-warrior", label: "Weekend Warrior" },
  { value: "side-project", label: "Side Project" },
];

const COMMUNICATION_STYLES = [
  { value: "direct", label: "Direct and to the point" },
  { value: "collaborative", label: "Collaborative and discussion-based" },
  { value: "structured", label: "Structured with clear agendas" },
  { value: "casual", label: "Casual and informal" },
];

export default function FounderOnboarding() {
  const router = useRouter();
  const dispatch = useDispatch();
  const supabase = createClient();

  const { user, role, profile, founder, currentStep, totalSteps } = useSelector(
    (state: RootState) => state.auth
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for each step
  const [step1Data, setStep1Data] = useState({
    name: profile?.name || "",
    bio: founder?.bio || "",
    location: founder?.location || "",
    timezone: founder?.timezone || "",
  });

  const [step2Data, setStep2Data] = useState({
    skills: founder?.skills || [],
    industries: founder?.industries || [],
  });

  const [step3Data, setStep3Data] = useState({
    cofounder_preference: founder?.cofounder_preference || "",
    commitment_level: founder?.commitment_level || "",
  });

  const [step4Data, setStep4Data] = useState({
    availability_hours: founder?.availability_hours || 0,
    communication_style: founder?.communication_style || "",
  });

  const [step5Data, setStep5Data] = useState({
    linkedin_url: founder?.linkedin_url || "",
    github_url: founder?.github_url || "",
  });

  const [newSkill, setNewSkill] = useState("");
  const [newIndustry, setNewIndustry] = useState("");

  useEffect(() => {
    const checkAuthentication = async () => {
      // Set total steps for founder onboarding
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

        if (profile?.role !== "founder") {
          console.log("User role is not founder, redirecting to select-role");
          router.push("/auth/select-role");
          return;
        }

        console.log(
          "User is authenticated and has founder role, proceeding with onboarding"
        );
      } catch (error) {
        console.error("Authentication check failed:", error);
        router.push("/auth/sign-in");
      }
    };

    checkAuthentication();
  }, [router, dispatch, supabase]);

  const handleStep1Change = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setStep1Data({
      ...step1Data,
      [e.target.name]: e.target.value,
    });
  };

  const handleStep2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStep2Data({
      ...step2Data,
      [e.target.name]: e.target.value,
    });
  };

  const handleStep3Change = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setStep3Data({
      ...step3Data,
      [e.target.name]: e.target.value,
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

  const handleStep5Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStep5Data({
      ...step5Data,
      [e.target.name]: e.target.value,
    });
  };

  const addSkill = (skill: string) => {
    if (!step2Data.skills.includes(skill)) {
      setStep2Data({
        ...step2Data,
        skills: [...step2Data.skills, skill],
      });
    }
  };

  const removeSkill = (skill: string) => {
    setStep2Data({
      ...step2Data,
      skills: step2Data.skills.filter((s) => s !== skill),
    });
  };

  const addCustomSkill = () => {
    const skill = newSkill.trim();
    if (skill && !step2Data.skills.includes(skill)) {
      addSkill(skill);
      setNewSkill("");
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

  const handleNext = () => {
    // Save current step data to Redux
    if (currentStep === 1) {
      dispatch(saveDraftProfile(step1Data));
    } else if (currentStep === 2) {
      dispatch(saveDraftFounder(step2Data));
    } else if (currentStep === 3) {
      dispatch(saveDraftFounder(step3Data));
    } else if (currentStep === 4) {
      dispatch(saveDraftFounder(step4Data));
    } else if (currentStep === 5) {
      dispatch(saveDraftFounder(step5Data));
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
      const profileData = {
        name: step1Data.name,
        email: null, // Will be set from Supabase user in review page
        role: "founder" as const,
        avatar_url: null, // Will be set in upload-avatar page
      };

      const founderData = {
        bio: step1Data.bio,
        location: step1Data.location,
        timezone: step1Data.timezone,
        skills: step2Data.skills,
        industries: step2Data.industries,
        cofounder_preference: step3Data.cofounder_preference,
        commitment_level: step3Data.commitment_level,
        availability_hours: step4Data.availability_hours,
        communication_style: step4Data.communication_style,
        linkedin_url: step5Data.linkedin_url,
        github_url: step5Data.github_url,
      };

      console.log("Saving to Redux - Profile:", profileData);
      console.log("Saving to Redux - Founder:", founderData);

      dispatch(saveDraftProfile(profileData));
      dispatch(saveDraftFounder(founderData));

      console.log(
        "Founder onboarding data collected, proceeding to upload avatar"
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
        return (
          step1Data.name &&
          step1Data.bio &&
          step1Data.location &&
          step1Data.timezone
        );
      case 2:
        return step2Data.skills.length > 0 && step2Data.industries.length > 0;
      case 3:
        return step3Data.cofounder_preference && step3Data.commitment_level;
      case 4:
        return (
          step4Data.availability_hours > 0 && step4Data.communication_style
        );
      case 5:
        return true; // Optional step
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
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
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
          placeholder="Tell us about yourself, your background, and what drives you as an entrepreneur..."
          required
          value={step1Data.bio}
          onChange={handleStep1Change}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <FormField
        label="Location"
        type="text"
        name="location"
        placeholder="e.g., San Francisco, CA"
        required
        value={step1Data.location}
        onChange={handleStep1Change}
      />

      <FormField
        label="Timezone"
        type="text"
        name="timezone"
        placeholder="e.g., PST, EST, GMT"
        required
        value={step1Data.timezone}
        onChange={handleStep1Change}
      />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Skills & Technologies <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {SKILLS_OPTIONS.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => addSkill(skill)}
              disabled={step2Data.skills.includes(skill)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors cursor-pointer ${
                step2Data.skills.includes(skill)
                  ? "bg-blue-100 text-blue-800 border-blue-200"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add custom skill..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), addCustomSkill())
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={addCustomSkill}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {step2Data.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {step2Data.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-2 text-blue-600 hover:text-blue-800 cursor-pointer"
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
          Industries of Interest <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {INDUSTRIES_OPTIONS.map((industry) => (
            <button
              key={industry}
              type="button"
              onClick={() => addIndustry(industry)}
              disabled={step2Data.industries.includes(industry)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors cursor-pointer ${
                step2Data.industries.includes(industry)
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
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
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={addCustomIndustry}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {step2Data.industries.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {step2Data.industries.map((industry) => (
              <span
                key={industry}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
              >
                {industry}
                <button
                  type="button"
                  onClick={() => removeIndustry(industry)}
                  className="ml-2 text-green-600 hover:text-green-800 cursor-pointer"
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
          htmlFor="cofounder_preference"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Co-founder Preference <span className="text-red-500">*</span>
        </label>
        <textarea
          id="cofounder_preference"
          name="cofounder_preference"
          rows={4}
          placeholder="Describe what you're looking for in a co-founder. What skills, experience, or qualities are important to you?"
          required
          value={step3Data.cofounder_preference}
          onChange={handleStep3Change}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="commitment_level"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Commitment Level <span className="text-red-500">*</span>
        </label>
        <select
          id="commitment_level"
          name="commitment_level"
          required
          value={step3Data.commitment_level}
          onChange={handleStep3Change}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select your commitment level</option>
          {COMMITMENT_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
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
          Hours per Week <span className="text-red-500">*</span>
        </label>
        <input
          id="availability_hours"
          name="availability_hours"
          type="number"
          min="1"
          max="80"
          placeholder="e.g., 20"
          required
          value={step4Data.availability_hours}
          onChange={handleStep4Change}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          How many hours per week can you dedicate to your startup?
        </p>
      </div>

      <div>
        <label
          htmlFor="communication_style"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Communication Style <span className="text-red-500">*</span>
        </label>
        <select
          id="communication_style"
          name="communication_style"
          required
          value={step4Data.communication_style}
          onChange={handleStep4Change}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select your preferred communication style</option>
          {COMMUNICATION_STYLES.map((style) => (
            <option key={style.value} value={style.value}>
              {style.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <FormField
        label="LinkedIn URL"
        type="url"
        name="linkedin_url"
        placeholder="https://linkedin.com/in/yourprofile"
        value={step5Data.linkedin_url}
        onChange={handleStep5Change}
      />

      <FormField
        label="GitHub URL"
        type="url"
        name="github_url"
        placeholder="https://github.com/yourusername"
        value={step5Data.github_url}
        onChange={handleStep5Change}
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Check className="w-5 h-5 text-blue-600 mr-2" />
          <p className="text-sm text-blue-800">
            These links help build trust and credibility with potential
            co-founders.
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
        return "Skills & Expertise";
      case 3:
        return "Vision & Goals";
      case 4:
        return "Availability";
      case 5:
        return "Trust & Verification";
      default:
        return "Onboarding";
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1:
        return "Tell us about yourself";
      case 2:
        return "What are your skills and interests?";
      case 3:
        return "What are you looking for in a co-founder?";
      case 4:
        return "How much time can you commit?";
      case 5:
        return "Help others verify your background";
      default:
        return "Complete your founder profile";
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
      imageAlt="Founder onboarding"
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
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
