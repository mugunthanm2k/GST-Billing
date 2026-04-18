import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api/axios'

export const fetchCustomers = createAsyncThunk('customers/fetchAll', async () => {
  const res = await api.get('/customers')
  return res.data
})

export const createCustomer = createAsyncThunk('customers/create', async (data) => {
  const res = await api.post('/customers', data)
  return res.data
})

export const updateCustomer = createAsyncThunk('customers/update', async ({ id, data }) => {
  const res = await api.put(`/customers/${id}`, data)
  return res.data
})

export const deleteCustomer = createAsyncThunk('customers/delete', async (id) => {
  await api.delete(`/customers/${id}`)
  return id
})

const customerSlice = createSlice({
  name: 'customers',
  initialState: { list: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (s) => { s.loading = true })
      .addCase(fetchCustomers.fulfilled, (s, a) => { s.loading = false; s.list = a.payload })
      .addCase(createCustomer.fulfilled, (s, a) => { s.list.push(a.payload) })
      .addCase(updateCustomer.fulfilled, (s, a) => {
        const idx = s.list.findIndex(c => c.id === a.payload.id)
        if (idx >= 0) s.list[idx] = a.payload
      })
      .addCase(deleteCustomer.fulfilled, (s, a) => {
        s.list = s.list.filter(c => c.id !== a.payload)
      })
  },
})

export default customerSlice.reducer
