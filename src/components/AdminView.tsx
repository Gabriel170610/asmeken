import { useState } from 'react';
import { LogOut, Package, ShoppingBag, ArrowLeft } from 'lucide-react';
import { OrdersManager } from './OrdersManager';
import { ProductsManager } from './ProductsManager';

type Tab = 'orders' | 'products';

interface AdminViewProps {
  onLogout?: () => void;
}

export function AdminView({ onLogout }: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('orders');

  const handleSignOut = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {onLogout && (
                <button
                  onClick={handleSignOut}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={24} className="text-gray-600" />
                </button>
              )}
              <h1 className="text-2xl font-bold text-orange-600">Админ панель</h1>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'orders'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <ShoppingBag size={20} />
              Заказы
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'products'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Package size={20} />
              Меню
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'orders' ? <OrdersManager /> : <ProductsManager />}
        </div>
      </div>
    </div>
  );
}
