import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom"; // Hook do pobierania parametrów z URL
import {Formularz} from "./KomForm";
import { useAuth } from "../AuthContext";


export const LowiskoDetails = () => {
    const { id } = useParams();
    const [lowisko, setLowisko] = useState(null);
    const [opinie, setOpinie] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const {username} = useAuth();
    const navigate = useNavigate();

    // Pobieranie danych o łowisku i opiniach
    useEffect(() => {
        const fetchLowisko = async () => {
            try {
                const response = await fetch(`/lowiska/${id}`);
                if (!response.ok) {
                    throw new Error("Nie znaleziono łowiska")
                }
                const data = await response.json();

                setLowisko(data);
            } catch (error) {
                setError('Błąd podczas ładowania danych łowiska');
                navigate('/not-found')
            }
        };

        const fetchOpinie = async () => {
            try {
                const response = await fetch(`/lowiska/${id}/opinia`);
                const data = await response.json();
                setOpinie(data);
            } catch (error) {
                setError('Błąd podczas ładowania opinii');
            } finally {
                setLoading(false);
            }
        };



        fetchLowisko();
        fetchOpinie();

    }, [id]);

    const handleNewOpinion = (newOpinion) => {
        const opionionWithUserName = {...newOpinion, username}
        setOpinie((prevOpinie) => [...prevOpinie, opionionWithUserName])
    }

    // Funkcja obliczająca średnią ocenę
    const calculateAverageRating = () => {
        if (opinie.length === 0) return 0;
        const total = opinie.reduce((acc, opinia) => acc + parseInt(opinia.ocena), 0);
        return (total / opinie.length).toFixed(1);
    };




    // Obsługa stanu ładowania i błędów
    if (loading) return <p>Ładowanie szczegółów...</p>;
    if (error) return <p>{error}</p>;

    if (!lowisko) return <p>Brak danych o łowisku.</p>;




    const averageRating = calculateAverageRating();

    

    return (
        <div className="lowisko-details">
            <button onClick={() => navigate(-1)} className="btn-powrot">{"<--- Powrót"}</button>
            <h2>{lowisko.nazwa}</h2>
            <p><strong>Typ:</strong> {lowisko.typ}</p>
            <p><strong>Lokalizacja:</strong> {lowisko.lokalizacja}</p>
            <p><strong>Opis:</strong> {lowisko.opis}</p>
            <p><strong>Data otwarcia: </strong>{new Date(lowisko.data_otwarcia).toLocaleDateString()}</p>
            <div className="average-rating">
                <h3>Średnia ocena: {averageRating} ⭐</h3>
            </div>

            <div>
            
            </div>
            
            <div className="opinions-section">
                <h3>Opinie i oceny</h3>
                <div className="opinions-list">
                    {opinie.length === 0 ? (
                        <p>Brak opinii</p>
                    ) : (
                        
                        opinie.map((opinia) => (
                            <div key={opinia.id} className="opinion-card">
                                <p>Opinia użytkownika: <strong>{opinia.username}</strong> </p>
                                <p><strong>Ocena:</strong> {opinia.ocena} ⭐</p>
                                <p><strong>Komentarz:</strong> {opinia.komentarz}</p>
                                <p><strong>Dodano:</strong> {new Date(opinia.data_dodania).toLocaleDateString()}</p>
                                {opinia.zdjecie_url && (
                                    <div>
                                        <img
                                            src={opinia.zdjecie_url}
                                            alt={`Zdjęcie opinii ${opinia.id}`}
                                            className="opinion-image"
                                            style={{ maxWidth: "100%", height: "auto" }}
                                        />
                                    </div>
)}
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            <Formularz onNewOpinion={handleNewOpinion}/>
        </div>
    );
};
