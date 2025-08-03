// Authentication utility functions
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

export const getUserFromToken = async () => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const response = await fetch('/api/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const result = await response.json();
      return result.user;
    } else {
      // Token might be invalid, remove it
      removeAuthToken();
      return null;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    removeAuthToken();
    return null;
  }
};

export const logout = () => {
  removeAuthToken();
  // Redirect to home page
  window.location.href = '/';
};