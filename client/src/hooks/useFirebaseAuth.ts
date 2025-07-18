import { useState, useEffect } from 'react';
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function useFirebaseAuth() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setIsLoading(false);
      
      // Clear queries when auth state changes
      if (!user) {
        queryClient.clear();
      }
    });

    return unsubscribe;
  }, [queryClient]);

  // Get user profile from Firestore (optional for now)
  const { data: userProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    enabled: false, // Disable for now since we don't have backend API deployed
    retry: false,
  });

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      queryClient.clear();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return {
    firebaseUser,
    userProfile,
    isLoading: isLoading,
    isAuthenticated: !!firebaseUser,
    signIn,
    signUp,
    signOut,
  };
}