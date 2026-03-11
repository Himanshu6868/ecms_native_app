import * as SecureStore from 'expo-secure-store';

export const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
}

type AuthEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED';

type SupabaseError = {
  message: string;
};

type SupabaseUser = {
  id: string;
  email: string | null;
};

type SupabaseSession = {
  access_token: string;
  refresh_token: string;
  user: SupabaseUser;
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
      body: JSON.stringify({ email, create_user: options?.shouldCreateUser ?? true }),
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

  getUser = async (): Promise<{ data: { user: SupabaseUser | null }; error: SupabaseError | null }> => {
    await this.hydrateSession();
    return { data: { user: this.session?.user ?? null }, error: null };
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

type Filter = { column: string; operator: 'eq'; value: string };
type Sort = { column: string; ascending: boolean };

class SupabaseQueryBuilder {
  private selectColumns = '*';

  private filters: Filter[] = [];

  private sort: Sort | null = null;

  private updatePayload: Record<string, unknown> | null = null;

  constructor(
    private readonly table: string,
    private readonly auth: SupabaseAuth,
  ) {}

  select = (columns: string): this => {
    this.selectColumns = columns;
    return this;
  };

  eq = (column: string, value: string): this => {
    this.filters.push({ column, operator: 'eq', value });
    return this;
  };

  order = (column: string, options?: { ascending?: boolean }): this => {
    this.sort = { column, ascending: options?.ascending ?? true };
    return this;
  };

  update = (payload: Record<string, unknown>): this => {
    this.updatePayload = payload;
    return this;
  };

  private async request(method: 'GET' | 'PATCH'): Promise<{ data: Record<string, unknown>[] | null; error: SupabaseError | null }> {
    const params = new URLSearchParams();
    params.set('select', this.selectColumns);

    this.filters.forEach((filter) => {
      params.set(filter.column, `${filter.operator}.${filter.value}`);
    });

    if (this.sort) {
      params.set('order', `${this.sort.column}.${this.sort.ascending ? 'asc' : 'desc'}`);
    }

    const { data: sessionData } = await this.auth.getSession();
    if (!sessionData.session) {
      return { data: null, error: { message: 'Session not ready' } };
    }

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/${this.table}?${params.toString()}`, {
        method,
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json',
          Prefer: method === 'PATCH' ? 'return=representation' : '',
        },
        body: method === 'PATCH' ? JSON.stringify(this.updatePayload ?? {}) : undefined,
      });

      if (!response.ok) {
        const message = await response.text();
        return { data: null, error: { message: message || 'Failed to query table.' } };
      }

      const rows = (await response.json()) as Record<string, unknown>[];
      return { data: rows, error: null };
    } catch {
      return { data: null, error: { message: 'Network error. Please try again.' } };
    }
  }

  single = async <T extends Record<string, unknown>>(): Promise<{ data: T | null; error: SupabaseError | null }> => {
    const result = await this.request('GET');
    return { data: (result.data?.[0] as T | undefined) ?? null, error: result.error };
  };

  get = async <T extends Record<string, unknown>>(): Promise<{ data: T[] | null; error: SupabaseError | null }> => {
    const result = await this.request('GET');
    return { data: (result.data as T[] | null) ?? [], error: result.error };
  };

  execute = async <T extends Record<string, unknown>>(): Promise<{ data: T[] | null; error: SupabaseError | null }> => {
    const result = await this.request('PATCH');
    return { data: (result.data as T[] | null) ?? [], error: result.error };
  };
}

const auth = new SupabaseAuth();

export const supabase = {
  auth,
  from: (table: string): SupabaseQueryBuilder => new SupabaseQueryBuilder(table, auth),
};
