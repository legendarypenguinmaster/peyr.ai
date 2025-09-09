import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Profile {
  skills?: string[];
  goals?: string;
  experience?: string;
  location?: string;
  expertise?: string[];
  yearsOfExperience?: number;
  availability?: string;
}

export interface AuthState {
  isSignedIn: boolean;
  user: User | null;
  role: 'founder' | 'mentor' | 'investor' | null;
  profile: Profile | null;
  signupCompleted: boolean;
}

const initialState: AuthState = {
  isSignedIn: false,
  user: null,
  role: null,
  profile: null,
  signupCompleted: false,
};

const authSlice = createSlice({
  name: 'auth',
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
      state.signupCompleted = false;
    },
    setRole: (state, action: PayloadAction<'founder' | 'mentor' | 'investor'>) => {
      state.role = action.payload;
    },
    setProfile: (state, action: PayloadAction<Profile>) => {
      state.profile = action.payload;
    },
    completeSignup: (state) => {
      state.signupCompleted = true;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { signIn, signOut, setRole, setProfile, completeSignup, updateUser } = authSlice.actions;
export default authSlice.reducer;
