import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { orderApi } from '../api/orders';
import { userApi } from '../api/users';
import { Order, User } from '../types';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Form states
  const [formData, setFormData] = useState({ userId: 0, totalAmount: 0, status: 'PENDING' });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersData, usersData] = await Promise.all([
        orderApi.getAll(),
        userApi.getAll(),
      ]);
      setOrders(ordersData);
      setUsers(usersData);
    } catch (err) {
      setError('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.userId) errors.userId = 'User is required';
    if (formData.totalAmount < 0) errors.totalAmount = 'Total amount must be positive or zero';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        user: { id: formData.userId },
        totalAmount: formData.totalAmount,
        status: formData.status,
      };

      if (selectedOrder) {
        await orderApi.update(selectedOrder.id, payload);
        setSuccessMsg('Order updated successfully.');
      } else {
        await orderApi.create(payload);
        setSuccessMsg('Order created successfully.');
      }
      setIsModalOpen(false);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to save order. Please check the information and try again.');
    }
  };

  const handleDelete = async () => {
    if (!selectedOrder) return;
    try {
      await orderApi.delete(selectedOrder.id);
      setSuccessMsg('Order deleted successfully.');
      setIsDeleteModalOpen(false);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to delete order.');
    }
  };

  const openModal = (order?: Order) => {
    setFormErrors({});
    setError('');
    if (order) {
      setSelectedOrder(order);
      setFormData({ userId: order.user?.id || 0, totalAmount: order.totalAmount, status: order.status });
    } else {
      setSelectedOrder(null);
      setFormData({ userId: users.length > 0 ? users[0].id : 0, totalAmount: 0, status: 'PENDING' });
    }
    setIsModalOpen(true);
  };

  const filteredOrders = orders.filter(o => 
    o.id.toString().includes(search) || 
    (o.user?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="bg-green-50 text-green-800 p-4 rounded-lg flex items-center shadow-sm border border-green-100">
          <CheckCircle className="w-5 h-5 mr-2" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg flex items-center shadow-sm border border-red-100">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Order
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.user?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{order.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openModal(order)} className="text-blue-600 hover:text-blue-900 mr-4 transition-colors">
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      <button onClick={() => { setSelectedOrder(order); setIsDeleteModalOpen(true); }} className="text-red-600 hover:text-red-900 transition-colors">
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{selectedOrder ? 'Edit Order' : 'Add Order'}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <select
                  className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.userId ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: Number(e.target.value) })}
                >
                  <option value={0} disabled>Select a customer</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name} - {user.email}</option>
                  ))}
                </select>
                {formErrors.userId && <p className="text-red-500 text-xs mt-1">{formErrors.userId}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.totalAmount ? 'border-red-500' : 'border-gray-300'}`}
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                  />
                  {formErrors.totalAmount && <p className="text-red-500 text-xs mt-1">{formErrors.totalAmount}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                Save Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Order</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete order #{selectedOrder?.id}? This action cannot be undone.</p>
            <div className="flex justify-center space-x-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
