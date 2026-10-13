import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/home'
import Landing from './pages/landing'
import Register from './pages/register'
import Login from './pages/login'
import Admin from './pages/admin'
import StoreOwner from './pages/storeOwner'
import StoreProducts from './pages/storeProducts'
import StoreOrders from './pages/storeOrders'
import Account from './pages/account'
import Cart from './pages/cart'
import StorePage from './pages/storePage'
import ProductPage from './pages/productPage'
import MyAddress from './pages/myAddress'
import Checkout from './pages/checkout'
import Orders from './pages/orders'
import FilterSearch from './pages/filterSearch'
import { RequireAuth, RequireAdmin, RequireStoreOwner, CustomerOnly } from './components/routeGuard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route path="/home" element={<CustomerOnly><Home /></CustomerOnly>} />
        <Route path="/store/:id" element={<CustomerOnly><StorePage /></CustomerOnly>} />
        <Route path="/product/:id" element={<CustomerOnly><ProductPage /></CustomerOnly>} />
        <Route path="/filter-search" element={<CustomerOnly><FilterSearch /></CustomerOnly>} />

        <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
        <Route path="/store-owner" element={<RequireStoreOwner><StoreOwner /></RequireStoreOwner>} />
        <Route path="/store-owner/store/:storeId/products" element={<RequireStoreOwner><StoreProducts /></RequireStoreOwner>} />
        <Route path="/store-owner/orders" element={<RequireStoreOwner><StoreOrders /></RequireStoreOwner>} />

        <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
        <Route path="/cart" element={<RequireAuth><CustomerOnly><Cart /></CustomerOnly></RequireAuth>} />
        <Route path="/checkout" element={<RequireAuth><CustomerOnly><Checkout /></CustomerOnly></RequireAuth>} />
        <Route path="/orders" element={<RequireAuth><CustomerOnly><Orders /></CustomerOnly></RequireAuth>} />
        <Route path="/address" element={<RequireAuth><MyAddress /></RequireAuth>} />
        <Route path="/settings" element={<Navigate to="/account" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
