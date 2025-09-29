"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { RootState } from "@/store/store";
import {
  nextStep,
  previousStep,
  setTotalSteps,
  saveDraftProfile,
  saveDraftInvestor,
} from "@/store/authSlice";
import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "@/components/ui/ThemeToggle";

const INDUSTRIES = [
  "Technology","Healthcare","Fintech","E-commerce","Education","SaaS","AI/ML","Blockchain","Cybersecurity","Biotech","Marketplace"
];
const STAGES = ["Idea","MVP","Seed","Growth","Series A+"];
const GEOS = ["North America","Europe","Asia","LATAM","Africa","Middle East","Oceania"];
const INVESTMENT_TYPES = ["Equity","SAFE","Convertible Note","Other"];
const INVESTOR_TYPES = ["Individual","Angel","VC","Accelerator","Fund"];

export default function InvestorOnboarding() {
  const router = useRouter();
  const dispatch = useDispatch();
  const supabase = createClient();
  const { currentStep, profile, investor } = useSelector((s: RootState) => s.auth);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const totalSteps = 6;

  useEffect(() => {
    dispatch(setTotalSteps(totalSteps));
  }, [dispatch]);

  // Auth + profile guard (same pattern as other roles)
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth/sign-in");
        return;
      }

      // Load profile to check role and completion
      const { data: prof } = await supabase
        .from("profiles")
        .select("role, signup_completed, onboarding_completed")
        .eq("id", user.id)
        .single();

      if (prof?.signup_completed === true) {
        router.replace("/dashboard");
        return;
      }

      if (!prof?.role) {
        router.replace("/auth/select-role");
        return;
      }

      setInitializing(false);
    };
    init();
  }, [router, supabase]);

  const goNext = () => dispatch(nextStep());
  const goBack = () => dispatch(previousStep());

  const finish = async () => {
    setLoading(true);
    try {
      // Save profile basics; avatar will be set in upload step
      dispatch(
        saveDraftProfile({
          role: "investor" as const,
          avatar_url: null,
        })
      );
      // Proceed to shared avatar upload step, then review will persist
      router.push("/auth/upload-avatar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ThemeToggle />
      <AuthLayout
        title="Investor Onboarding"
        subtitle={`Step ${currentStep} of ${totalSteps}`}
        footerText=""
        footerLink=""
        footerLinkText=""
        imageSrc="/images/ai-matched-co-founder.jpg"
        imageAlt="Investor onboarding"
        layout="form-right"
      >
        <div className="max-w-2xl mx-auto">
        {initializing && (
          <div className="text-center py-16 text-gray-600 dark:text-gray-400">Loading...</div>
        )}
        {!initializing && (
        <>
        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {currentStep === 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Info</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  defaultValue={profile?.name || ""}
                  onChange={(e) => dispatch(saveDraftProfile({ name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Investor Type</label>
                <select
                  defaultValue={investor?.investor_type || ""}
                  onChange={(e) => dispatch(saveDraftInvestor({ investor_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select type</option>
                  {INVESTOR_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                <textarea
                  defaultValue={investor?.bio || ""}
                  onChange={(e) => dispatch(saveDraftInvestor({ bio: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell founders about your background"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Investment Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MultiSelect label="Industries" options={INDUSTRIES} value={investor?.industries} onChange={(v) => dispatch(saveDraftInvestor({ industries: v }))} />
              <MultiSelect label="Stage Focus" options={STAGES} value={investor?.stage_focus} onChange={(v) => dispatch(saveDraftInvestor({ stage_focus: v }))} />
              <MultiSelect label="Geography" options={GEOS} value={investor?.geography} onChange={(v) => dispatch(saveDraftInvestor({ geography: v }))} />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Check Size & Range</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumberInput label="Min check ($)" value={investor?.min_check} onChange={(v) => dispatch(saveDraftInvestor({ min_check: v }))} />
              <NumberInput label="Max check ($)" value={investor?.max_check} onChange={(v) => dispatch(saveDraftInvestor({ max_check: v }))} />
              <MultiSelect label="Investment Type" options={INVESTMENT_TYPES} value={investor?.investment_type} onChange={(v) => dispatch(saveDraftInvestor({ investment_type: v }))} />
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Verification</h2>
            <div className="space-y-4">
              <TextInput label="LinkedIn URL" value={investor?.linkedin_url} onChange={(v) => dispatch(saveDraftInvestor({ linkedin_url: v }))} />
              <TextInput label="AngelList URL" value={investor?.angellist_url} onChange={(v) => dispatch(saveDraftInvestor({ angellist_url: v }))} />
              <Checkbox label="I am an accredited investor" checked={!!investor?.accredited} onChange={(v) => dispatch(saveDraftInvestor({ accredited: v }))} />
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Visibility</h2>
            <div className="space-y-3">
              <Radio label="Public profile (visible to founders)" checked={(investor?.visibility || 'public') === 'public'} onChange={() => dispatch(saveDraftInvestor({ visibility: 'public' }))} />
              <Radio label="Private profile" checked={investor?.visibility === 'private'} onChange={() => dispatch(saveDraftInvestor({ visibility: 'private' }))} />
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Review & Finish</h2>
            <div className="space-y-6">
              {/* Profile Summary */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-2">Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SummaryItem label="Name" value={profile?.name} />
                  <SummaryItem label="Email" value={profile?.email} />
                  <SummaryItem label="Role" value={profile?.role || 'investor'} />
                </div>
              </div>

              {/* Investor Summary */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-2">Investor Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SummaryItem label="Investor Type" value={investor?.investor_type} />
                  <SummaryItem label="Visibility" value={investor?.visibility || 'public'} />
                  <SummaryItem label="Industries" value={formatArray(investor?.industries)} />
                  <SummaryItem label="Stage Focus" value={formatArray(investor?.stage_focus)} />
                  <SummaryItem label="Geography" value={formatArray(investor?.geography)} />
                  <SummaryItem label="Min Check ($)" value={formatNumber(investor?.min_check)} />
                  <SummaryItem label="Max Check ($)" value={formatNumber(investor?.max_check)} />
                  <SummaryItem label="Investment Types" value={formatArray(investor?.investment_type)} />
                  <SummaryItem label="Accredited" value={investor?.accredited ? 'Yes' : 'No'} />
                  <SummaryItem label="LinkedIn" value={investor?.linkedin_url} isLink />
                  <SummaryItem label="AngelList" value={investor?.angellist_url} isLink />
                </div>
                {investor?.bio && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Bio</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{investor.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <div className="flex items-center justify-between mt-6">
          <button onClick={goBack} disabled={currentStep === 1} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors">Back</button>
          {currentStep < totalSteps ? (
            <button onClick={goNext} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">Next</button>
          ) : (
            <button onClick={finish} disabled={loading} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors">{loading ? 'Saving...' : 'Finish'}</button>
          )}
        </div>
        </>
        )}
      </div>
    </AuthLayout>
    </>
  );
}

function SummaryItem({ label, value, isLink }: { label: string; value?: string | number | null; isLink?: boolean }) {
  return (
    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</div>
      {isLink && value ? (
        <a href={String(value)} target="_blank" rel="noreferrer" className="text-sm text-blue-600 dark:text-blue-400 break-all hover:underline">
          {value}
        </a>
      ) : (
        <div className="text-sm text-gray-900 dark:text-white break-words">{value || '-'}</div>
      )}
    </div>
  );
}

function formatArray(arr?: string[]) {
  if (!arr || arr.length === 0) return '-';
  return arr.join(', ');
}

function formatNumber(n?: number) {
  if (n === undefined || n === null) return '-';
  try { return `$${Number(n).toLocaleString()}`; } catch { return String(n); }
}

function MultiSelect({ label, options, value, onChange }: { label: string; options: string[]; value?: string[]; onChange: (v: string[]) => void }) {
  const selected = new Set(value || []);
  return (
    <div>
      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.has(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => {
                const next = new Set(selected);
                if (active) {
                  next.delete(opt);
                } else {
                  next.add(opt);
                }
                onChange(Array.from(next));
              }}
              className={`px-3 py-1 rounded-full text-sm border ${active ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NumberInput({ label, value, onChange }: { label: string; value?: number; onChange: (v: number|undefined) => void }) {
  return (
    <div>
      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function TextInput({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500" />
      {label}
    </label>
  );
}

function Radio({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
      <input type="radio" checked={checked} onChange={onChange} className="text-blue-600 focus:ring-blue-500" />
      {label}
    </label>
  );
}


