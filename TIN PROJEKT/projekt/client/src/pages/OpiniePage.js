import { useEffect, useState } from "react"
import { Link } from "react-router-dom";

export const OpiniePage = () => {
    const [error, setError] = useState(null);
    const [opinie, setOpinie] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOpinionId, setExpandedOpinionId] = useState(null);


    // pobieranie danych ostatnich 12 opinii
    useEffect(() => {
        const fetchOpinie = async () => {
            try {
                const response = await fetch('/api/opinie');
                if (!response.ok) {
                    throw new Error('Błąd podczas pobierania opinii')
                }
                const data = await response.json();
                setOpinie(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchOpinie();
    }, []);

    // Funkcja do zmiany stanu rozwiniętej opinii
    const toggleComment = (id) => {
        setExpandedOpinionId(prevId => (prevId === id ? null : id));
        console.log(expandedOpinionId);
    };

    if (loading) return <p>Ładowanie opinii...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="opinie-page">
            <h1>Ostatnie opinie:</h1>
            <div className="opinie-list">
                {opinie.length === 0 ? (
                    <p>Brak opinii.</p>
                ) : (
                    opinie.map((opinia) => (
                        <div className="card" key={opinia.id} onClick={() => toggleComment(opinia.id)}>
                            <h3>
                                <Link to={`/lowiska/${opinia.lowisko_id}`} className='opinia-lowisko-link'>
                                    {opinia.nazwa}
                                </Link>
                            </h3>
                            <h4>Opinia użytkownika: {opinia.username}</h4>
                            <p>
                                <strong style={{ color: opinia.ocena >= 3 ? '#88b04b' : '#e74c3c' }}>
                                    Ocena:
                                </strong> 
                                {opinia.ocena}⭐
                            </p>
                            {expandedOpinionId === opinia.id && opinia.komentarz.length > 0 && (
                                <p><strong>Komentarz: </strong>{opinia.komentarz}</p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
