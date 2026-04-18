import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import InvoicesPage from './pages/InvoicesPage'
import CreateInvoicePage from './pages/CreateInvoicePage'
import InvoiceDetailPage from './pages/InvoiceDetailPage'
import CustomersPage from './pages/CustomersPage'
import ProductsPage from './pages/ProductsPage'
import CompanyPage from './pages/CompanyPage'

const PrivateRoute = ({ children }) => {
  const { token } = useSelector((s) => s.auth)
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,        // suppress React Router v7 warnings
        v7_relativeSplatPath: true,
      }}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            borderRadius: '12px',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#1e293b' } },
          error:   { iconTheme: { primary: '#f43f5e', secondary: '#1e293b' } },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"      element={<Dashboard />} />
          <Route path="invoices"       element={<InvoicesPage />} />
          <Route path="invoices/new"   element={<CreateInvoicePage />} />
          <Route path="invoices/:id"   element={<InvoiceDetailPage />} />
          <Route path="customers"      element={<CustomersPage />} />
          <Route path="products"       element={<ProductsPage />} />
          <Route path="company"        element={<CompanyPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
