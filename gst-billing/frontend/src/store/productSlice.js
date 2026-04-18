import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api/axios'

export const fetchProducts = createAsyncThunk('products/fetchAll', async () => {
  const res = await api.get('/products')
  return res.data
})

export const createProduct = createAsyncThunk('products/create', async (data) => {
  const res = await api.post('/products', data)
  return res.data
})

export const updateProduct = createAsyncThunk('products/update', async ({ id, data }) => {
  const res = await api.put(`/products/${id}`, data)
  return res.data
})

export const deleteProduct = createAsyncThunk('products/delete', async (id) => {
  await api.delete(`/products/${id}`)
  return id
})

const productSlice = createSlice({
  name: 'products',
  initialState: { list: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (s) => { s.loading = true })
      .addCase(fetchProducts.fulfilled, (s, a) => { s.loading = false; s.list = a.payload })
      .addCase(createProduct.fulfilled, (s, a) => { s.list.push(a.payload) })
      .addCase(updateProduct.fulfilled, (s, a) => {
        const idx = s.list.findIndex(p => p.id === a.payload.id)
        if (idx >= 0) s.list[idx] = a.payload
      })
      .addCase(deleteProduct.fulfilled, (s, a) => {
        s.list = s.list.filter(p => p.id !== a.payload)
      })
  },
})

export default productSlice.reducer
