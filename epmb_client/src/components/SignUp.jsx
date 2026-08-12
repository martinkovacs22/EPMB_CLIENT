import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignUp() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/user/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setMessage({ type: 'success', text: 'Sikeres regisztráció! Átirányítás...' });
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        }
    };

    return (
        <div className="form-card">
            <h2>Regisztráció</h2>
            {message.text && (
                <div className={`alert alert-${message.type}`}>{message.text}</div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Felhasználónév</label>
                    <input
                        type="text"
                        className="form-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Jelszó</label>
                    <input
                        type="password"
                        className="form-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn-primary">Fiók Létrehozása</button>
            </form>
        </div>
    );
}