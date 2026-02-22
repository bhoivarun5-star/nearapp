import { useEffect, useState } from 'react';
import axios from 'axios';
import { UserPlus, Check, Clock } from 'lucide-react';

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

const UserList = ({ currentUser }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_URL}/api/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        const interval = setInterval(fetchUsers, 5000); // Poll for updates
        return () => clearInterval(interval);
    }, []);

    const sendRequest = async (targetUserId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/connect`, { targetUserId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
        } catch (err) {
            console.error('Failed to send request', err);
        }
    };

    const acceptRequest = async (requesterId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/accept`, { requesterId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
        } catch (err) {
            console.error('Failed to accept request', err);
        }
    };

    if (loading) return <div className="text-center p-8">Loading users...</div>;

    return (
        <div className="glass p-6">
            <h3 className="text-xl font-bold mb-4">Discover People</h3>
            <div className="space-y-4">
                {users.length === 0 && <p className="text-text-muted">No other users found.</p>}
                {users.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold">
                                {user.username[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold">{user.username}</p>
                                <p className="text-xs text-text-muted capitalize">{user.connectionStatus}</p>
                            </div>
                        </div>

                        <div>
                            {user.connectionStatus === 'none' && (
                                <button onClick={() => sendRequest(user.id)} className="p-2 bg-primary/20 hover:bg-primary/40 text-primary rounded-full transition-colors">
                                    <UserPlus size={20} />
                                </button>
                            )}
                            {user.connectionStatus === 'pending' && user.isRequester && (
                                <div className="p-2 text-yellow-500 flex items-center gap-1 text-sm">
                                    <Clock size={16} /> Pending
                                </div>
                            )}
                            {user.connectionStatus === 'pending' && !user.isRequester && (
                                <button onClick={() => acceptRequest(user.id)} className="p-2 bg-accent/20 hover:bg-accent/40 text-accent rounded-full transition-colors flex items-center gap-2 px-4 text-sm font-medium">
                                    <Check size={16} /> Accept
                                </button>
                            )}
                            {user.connectionStatus === 'accepted' && (
                                <div className="p-2 text-accent flex items-center gap-1 text-sm font-medium">
                                    <Check size={20} /> Connected
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserList;
