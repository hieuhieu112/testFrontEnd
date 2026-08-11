import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { orderDetailApi } from '../api/orderDetails';
import { orderApi } from '../api/orders';
import { productApi } from '../api/products';
import { OrderDetail, Order, Product } from '../types';

export default function OrderDetails() {
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<OrderDetail | null>(null);

  // Form states
  const [formData, setFormData] = useState({ orderId: 0, productId: 0, quantity: 1, price: 0 });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [detailsData, ordersData, productsData] = await Promise.all([
        orderDetailApi.getAll(),
        orderApi.getAll(),
        productApi.getAll(),
      ]);
      setOrderDetails(detailsData);
      setOrders(ordersData);
      setProducts(productsData);
    } catch (err) {
      setError('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.orderId) errors.orderId = 'Order is required';
    if (!formData.productId) errors.productId = 'Product is required';
    if (formData.quantity < 1 || !Number.isInteger(Number(formData.quantity))) errors.quantity = 'Quantity must be at least 1';
    if (formData.price <= 0) errors.price = 'Price must be greater than zero';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        order: { id: formData.orderId },
        product: { id: formData.productId },
        quantity: formData.quantity,
        price: formData.price,
      };

      if (selectedOrderDetail) {
        await orderDetailApi.update(selectedOrderDetail.id, payload);
        setSuccessMsg('Order detail updated successfully.');
      } else {
        await orderDetailApi.create(payload);
        setSuccessMsg('Order detail created successfully.');
      }
      setIsModalOpen(false);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to save order detail. Please check the information and try again.');
    }
  };

  const handleDelete = async () => {
    if (!selectedOrderDetail) return;
    try {
      await orderDetailApi.delete(selectedOrderDetail.id);
      setSuccessMsg('Order detail deleted successfully.');
      setIsDeleteModalOpen(false);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to delete order detail.');
    }
  };

  const openModal = (detail?: OrderDetail) => {
    setFormErrors({});
    setError('');
    if (detail) {
      setSelectedOrderDetail(detail);
      setFormData({ 
        orderId: detail.order?.id || 0, 
        productId: detail.product?.id || 0, 
        quantity: detail.quantity, 
        price: detail.price 
      });
    } else {
      setSelectedOrderDetail(null);
      setFormData({ 
        orderId: orders.length > 0 ? orders[0].id : 0, 
        productId: products.length > 0 ? products[0].id : 0, 
        quantity: 1, 
        price: 0 
      });
    }
    setIsModalOpen(true);
  };

  const filteredDetails = orderDetails.filter(d => 
    d.id.toString().includes(search) || 
    (d.product?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    d.order?.id.toString().includes(search)
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
              placeholder="Search details..."
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
            Add Detail
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading order details...</div>
        ) : filteredDetails.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No order details found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDetails.map((detail) => (
                  <tr key={detail.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{detail.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Order #{detail.order?.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {detail.product?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {detail.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(detail.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openModal(detail)} className="text-blue-600 hover:text-blue-900 mr-4 transition-colors">
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      <button onClick={() => { setSelectedOrderDetail(detail); setIsDeleteModalOpen(true); }} className="text-red-600 hover:text-red-900 transition-colors">
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

      {/* Order Detail Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{selectedOrderDetail ? 'Edit Order Detail' : 'Add Order Detail'}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <select
                  className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.orderId ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: Number(e.target.value) })}
                >
                  <option value={0} disabled>Select an order</option>
                  {orders.map(order => (
                    <option key={order.id} value={order.id}>Order #{order.id} - {order.user?.name}</option>
                  ))}
                </select>
                {formErrors.orderId && <p className="text-red-500 text-xs mt-1">{formErrors.orderId}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <select
                  className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.productId ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.productId}
                  onChange={(e) => {
                    const pid = Number(e.target.value);
                    const prod = products.find(p => p.id === pid);
                    setFormData({ ...formData, productId: pid, price: prod ? prod.price : formData.price });
                  }}
                >
                  <option value={0} disabled>Select a product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
                {formErrors.productId && <p className="text-red-500 text-xs mt-1">{formErrors.productId}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.quantity ? 'border-red-500' : 'border-gray-300'}`}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  />
                  {formErrors.quantity && <p className="text-red-500 text-xs mt-1">{formErrors.quantity}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.price ? 'border-red-500' : 'border-gray-300'}`}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                  {formErrors.price && <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                Save Detail
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Order Detail</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this order detail? This action cannot be undone.</p>
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
