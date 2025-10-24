async function apiRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An error occurred');
  }

  return data;
}

export const signUp = async (email: string, password: string) => {
  try {
    await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return { data: { message: 'User created successfully' }, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error.message } };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const data = await apiRequest('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error.message } };
  }
};

export const signInWithGoogle = async () => {
  return { 
    data: null, 
    error: { message: 'Google sign-in is not currently supported' } 
  };
};

export const signOut = async () => {
  try {
    await apiRequest('/api/auth/signout', {
      method: 'POST',
    });
    return { error: null };
  } catch (error: any) {
    return { error: { message: error.message } };
  }
};

export const getCurrentUser = async () => {
  try {
    const data = await apiRequest('/api/auth/me');
    return { user: data.user, error: null };
  } catch (error: any) {
    return { user: null, error: { message: error.message } };
  }
};

export const getUserRole = async (userId: string) => {
  try {
    const response = await fetch(`/api/user-role/${userId}`, {
      credentials: 'include',
    });
    const data = await response.json();
    return { role: data?.role, error: null };
  } catch (error: any) {
    return { role: null, error: { message: error.message } };
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const response = await fetch(`/api/profile/${userId}`, {
      credentials: 'include',
    });
    const data = await response.json();
    return { profile: data, error: null };
  } catch (error: any) {
    return { profile: null, error: { message: error.message } };
  }
};
