import { useState } from "react";
import { supabase } from "../lib/supabase";
import { User } from "../interfaces/User";
import { useUser } from "./useUser";
import { useAuthStore } from "../lib/stores/authStore";
import { useAuthRedirect } from "./useAuthRedirect";

interface UserRegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface AuthResponse {
  user: User | null;
  error: string | null;
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createUser, fetchUserByAuthId } = useUser();
  const { setAuthData, clearAuth, setLoading } = useAuthStore();
  const { /*redirectAfterLogin,*/ redirectAfterLogout } = useAuthRedirect();

  console.log("🔐 useAuth hook initialized", {
    timestamp: new Date().toISOString(),
  });

  // Register new user
  const signUp = async ({
    email,
    password,
    firstName,
    lastName,
  }: UserRegistrationData): Promise<AuthResponse> => {
    try {
      console.log("📝 Starting user registration for:", email);
      setIsLoading(true);
      setLoading(true);
      setError(null);

      // Step 1: Create Supabase auth user
      console.log("🔐 Step 1: Creating Supabase auth user...");
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error("❌ Supabase auth failed:", authError.message);
        throw new Error(authError.message);
      }

      if (!authData?.user) {
        console.error("❌ No auth user returned");
        throw new Error("Registration failed - no user created");
      }

      console.log(
        "✅ Step 1 complete: Supabase auth user created:",
        authData.user.email
      );

      // Step 2: Create user in database using useUser hook
      console.log("👤 Step 2: Creating user in database...");
      const userData: Partial<User> = {
        auth_id: authData.user.id,
        email: authData.user.email || "",
        display_name: `${firstName} ${lastName}`,
        user_role: "both",
        account_status: "active",
        is_phone_verified: false,
        is_email_verified: true,
        is_identity_verified: false,
        is_host: true,
        response_rate: 0,
        guest_rating: 0.0,
        host_rating: 0.0,
        total_guest_reviews: 0,
        total_host_reviews: 0,
        total_bookings: 0,
        total_properties: 0,
        total_revenue: 0.0,
        preferred_currency: "USD",
        language_preference: "en",
      };
      console.log("👤 Step 2: Creating user in database starting...", userData);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay
      const createdUser = await createUser(userData);

      if (!createdUser) {
        console.error("❌ Failed to create user in database");
        throw new Error("Failed to create user profile");
      }

      console.log(
        "✅ Step 2 complete: User created in database:",
        createdUser.email
      );

      // Step 3: Wait a moment to ensure database user is created
      console.log("⏳ Step 3: Waiting for database user creation...");
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay

      // Step 4: Verify user was created in database
      console.log("🔍 Step 4: Verifying user creation...");
      const verifyUser = await fetchUserByAuthId(authData.user.id);
      if (!verifyUser) {
        console.error("❌ User verification failed - database user not found");
        throw new Error("Failed to create user profile");
      }

      // Step 5: Sign out user after confirmation (they need to login manually)
      console.log("🚪 Step 5: Signing out user after registration...");
      await supabase.auth.signOut();
      clearAuth();

      console.log(
        "✅ User registration completed successfully! User must now login."
      );
      return { user: createdUser, error: null };
    } catch (error: any) {
      console.error("❌ User registration failed:", error);
      const errorMessage = error.message || "Registration failed";
      setError(errorMessage);
      return { user: null, error: errorMessage };
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  // Sign in user
  const signIn = async (
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    try {
      console.log("🔑 Starting user sign in for:", email);
      setIsLoading(true);
      setLoading(true);
      setError(null);

      // Step 1: Sign in with Supabase
      console.log("🔐 Step 1: Signing in with Supabase...");
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        console.error("❌ Supabase sign in failed:", authError.message);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        console.error("❌ No auth user returned");
        throw new Error("Sign in failed - no user data");
      }

      console.log(
        "✅ Step 1 complete: Supabase sign in successful:",
        authData.user.email
      );

      // Step 2: The user will be fetched and set by useAuthInit automatically
      console.log("✅ User sign in completed successfully!");
      // Don't redirect here - let the component handle redirect via useEffect
      return { user: null, error: null }; // User will be set by auth listener
    } catch (error: any) {
      console.error("❌ User sign in failed:", error);
      const errorMessage = error.message || "Sign in failed";
      setError(errorMessage);
      return { user: null, error: errorMessage };
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  // Sign out user
  const signOut = async (): Promise<{ error: string | null }> => {
    try {
      console.log("🚪 Signing out user...");
      // Don't set loading state for logout - it causes white screen blink
      // setIsLoading(true);
      // setLoading(true);

      // Clear auth state immediately to prevent UI issues
      clearAuth();

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("❌ Sign out error:", error);
        console.log("⚠️ Supabase signOut had error but continuing with logout");
      }

      console.log("✅ User signed out successfully");
      redirectAfterLogout(); // Add redirect after successful logout
      return { error: null };
    } catch (error: any) {
      console.error("❌ Sign out failed:", error);
      // Even if there's an error, clear the auth state and redirect
      clearAuth();
      redirectAfterLogout();
      const errorMessage = error.message || "Sign out failed";
      setError(errorMessage);
      return { error: errorMessage };
    }
    // No finally block needed since we're not setting loading state
  };

  // Refresh user data
  const refreshUser = async (): Promise<{ error: string | null }> => {
    try {
      console.log("🔄 Refreshing user data...");
      setIsLoading(true);
      setError(null);

      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();

      if (!supabaseUser) {
        console.log("ℹ️ No authenticated user found");
        clearAuth();
        return { error: null };
      }

      const userData = await fetchUserByAuthId(supabaseUser.id);

      if (userData) {
        setAuthData(userData, supabaseUser);
        console.log("✅ User data refreshed successfully");
        return { error: null };
      } else {
        console.log("❌ User not found in database");
        clearAuth();
        return { error: "User not found" };
      }
    } catch (error: any) {
      console.error("❌ Exception in refreshUser:", error);
      const errorMessage = error.message || "Failed to refresh user data";
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (
    updates: Partial<User>
  ): Promise<{ error: string | null }> => {
    try {
      console.log("📝 Updating user profile:", Object.keys(updates));
      setIsLoading(true);
      setError(null);

      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();

      if (!supabaseUser) {
        return { error: "No user logged in" };
      }

      // Update user in database
      const { error } = await supabase
        .from("users")
        .update(updates)
        .eq("auth_id", supabaseUser.id)
        .select()
        .single();

      if (error) {
        console.error("❌ Profile update failed:", error);
        throw new Error(error.message);
      }

      // Refresh user data
      await refreshUser();

      console.log("✅ Profile updated successfully");
      return { error: null };
    } catch (error: any) {
      console.error("❌ Exception in updateProfile:", error);
      const errorMessage = error.message || "Failed to update profile";
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    // State
    isLoading,
    error,

    // Actions
    signUp,
    signIn,
    signOut,
    refreshUser,
    updateProfile,
    clearError,
  };
};
