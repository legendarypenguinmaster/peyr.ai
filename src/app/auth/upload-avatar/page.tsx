"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { createClient } from "@/lib/supabase/client";
import AuthLayout from "@/components/auth/AuthLayout";
import SubmitButton from "@/components/auth/SubmitButton";
import { saveDraftProfile } from "@/store/authSlice";

export default function UploadAvatar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const supabase = createClient();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth/sign-in");
      }
    };
    checkAuth();
  }, [router, supabase.auth]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] || null;
    setFile(picked);
    setError(null);
    if (picked) {
      const url = URL.createObjectURL(picked);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSkip = async () => {
    router.push("/auth/review");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Not authenticated");

      let avatarUrl: string | null = null;

      if (file) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${user.id}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: true,
          });
        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from("avatars")
          .getPublicUrl(path);
        avatarUrl = publicUrl.publicUrl;
      }

      // Save avatar_url to Redux for later use in review page
      console.log("Saving avatar URL to Redux:", avatarUrl);
      dispatch(saveDraftProfile({ avatar_url: avatarUrl }));

      console.log("Avatar uploaded and saved to Redux, proceeding to review");
      router.push("/auth/review");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Add a profile photo"
      subtitle="Upload an avatar so people can recognize you. You can skip for now."
      footerText="Prefer to do this later?"
      footerLink="#"
      footerLinkText="Skip"
      imageSrc="/images/ai-matched-co-founder.jpg"
      imageAlt="Upload avatar"
      layout="form-right"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400 text-sm">No image</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-2">PNG or JPG up to 2MB.</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleSkip}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            Skip for now
          </button>
          <SubmitButton text="Save and continue" loading={loading} />
        </div>
      </form>
    </AuthLayout>
  );
}
