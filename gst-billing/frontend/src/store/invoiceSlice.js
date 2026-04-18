import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api/axios'

export const fetchInvoices = createAsyncThunk('invoices/fetchAll', async (params = {}) => {
  const res = await api.get('/invoices', { params })
  return res.data
})

export const createInvoice = createAsyncThunk('invoices/create', async (data) => {
  const res = await api.post('/invoices', data)
  return res.data
})

export const updateInvoiceStatus = createAsyncThunk('invoices/updateStatus', async ({ id, status }) => {
  const res = await api.patch(`/invoices/${id}/status`, null, { params: { status } })
  return res.data
})

export const deleteInvoice = createAsyncThunk('invoices/delete', async (id) => {
  await api.delete(`/invoices/${id}`)
  return id
})

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (s) => { s.loading = true })
      .addCase(fetchInvoices.fulfilled, (s, a) => { s.loading = false; s.list = a.payload })
      .addCase(fetchInvoices.rejected, (s, a) => { s.loading = false; s.error = a.error.message })
      .addCase(createInvoice.fulfilled, (s, a) => { s.list.unshift(a.payload) })
      .addCase(updateInvoiceStatus.fulfilled, (s, a) => {
        const idx = s.list.findIndex(i => i.id === a.payload.id)
        if (idx >= 0) s.list[idx] = a.payload
      })
      .addCase(deleteInvoice.fulfilled, (s, a) => {
        s.list = s.list.filter(i => i.id !== a.payload)
      })
  },
})

export default invoiceSlice.reducer
