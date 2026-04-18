import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import invoiceReducer from './invoiceSlice'
import customerReducer from './customerSlice'
import productReducer from './productSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    invoices: invoiceReducer,
    customers: customerReducer,
    products: productReducer,
  },
})
