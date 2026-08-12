import React, { useState } from 'react';

export default function MenuView({ user, onStartGame, onLogout }) {
    const [showSettings, setShowSettings] = useState(false);
    const [volume, setVolume] = useState(80);

    return (
        <div className="view menu-view">
            <h2>Főmenü</h2>
            <p>Üdvözöllek, <strong>{user?.username || 'Játékos'}</strong>!</p>

            {!showSettings ? (
                <div className="menu-buttons">
                    <button onClick={onStartGame}>🎮 Játék Indítása</button>
                    <br /><br />
                    <button onClick={() => setShowSettings(true)}>⚙️ Beállítások</button>
                    <br /><br />
                    <button onClick={onLogout}>🚪 Kijelentkezés</button>
                </div>
            ) : (
                <div className="settings-panel">
                    <h3>Beállítások</h3>
                    <div>
                        <label>Hangerő: {volume}% </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={(e) => setVolume(e.target.value)}
                        />
                    </div>
                    <br />
                    <button onClick={() => setShowSettings(false)}>Vissza a menübe</button>
                </div>
            )}
        </div>
    );
}