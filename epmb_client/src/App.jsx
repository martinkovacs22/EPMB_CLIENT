import { useState } from 'react';
import { io } from 'socket.io-client';

import SignView from './components/Sign/SignView.jsx';
import MenuView from './components/Menu/MenuView.jsx';
import GameView from './components/Game/GameView.jsx';

export default function App() {
    // Nézet állapot: 'sign' | 'menu' | 'game'
    const [currentView, setCurrentView] = useState('sign');
    const [user, setUser] = useState(null);
    const [socket, setSocket] = useState(null);

    // Bejelentkezés kezelése
    const handleLoginSuccess = (userData) => {
        setUser(userData);
        setCurrentView('menu');
    };

    // Kijelentkezés és socket lekapcsolás
    const handleLogout = () => {
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
        setUser(null);
        setCurrentView('sign');
    };

    // Játék elindítása és a Socket.io kapcsolat kiépítése
    const handleStartGame = () => {
        setCurrentView('game');

        if (!socket) {
            const newSocket = io({
                autoConnect: true
            });

            newSocket.on('connect', () => {
                console.log('[SOCKET] Csatlakozva a szerverhez id:', newSocket.id);
            });

            setSocket(newSocket);
        }
    };

    return (
        <div className="app-container">
            {currentView === 'sign' && (
                <SignView onLoginSuccess={handleLoginSuccess} />
            )}

            {currentView === 'menu' && (
                <MenuView
                    user={user}
                    onStartGame={handleStartGame}
                    onLogout={handleLogout}
                />
            )}

            {currentView === 'game' && (
                <GameView
                    socket={socket}
                    onReturnToMenu={() => setCurrentView('menu')}
                />
            )}
        </div>
    );
}