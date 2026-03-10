import * as SecureStore from 'expo-secure-store';

export const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
}

type AuthEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED';

export type SupabaseUser = {
  id: string;
  email: string | null;
  user_metadata?: Record<string, unknown>;
};

export type SupabaseSession = {
  access_token: string;
  refresh_token: string;
  user: SupabaseUser;
};

type SupabaseError = {
  message: string;
};

type AuthStateCallback = (event: AuthEvent, session: SupabaseSession | null) => void;

const SESSION_KEY = 'supabase_session';

class SupabaseAuth {
  private session: SupabaseSession | null = null;

  private listeners = new Set<AuthStateCallback>();

  private hydrated = false;

  private async hydrateSession(): Promise<void> {
    if (this.hydrated) {
      return;
    }

    const rawSession = await SecureStore.getItemAsync(SESSION_KEY);
    if (rawSession) {
      this.session = JSON.parse(rawSession) as SupabaseSession;
    }

    this.hydrated = true;
  }

  private emit(event: AuthEvent, session: SupabaseSession | null): void {
    this.listeners.forEach((listener) => listener(event, session));
  }

  private async request<T>(path: string, init: RequestInit): Promise<{ data: T | null; error: SupabaseError | null }> {
    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/${path}`, {
        ...init,
        headers: {
          apikey: supabaseAnonKey,
          'Content-Type': 'application/json',
          ...(init.headers ?? {}),
        },
      });

      const json = (await response.json()) as Record<string, unknown>;

      if (!response.ok) {
        const message = typeof json.msg === 'string' ? json.msg : 'Authentication request failed.';
        return { data: null, error: { message } };
      }

      return { data: json as T, error: null };
    } catch {
      return { data: null, error: { message: 'Network error. Please try again.' } };
    }
  }

  signInWithOtp = async ({ email }: { email: string }): Promise<{ error: SupabaseError | null }> => {
    const { error } = await this.request('otp', {
      method: 'POST',
      body: JSON.stringify({ email, create_user: false }),
    });

    return { error };
  };

  verifyOtp = async ({
    email,
    token,
  }: {
    email: string;
    token: string;
    type?: 'email';
  }): Promise<{ data: { session: SupabaseSession | null }; error: SupabaseError | null }> => {
    const { data, error } = await this.request<SupabaseSession>('verify', {
      method: 'POST',
      body: JSON.stringify({ email, token, type: 'email' }),
    });

    if (!data || error) {
      return { data: { session: null }, error };
    }

    this.session = data;
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(data));
    this.emit('SIGNED_IN', data);

    return { data: { session: data }, error: null };
  };

  signOut = async (): Promise<{ error: SupabaseError | null }> => {
    await this.hydrateSession();

    const accessToken = this.session?.access_token;
    if (accessToken) {
      await this.request('logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    }

    this.session = null;
    await SecureStore.deleteItemAsync(SESSION_KEY);
    this.emit('SIGNED_OUT', null);

    return { error: null };
  };

  getSession = async (): Promise<{ data: { session: SupabaseSession | null } }> => {
    await this.hydrateSession();
    return { data: { session: this.session } };
  };

  getUser = async (): Promise<{ data: { user: SupabaseUser | null } }> => {
    await this.hydrateSession();
    return { data: { user: this.session?.user ?? null } };
  };

  onAuthStateChange = (callback: AuthStateCallback): { data: { subscription: { unsubscribe: () => void } } } => {
    this.listeners.add(callback);

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners.delete(callback);
          },
        },
      },
    };
  };
}

export const supabase = {
  auth: new SupabaseAuth(),
};
