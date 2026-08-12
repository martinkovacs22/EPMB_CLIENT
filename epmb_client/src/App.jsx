import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import SignUp from './components/SignUp.jsx';
import Login from './components/Login.jsx';
import RoomCreate from './RoomCreate';
import './index.css';

export default function App() {
    const [auth, setAuth] = useState({ isLoggedIn: false, user: null });
    const [notifications, setNotifications] = useState([]);

    // 1. Auth állapot lekérése indításkor
    useEffect(() => {
        fetch('/user/status')
            .then(res => res.json())
            .then(data => setAuth({ isLoggedIn: data.isLoggedIn, user: data.user }))
            .catch(err => console.error(err));
    }, []);

    // 2. Csak az értesítési névtérre csatlakozunk, ha be van jelentkezve
    useEffect(() => {
        if (!auth.isLoggedIn) return;

        // Kifejezetten a /notifications namespace-hez kapcsolódunk
        const socket = io('/notifications', {
            withCredentials: true
        });

        socket.on('connect', () => {
            console.log('[NOTIFICATION SOCKET] Csatlakozva!');
        });

        socket.on('room_invite', (data) => {
            console.log('[NOTIFICATION SOCKET] Új meghívó:', data);
            setNotifications(prev => [data, ...prev]);
        });

        socket.on('connect_error', (err) => {
            console.error('[NOTIFICATION SOCKET ERROR]:', err.message);
        });

        return () => {
            socket.disconnect();
        };
    }, [auth.isLoggedIn]);

    const handleLogout = async () => {
        await fetch('/user/logout', { method: 'POST' });
        setAuth({ isLoggedIn: false, user: null });
        setNotifications([]);
    };

    return (
        <Router>
            <nav className="navbar">
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--accent-color)' }}>
                    EPMB Dungeon
                </div>
                <div className="nav-links">
                    {auth.isLoggedIn ? (
                        <>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Üdv, <b>{auth.user?.username}</b>!
                            </span>
                            <Link to="/roomcreate">Szoba Létrehozás</Link>
                            <button onClick={handleLogout} className="nav-btn">Kijelentkezés</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Bejelentkezés</Link>
                            <Link to="/signup">Regisztráció</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Értesítések kiírása */}
            {notifications.length > 0 && (
                <div style={{ maxWidth: '600px', margin: '1rem auto' }}>
                    {notifications.map((notif, index) => (
                        <div key={index} className="alert alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>
                                🎮 <b>{notif.invitedBy}</b> meghívott a(z) <b>{notif.roomName}</b> játékba!
                            </span>
                            <button
                                onClick={() => setNotifications(prev => prev.filter((_, i) => i !== index))}
                                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                                X
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <Routes>
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login onLoginSuccess={(user) => setAuth({ isLoggedIn: true, user })} />} />
                <Route path="/roomcreate" element={<RoomCreate isLoggedIn={auth.isLoggedIn} />} />
                <Route path="*" element={
                    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                        <h1>Üdvözöl az EPMB Dungeon Játékban!</h1>
                    </div>
                } />
            </Routes>
        </Router>
    );
}