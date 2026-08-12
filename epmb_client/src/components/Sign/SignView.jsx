import React, { useState } from 'react';

export default function SignView({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!username.trim()) return;

        // Itt küldhető el az autentikációs kérés a szerver felé (például HTTP POST-tal vagy Socketen keresztül)
        console.log(`[AUTH] ${isRegister ? 'Regisztráció' : 'Bejelentkezés'}:`, username);

        // Sikeres belépés szimulálása
        onLoginSuccess({ username });
    };

    return (
        <div className="view sign-view">
            <h2>{isRegister ? 'Regisztráció' : 'Bejelentkezés'}</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Felhasználónév: </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <br />
                <div>
                    <label>Jelszó: </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <br />
                <button type="submit">
                    {isRegister ? 'Fiók Létrehozása' : 'Belépés'}
                </button>
            </form>

            <br />
            <button onClick={() => setIsRegister(!isRegister)}>
                {isRegister ? 'Váltás Bejelentkezésre' : 'Váltás Regisztrációra'}
            </button>
        </div>
    );
}