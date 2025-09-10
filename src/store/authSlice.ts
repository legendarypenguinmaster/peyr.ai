import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface User {
  id: string;
  email: string;
}

export interface FounderData {
  bio?: string;
  location?: string;
  timezone?: string;
  skills?: string[];
  industries?: string[];
  cofounder_preference?: string;
  commitment_level?: string;
  availability_hours?: number;
  communication_style?: string;
  linkedin_url?: string;
  github_url?: string;
}

export interface MentorData {
  bio?: string;
  expertise_domains?: string[];
  industries?: string[];
  years_experience?: number;
  past_roles?: string[];
  availability_hours?: number;
  communication_channel?: string;
  mentorship_style?: string;
  is_paid?: boolean;
}

export interface AuthState {
  isSignedIn: boolean;
  user: User | null;
  role: "founder" | "mentor" | "investor" | null;
  profile: Profile | null;
  founder: FounderData | null;
  mentor: MentorData | null;
  onboardingCompleted: boolean;
  currentStep: number;
  totalSteps: number;
}

const initialState: AuthState = {
  isSignedIn: false,
  user: null,
  role: null,
  profile: null,
  founder: null,
  mentor: null,
  onboardingCompleted: false,
  currentStep: 1,
  totalSteps: 5,
};

// Async thunks for Supabase operations
export const persistProfileToSupabase = createAsyncThunk(
  "auth/persistProfile",
  async (profileData: Partial<Profile>, { getState }) => {
    const supabase = createClient();
    const state = getState() as { auth: AuthState };

    if (!state.auth.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: state.auth.user.id,
        ...profileData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
);

export const persistFounderToSupabase = createAsyncThunk(
  "auth/persistFounder",
  async (founderData: FounderData, { getState }) => {
    const supabase = createClient();
    const state = getState() as { auth: AuthState };

    if (!state.auth.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("founders")
      .upsert({
        id: state.auth.user.id,
        ...founderData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
);

export const persistMentorToSupabase = createAsyncThunk(
  "auth/persistMentor",
  async (mentorData: MentorData, { getState }) => {
    const supabase = createClient();
    const state = getState() as { auth: AuthState };

    if (!state.auth.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("mentors")
      .upsert({
        id: state.auth.user.id,
        ...mentorData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
);

export const completeOnboarding = createAsyncThunk(
  "auth/completeOnboarding",
  async (_, { getState, dispatch }) => {
    const state = getState() as { auth: AuthState };

    if (!state.auth.user || !state.auth.role) {
      throw new Error("User not authenticated or role not set");
    }

    // First, ensure profile is saved
    if (state.auth.profile) {
      await dispatch(persistProfileToSupabase(state.auth.profile));
    }

    // Then save role-specific data
    if (state.auth.role === "founder" && state.auth.founder) {
      await dispatch(persistFounderToSupabase(state.auth.founder));
    } else if (state.auth.role === "mentor" && state.auth.mentor) {
      await dispatch(persistMentorToSupabase(state.auth.mentor));
    }

    return true;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signIn: (state, action: PayloadAction<User>) => {
      state.isSignedIn = true;
      state.user = action.payload;
    },
    signOut: (state) => {
      state.isSignedIn = false;
      state.user = null;
      state.role = null;
      state.profile = null;
      state.founder = null;
      state.mentor = null;
      state.onboardingCompleted = false;
      state.currentStep = 1;
    },
    setRole: (
      state,
      action: PayloadAction<"founder" | "mentor" | "investor">
    ) => {
      state.role = action.payload;
      // Reset role-specific data when role changes
      state.founder = null;
      state.mentor = null;
      state.currentStep = 1;
    },
    saveDraftProfile: (state, action: PayloadAction<Partial<Profile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      } else {
        state.profile = action.payload as Profile;
      }
      // Also update the role field if it's provided
      if (action.payload.role) {
        state.role = action.payload.role;
      }
    },
    saveDraftFounder: (state, action: PayloadAction<Partial<FounderData>>) => {
      if (state.founder) {
        state.founder = { ...state.founder, ...action.payload };
      } else {
        state.founder = action.payload;
      }
    },
    saveDraftMentor: (state, action: PayloadAction<Partial<MentorData>>) => {
      if (state.mentor) {
        state.mentor = { ...state.mentor, ...action.payload };
      } else {
        state.mentor = action.payload;
      }
    },
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    nextStep: (state) => {
      if (state.currentStep < state.totalSteps) {
        state.currentStep += 1;
      }
    },
    previousStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },
    setTotalSteps: (state, action: PayloadAction<number>) => {
      state.totalSteps = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(persistProfileToSupabase.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(persistFounderToSupabase.fulfilled, () => {
        // Founder data is already in state, no need to update
      })
      .addCase(persistMentorToSupabase.fulfilled, () => {
        // Mentor data is already in state, no need to update
      })
      .addCase(completeOnboarding.fulfilled, (state) => {
        state.onboardingCompleted = true;
      });
  },
});

export const {
  signIn,
  signOut,
  setRole,
  saveDraftProfile,
  saveDraftFounder,
  saveDraftMentor,
  setCurrentStep,
  nextStep,
  previousStep,
  setTotalSteps,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer;
