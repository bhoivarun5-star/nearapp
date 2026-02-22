import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import UserList from './components/UserList';
import LiveMap from './components/LiveMap';
import { LogOut, Map as MapIcon, Users as UsersIcon } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('map'); // 'map' or 'users'

  useEffect(() => {
    const savedUser = localStorage.getItem('username');
    if (savedUser) {
      setUser({
        username: savedUser,
        userId: localStorage.getItem('userId'),
        token: localStorage.getItem('token')
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  if (!user) {
    return (
      <div className="container">
        <header className="py-12 text-center">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-4">
            GeoConnect
          </h1>
          <p className="text-text-muted text-lg">Real-time connection and location sharing</p>
        </header>
        <Auth onAuth={setUser} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass sticky top-4 mx-4 my-4 z-[1001] px-6 py-4 flex items-center justify-between border-white/10 shadow-xl">
        <h1 className="text-2xl font-bold text-primary">GeoConnect</h1>

        <div className="flex gap-4 items-center">
          <button
            onClick={() => setView('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${view === 'map' ? 'bg-primary text-white shadow-lg' : 'hover:bg-white/5'}`}
          >
            <MapIcon size={20} /> <span className="hidden sm:inline">Live Map</span>
          </button>
          <button
            onClick={() => setView('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${view === 'users' ? 'bg-primary text-white shadow-lg' : 'hover:bg-white/5'}`}
          >
            <UsersIcon size={20} /> <span className="hidden sm:inline">Discover</span>
          </button>

          <div className="w-[1px] h-8 bg-white/10 mx-2" />

          <div className="flex items-center gap-3 pr-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">{user.username}</p>
              <p className="text-xs text-text-muted">Online</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="container max-w-5xl">
        {view === 'map' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-bold">Your Live Location</h2>
                <p className="text-text-muted">Connected friends will appear on the map</p>
              </div>
            </div>
            <LiveMap userId={user.userId} />
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Community</h2>
            <UserList currentUser={user} />
          </div>
        )}
      </main>

      <footer className="py-12 text-center text-text-muted text-sm">
        &copy; 2026 GeoConnect App. Built with precision.
      </footer>
    </div>
  );
}

export default App;
