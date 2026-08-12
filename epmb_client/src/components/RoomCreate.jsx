import React, { useState, useEffect } from 'react';

export default function RoomCreate({ isLoggedIn }) {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [x, setX] = useState(1);
    const [y, setY] = useState(5);

    const [availableUsers, setAvailableUsers] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [status, setStatus] = useState({ type: '', text: '' });

    const availableEvents = [
        { id: 1, name: '1. Event (Kizárólag Jutalom, Odds: 50)' },
        { id: 2, name: '2. Event (Barlangi Troll, Odds: 5)' },
        { id: 3, name: '3. Event (Kobold Portyázó, Odds: 30)' },
        { id: 4, name: '4. Event (Óriáspók, Odds: 20)' },
        { id: 5, name: '5. Event (Rablóbanda Vezér, Odds: 15)' }
    ];
    const [selectedEventIds, setSelectedEventIds] = useState([1, 2, 3, 4, 5]);

    useEffect(() => {
        fetch('/user/list')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setAvailableUsers(data); })
            .catch(err => console.error(err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', text: '' });

        try {
            const res = await fetch('/room/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name, password, x: Number(x), y: Number(y),
                    userIds: selectedUserIds, eventIds: selectedEventIds
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setStatus({
                type: 'success',
                text: `Szoba sikeresen megnyitva! (Generált szobák száma: ${data.room.generatedDungeon.length})`
            });
            setName('');
            setPassword('');
        } catch (err) {
            setStatus({ type: 'error', text: err.message });
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="form-card">
                <h2>Hozzáférés Megtagadva</h2>
                <p className="alert alert-error">A szobakészítéshez be kell jelentkezned!</p>
            </div>
        );
    }

    return (
        <div className="form-card" style={{ maxWidth: '650px' }}>
            <h2>Kazamata Szoba Létrehozása</h2>
            {status.text && <div className={`alert alert-${status.type}`}>{status.text}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Szoba Neve</label>
                    <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
                </div>

                <div className="form-group">
                    <label>Jelszó (Opcionális)</label>
                    <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Méret X</label>
                        <input type="number" min="1" className="form-input" value={x} onChange={e => setX(e.target.value)} required />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Méret Y</label>
                        <input type="number" min="1" className="form-input" value={y} onChange={e => setY(e.target.value)} required />
                    </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Generálandó kazamata szobák száma: <b>{x * y}</b>
                </p>

                <div className="form-group">
                    <label>Kiválasztható Játékosok</label>
                    <div className="checkbox-group">
                        {availableUsers.map(u => (
                            <label key={u.id} className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={selectedUserIds.includes(u.id)}
                                    onChange={() => setSelectedUserIds(prev => prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id])}
                                />
                                {u.username}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label>Sorsolható Eventek</label>
                    <div className="checkbox-group">
                        {availableEvents.map(ev => (
                            <label key={ev.id} className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={selectedEventIds.includes(ev.id)}
                                    onChange={() => setSelectedEventIds(prev => prev.includes(ev.id) ? prev.filter(id => id !== ev.id) : [...prev, ev.id])}
                                />
                                {ev.name}
                            </label>
                        ))}
                    </div>
                </div>

                <button type="submit" className="btn-primary" style={{ backgroundColor: 'var(--success)' }}>
                    Szoba Létrehozása
                </button>
            </form>
        </div>
    );
}