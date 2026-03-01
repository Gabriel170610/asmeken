import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { ClientView } from './components/ClientView';
import { AdminView } from './components/AdminView';
import { LoginForm } from './components/LoginForm';
import { ShoppingCart, Lock } from 'lucide-react';

type Screen = 'menu' | 'client' | 'admin-login';

function App() {
  const { user, isAdmin, loading, signIn, signOut } = useAuth();
  const [screen, setScreen] = useState<Screen>('menu');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Загрузка...</div>
      </div>
    );
  }

  const handleAdminExit = async () => {
    await signOut();
    setScreen('menu');
  };

  const handleClientExit = () => {
    setScreen('menu');
  };

  if (user && isAdmin && screen === 'admin-login') {
    return <AdminView onLogout={handleAdminExit} />;
  }

  if (screen === 'client') {
    return <ClientView onBack={handleClientExit} />;
  }

  if (screen === 'admin-login') {
    return <LoginForm onLogin={signIn} onBack={() => setScreen('menu')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Добро пожаловать</h1>
        <p className="text-gray-600 mb-12">Выберите роль для входа</p>

        <div className="space-y-4">
          <button
            onClick={() => setScreen('client')}
            className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
          >
            <ShoppingCart size={24} />
            Войти как клиент
          </button>

          <button
            onClick={() => setScreen('admin-login')}
            className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
          >
            <Lock size={24} />
            Войти в админ панель
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
