import { api } from './api';

const USER_STORAGE_KEY = 'ecoforge_user_session';

export const authService = {
  /**
   * Register a new user account
   */
  async register({ name, email, password }) {
    const payload = {
      name: name?.trim(),
      email: email?.trim().toLowerCase(),
      password,
    };
    const res = await api.post('/auth/register', payload);
    return res;
  },

  /**
   * Authenticate user credentials (supports both demo mode and registered accounts)
   */
  async login({ email, password }) {
    const payload = {
      email: email?.trim().toLowerCase(),
      password,
    };
    const res = await api.post('/auth/login', payload);
    if (res?.success && res?.data?.user) {
      this.setCurrentUser(res.data.user);
    }
    return res;
  },

  /**
   * Retrieve active user session from localStorage
   */
  getCurrentUser() {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  /**
   * Persist active user session in localStorage
   */
  setCurrentUser(user) {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (err) {
      console.warn('Could not save user session to localStorage:', err);
    }
  },

  /**
   * Clear active user session
   */
  logout() {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // ignore
    }
  },
};

export default authService;
