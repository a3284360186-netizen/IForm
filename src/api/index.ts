const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

interface RequestOptions {
  method?: string
  body?: any
  headers?: Record<string, string>
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('token')
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Request failed')
  }

  return data
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ data: { user: any; token: string } }>('/auth/login', {
        method: 'POST',
        body: { email, password },
      }),
    register: (email: string, password: string, nickname: string) =>
      request<{ data: { user: any; token: string } }>('/auth/register', {
        method: 'POST',
        body: { email, password, nickname },
      }),
    getMe: () =>
      request<{ data: any }>('/auth/me'),
  },

  posts: {
    list: (params?: { category?: string; sort?: string; page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams()
      if (params?.category) searchParams.set('category', params.category)
      if (params?.sort) searchParams.set('sort', params.sort)
      if (params?.page) searchParams.set('page', String(params.page))
      if (params?.limit) searchParams.set('limit', String(params.limit))
      const query = searchParams.toString()
      return request<{ data: { posts: any[]; total: number; page: number; totalPages: number } }>(
        `/posts${query ? `?${query}` : ''}`
      )
    },
    get: (id: number) =>
      request<{ data: any }>(`/posts/${id}`),
    create: (title: string, content: string, category: string) =>
      request<{ data: any }>('/posts', {
        method: 'POST',
        body: { title, content, category },
      }),
    update: (id: number, data: { title?: string; content?: string; category?: string }) =>
      request<{ data: any }>(`/posts/${id}`, {
        method: 'PUT',
        body: data,
      }),
    delete: (id: number) =>
      request<{ message: string }>(`/posts/${id}`, {
        method: 'DELETE',
      }),
    like: (id: number) =>
      request<{ data: { liked: boolean } }>(`/posts/${id}/like`, {
        method: 'POST',
      }),
    collect: (id: number) =>
      request<{ data: { collected: boolean } }>(`/posts/${id}/collect`, {
        method: 'POST',
      }),
  },

  comments: {
    list: (postId: number) =>
      request<{ data: any[] }>(`/posts/${postId}/comments`),
    create: (postId: number, content: string, parentId?: number) =>
      request<{ data: any }>(`/posts/${postId}/comments`, {
        method: 'POST',
        body: { content, parentId },
      }),
    delete: (postId: number, commentId: number) =>
      request<{ message: string }>(`/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
      }),
  },

  users: {
    get: (id: number) =>
      request<{ data: any }>(`/users/${id}`),
    update: (id: number, data: { nickname?: string; bio?: string; avatar?: string }) =>
      request<{ data: any }>(`/users/${id}`, {
        method: 'PUT',
        body: data,
      }),
    posts: (id: number) =>
      request<{ data: any[] }>(`/users/${id}/posts`),
    collects: (id: number) =>
      request<{ data: any[] }>(`/users/${id}/collects`),
  },

  categories: {
    list: () =>
      request<{ data: any[] }>('/categories'),
  },
}

export default api
