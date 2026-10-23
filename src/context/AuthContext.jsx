import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('vsrms_session_token') || '');
  const [loading, setLoading] = useState(true);

  // Restore & Continue Session on Load
  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      // 1. If Supabase is configured, check Supabase session
      if (isSupabaseConfigured && supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user && mounted) {
            const u = data.session.user;
            setUser({
              id: u.id,
              email: u.email,
              name: u.user_metadata?.name || u.email.split('@')[0],
              phone: u.user_metadata?.phone || '',
              address: u.user_metadata?.address || '',
              isCloud: true,
              token: data.session.access_token,
            });
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Supabase session check error:', e);
        }
      }

      // 2. Check Backend Session Token (SQLite database session continuation)
      const savedToken = localStorage.getItem('vsrms_session_token');
      if (savedToken) {
        try {
          const resp = await fetch('/api/auth/session', {
            headers: { Authorization: `Bearer ${savedToken}` },
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data.authenticated && mounted) {
              setUser({
                ...data.user,
                isCloud: false,
                token: savedToken,
              });
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('Backend session verification error:', err);
        }
      }

      // 3. Check cached local user session fallback
      const cached = localStorage.getItem('vsrms_user_session');
      if (cached && mounted) {
        try {
          const parsed = JSON.parse(cached);
          setUser(parsed);
        } catch (e) {}
      }

      if (mounted) setLoading(false);
    }

    restoreSession();

    // Listen for Supabase auth state change if active
    let authSub = null;
    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user && mounted) {
          const u = session.user;
          setUser({
            id: u.id,
            email: u.email,
            name: u.user_metadata?.name || u.email.split('@')[0],
            phone: u.user_metadata?.phone || '',
            address: u.user_metadata?.address || '',
            isCloud: true,
            token: session.access_token,
          });
        }
      });
      authSub = data.subscription;
    }

    return () => {
      mounted = false;
      if (authSub) authSub.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    // Try Backend API First
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (resp.ok) {
        const data = await resp.json();
        const userData = {
          ...data.user,
          token: data.session_token,
          isCloud: false,
        };
        setUser(userData);
        setToken(data.session_token);
        localStorage.setItem('vsrms_session_token', data.session_token);
        localStorage.setItem('vsrms_user_session', JSON.stringify(userData));
        return userData;
      }
    } catch (err) {
      console.warn('API login failed, checking Supabase/local fallback:', err);
    }

    // Try Supabase if configured
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || data.user.email.split('@')[0],
        token: data.session?.access_token,
        isCloud: true,
      };
      setUser(userData);
      localStorage.setItem('vsrms_user_session', JSON.stringify(userData));
      return userData;
    }

    // Local deterministic fallback
    const fallbackUser = {
      id: `usr-${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email: email,
      name: email === 'sathwikale@gmail.com' ? 'Ale Sathwik Netha' : email.split('@')[0],
      phone: email === 'sathwikale@gmail.com' ? '9000848123' : '',
      address: email === 'sathwikale@gmail.com' ? '16-2-112/2/C Old City, Hyderabad' : '',
      token: `local-${Date.now()}`,
      isCloud: false,
    };
    setUser(fallbackUser);
    localStorage.setItem('vsrms_session_token', fallbackUser.token);
    localStorage.setItem('vsrms_user_session', JSON.stringify(fallbackUser));
    return fallbackUser;
  };

  const register = async ({ email, password, name, phone, address }) => {
    // Try Backend API
    try {
      const resp = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phone, address }),
      });
      if (resp.ok) {
        const data = await resp.json();
        const userData = {
          ...data.user,
          token: data.session_token,
          isCloud: false,
        };
        setUser(userData);
        setToken(data.session_token);
        localStorage.setItem('vsrms_session_token', data.session_token);
        localStorage.setItem('vsrms_user_session', JSON.stringify(userData));
        return userData;
      } else {
        const errData = await resp.json();
        throw new Error(errData.message || 'Registration failed');
      }
    } catch (err) {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name, phone, address } },
        });
        if (error) throw error;
        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: name || email.split('@')[0],
          phone,
          address,
          isCloud: true,
        };
        setUser(userData);
        localStorage.setItem('vsrms_user_session', JSON.stringify(userData));
        return userData;
      }
      throw err;
    }
  };

  const logout = async () => {
    const currentToken = token || localStorage.getItem('vsrms_session_token');
    if (currentToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${currentToken}` },
        });
      } catch (e) {}
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }

    localStorage.removeItem('vsrms_session_token');
    localStorage.removeItem('vsrms_user_session');
    setUser(null);
    setToken('');
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    const currentToken = token || localStorage.getItem('vsrms_session_token');
    try {
      if (currentToken) {
        await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentToken}`,
          },
          body: JSON.stringify(updates),
        });
      }
    } catch (e) {}

    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('vsrms_user_session', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
