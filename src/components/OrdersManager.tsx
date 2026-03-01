import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];

interface OrderWithItems extends Order {
  items?: (OrderItem & { product_name?: string })[];
}

export function OrdersManager() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('*, product_id')
            .eq('order_id', order.id);

          const itemsWithNames = await Promise.all(
            (items || []).map(async (item) => {
              const { data: product } = await supabase
                .from('products')
                .select('name')
                .eq('id', item.product_id)
                .maybeSingle();

              return { ...item, product_name: product?.name || 'Unknown' };
            })
          );

          return { ...order, items: itemsWithNames };
        })
      );

      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      await loadOrders();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />;
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'cancelled':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Package className="text-gray-500" size={20} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ожидает';
      case 'completed':
        return 'Выполнен';
      case 'cancelled':
        return 'Отменён';
      default:
        return status;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка заказов...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Заказы</h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{order.customer_name}</h3>
                <p className="text-gray-600">Телефон: {order.phone}</p>
                <p className="text-gray-600">Адрес: {order.address}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(order.created_at).toLocaleString('ru-RU')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                <span className="font-medium">{getStatusText(order.status)}</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-4">
              <h4 className="font-semibold mb-2 text-gray-700">Товары:</h4>
              <ul className="space-y-1">
                {order.items?.map((item) => (
                  <li key={item.id} className="text-gray-600">
                    {item.product_name} × {item.quantity} = {(item.price * item.quantity).toFixed(2)} ₸
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-between items-center border-t pt-4">
              <span className="text-xl font-bold text-orange-600">
                Итого: {order.total_amount.toFixed(2)} ₸
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => updateOrderStatus(order.id, 'completed')}
                  disabled={order.status === 'completed'}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                >
                  Выполнен
                </button>
                <button
                  onClick={() => updateOrderStatus(order.id, 'cancelled')}
                  disabled={order.status === 'cancelled'}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                >
                  Отменить
                </button>
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <p className="text-center text-gray-600 py-8">Заказов пока нет</p>
        )}
      </div>
    </div>
  );
}
