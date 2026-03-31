const BASE_URL = 'http://localhost:8000/api';

const buildBody = (data) => {
  if (data instanceof FormData) {
    return { body: data };
  }

  return {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.detail || 'Something went wrong');
  }
  return response.json();
};

export const api = {
  get: async (url) => {
    const response = await fetch(`${BASE_URL}${url}`);
    return handleResponse(response);
  },
  post: async (url, data) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      ...buildBody(data),
    });
    return handleResponse(response);
  },
  put: async (url, data) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'PUT',
      ...buildBody(data),
    });
    return handleResponse(response);
  },
  delete: async (url) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Delete failed');
    return true;
  },
};
