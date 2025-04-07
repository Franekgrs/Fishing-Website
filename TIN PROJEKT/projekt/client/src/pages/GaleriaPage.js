import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
export const GaleriaPage = () => {
        const [lowiska, setLowiska] = useState([])
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        // pobieranie lowisk wraz ze zdjeciami z komentarzy
        useEffect(() => {
            const fetchLowiska = async () => {
                try {
                    const response = await fetch('api/lowiska');
                    if (!response.ok) {
                        throw new Error('Błąd podczas pobierania łowisk');
                    }
                    const data = await response.json();
                    setLowiska(data)
                } catch(error) {
                    setError(error.message);
                } finally {
                    setLoading(false)
                }
            }
            fetchLowiska();
        }, [])

        if (loading) return <p>Ładowanie łowisk...</p>;
        if (error) return <p>{error}</p>;

        return (
            <div className="zdjecia-page">
                <div className="lowiska-zdjecia-list">
                    {lowiska.length === 0 ? (
                        <p>Brak zdjęć.</p>
                    ) : (
                        lowiska.map((lowisko, index) => {
                            const zdjeciaArray = lowisko.zdjecia_url.split(',');
        
                            return (
                                <div className="card" key={index}>
                                    <h3><Link to= {`/lowiska/${lowisko.id}`} className="galeria-lowisko-link">{lowisko.nazwa}</Link></h3>
                                    <div className="zdjecia">
                                        {zdjeciaArray.map((url, i) => (
                                            <img key={i} src={url} alt={`Zdjęcie ${i + 1}`} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        );
        
}