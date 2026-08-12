import React, { useState, useEffect } from 'react';

export default function GameView({ socket, onReturnToMenu }) {
    const [gameState, setGameState] = useState(null);

    useEffect(() => {
        if (!socket) return;

        // Socket események hallgatása
        const handleGameState = (data) => {
            setGameState(data);
        };

        const handleMsgAck = (response) => {
            console.log('[GAME] Válasz a szervertől:', response);
        };

        socket.on('gameState', handleGameState);
        socket.on('msg_ack', handleMsgAck);

        return () => {
            socket.off('gameState', handleGameState);
            socket.off('msg_ack', handleMsgAck);
        };
    }, [socket]);

    const handleAction = (actionType) => {
        if (socket) {
            socket.emit('msg', { action: actionType, timestamp: Date.now() });
        }
    };

    return (
        <div className="view game-view">
            <h2>Játék Felület (Mount & Blade / GoodGame Empire)</h2>
            <p>Szerver kapcsolat: {socket?.connected ? '🟢 Csatlakozva' : '🔴 Csatlakozás...'}</p>

            {gameState && (
                <div className="game-stats">
                    <p>Arany: {gameState.gold}</p>
                </div>
            )}

            <div className="game-controls">
                <button onClick={() => handleAction('build_castle')}>Vár Építése</button>
                <button onClick={() => handleAction('recruit_army')}>Sereg Toborzása</button>
            </div>

            <br /><br />
            <button onClick={onReturnToMenu}>Vissza a Főmenübe</button>
        </div>
    );
}