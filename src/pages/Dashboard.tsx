import { useEffect, useState } from 'react';
import { Package, ShoppingCart, FileText } from 'lucide-react';
import { productApi } from '../api/products';
import { orderApi } from '../api/orders';
import { orderDetailApi } from '../api/orderDetails';
import { Product, Order, OrderDetail } from '../types';

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, ordersData, orderDetailsData] = await Promise.all([
          productApi.getAll(),
          orderApi.getAll(),
          orderDetailApi.getAll(),
        ]);
        setProducts(productsData);
        setOrders(ordersData);
        setOrderDetails(orderDetailsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const recentProducts = [...products].sort((a, b) => b.id - a.id).slice(0, 5);
  const recentOrders = [...orders].sort((a, b) => b.id - a.id).slice(0, 5);

  const stats = [
    { label: 'Total Products', value: products.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Order Details', value: orderDetails.length, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className={`p-4 rounded-full ${stat.bg} ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h3>
          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center p-4 border border-gray-50 rounded-lg bg-gray-50/50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Order #{order.id}</p>
                    <p className="text-xs text-gray-500">User: {order.user?.name || 'Unknown'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.totalAmount)}
                    </p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                      order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No orders found.</p>
          )}
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recently Added Products</h3>
          {recentProducts.length > 0 ? (
            <div className="space-y-4">
              {recentProducts.map((product) => (
                <div key={product.id} className="flex justify-between items-center p-4 border border-gray-50 rounded-lg bg-gray-50/50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">Stock: {product.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No products found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
