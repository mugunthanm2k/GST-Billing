import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api/axios'

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', credentials)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data))
      return res.data
    } catch (err) {
      // Return the actual server error message
      const msg =
        err.response?.data ||
        err.response?.statusText ||
        err.message ||
        'Login failed'
      return rejectWithValue(typeof msg === 'string' ? msg : JSON.stringify(msg))
    }
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
})

const storedUser = localStorage.getItem('user')

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:    storedUser ? JSON.parse(storedUser) : null,
    token:   localStorage.getItem('token') || null,
    loading: false,
    error:   null,
  },
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending,   (s) => { s.loading = true;  s.error = null })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false
        s.user    = a.payload
        s.token   = a.payload.token
      })
      .addCase(login.rejected,  (s, a) => {
        s.loading = false
        s.error   = a.payload
      })
      .addCase(logout.fulfilled, (s) => {
        s.user  = null
        s.token = null
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
