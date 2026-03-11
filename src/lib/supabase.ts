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

type PostgrestFilter = {
  column: string;
  operator: 'ilike';
  value: string;
};

type PostgrestSingleResponse<T> = {
  data: T | null;
  error: SupabaseError | null;
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

  signInWithOtp = async ({
    email,
    options,
  }: {
    email: string;
    options?: {
      shouldCreateUser?: boolean;
    };
  }): Promise<{ error: SupabaseError | null }> => {
    const { error } = await this.request('otp', {
      method: 'POST',
      body: JSON.stringify({ email, create_user: options?.shouldCreateUser ?? false }),
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

  getSession = async (): Promise<{ data: { session: SupabaseSession | null }; error: SupabaseError | null }> => {
    await this.hydrateSession();
    return { data: { session: this.session }, error: null };
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

class SupabaseQueryBuilder<T extends Record<string, unknown>> {
  private selectColumns = '*';

  private filters: PostgrestFilter[] = [];

  constructor(
    private readonly table: string,
    private readonly auth: SupabaseAuth,
  ) {}

  select = (columns: string): this => {
    this.selectColumns = columns;
    return this;
  };

  ilike = (column: string, value: string): this => {
    this.filters.push({ column, operator: 'ilike', value });
    return this;
  };

  single = async (): Promise<PostgrestSingleResponse<T>> => {
    const params = new URLSearchParams();
    params.set('select', this.selectColumns);
    this.filters.forEach((filter) => {
      params.set(filter.column, `${filter.operator}.${filter.value}`);
    });
    params.set('limit', '1');

    const { data: sessionData } = await this.auth.getSession();
    if (!sessionData.session) {
      return { data: null, error: { message: 'Session not ready' } };
    }

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/${this.table}?${params.toString()}`, {
        method: 'GET',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const message = await response.text();
        return { data: null, error: { message: message || 'Failed to query table.' } };
      }

      const rows = (await response.json()) as T[];

      return { data: rows[0] ?? null, error: null };
    } catch {
      return { data: null, error: { message: 'Network error. Please try again.' } };
    }
  };
}

export const supabase = {
  auth: new SupabaseAuth(),
  from: <T extends Record<string, unknown>>(table: string): SupabaseQueryBuilder<T> => new SupabaseQueryBuilder(table, supabase.auth),
};
