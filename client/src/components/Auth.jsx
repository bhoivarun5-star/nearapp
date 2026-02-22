import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

const Auth = ({ onAuth }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const endpoint = isLogin ? '/api/login' : '/api/register';
        try {
            const { data } = await axios.post(`${API_URL}${endpoint}`, { username, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('username', data.username);
            onAuth(data);
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-8 w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>

                {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn-primary mt-2">
                        {isLogin ? 'Login' : 'Register'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-text-muted">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span
                        className="text-primary font-medium cursor-pointer hover:underline"
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </span>
                </p>
            </motion.div>
        </div>
    );
};

export default Auth;
