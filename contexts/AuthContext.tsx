import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, hasSupabase } from '../lib/safeSupabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Initializing...');
    
    // Check if Supabase is available
    if (!hasSupabase()) {
      console.warn('AuthProvider: Supabase not configured, running in demo mode');
      setLoading(false);
      return;
    }

    const initializeAuth = async () => {
      try {
        console.log('AuthProvider: Getting session...');
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('AuthProvider: Session retrieved:', currentSession ? 'logged in' : 'not logged in');
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      } catch (error) {
        console.error('AuthProvider: Error initializing auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('AuthProvider: Auth state changed:', event);

        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN' && currentSession?.user) {
          try {
            const { error: upsertError } = await supabase
              .from('profiles')
              .upsert(
                {
                  id: currentSession.user.id,
                  email: currentSession.user.email || '',
                  full_name: currentSession.user.user_metadata?.full_name || null,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: 'id' }
              );

            if (upsertError) {
              console.error('AuthProvider: Failed to create/update profile:', upsertError);
              await supabase.auth.signOut();
              setSession(null);
              setUser(null);
            } else {
              console.log('AuthProvider: Profile created/updated successfully');
            }
          } catch (error) {
            console.error('AuthProvider: Unexpected error during profile creation:', error);
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!hasSupabase()) {
      return { error: { message: 'Authentication not configured' } as AuthError };
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        },
      },
    });

    if (!error && data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: data.user.id,
            email: data.user.email || '',
            full_name: fullName || null,
          },
          { onConflict: 'id' }
        );

      if (profileError) {
        console.error('Failed to create profile:', profileError);
        return { error: profileError as any };
      }
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (!hasSupabase()) {
      return { error: { message: 'Authentication not configured' } as AuthError };
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    if (!hasSupabase()) {
      return;
    }
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    if (!hasSupabase()) {
      return { error: { message: 'Authentication not configured' } as AuthError };
    }
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  console.log('AuthProvider: Rendering, loading:', loading);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
