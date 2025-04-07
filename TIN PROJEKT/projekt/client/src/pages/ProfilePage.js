import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { ChangePasswordForm } from "../components/ChangePasswordForm";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { DeleteOpinion } from "../components/DeleteOpinion";


export const ProfilePage = () => {
    const { username, email, userId } = useAuth();
    const [opinie, setOpinie] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const navigate = useNavigate();
    const [success, setSuccess] = useState(null);

    // pobieranie danych o opiniach na podstawie id zalogowanego usera
    useEffect(() => {
        // przekierowanie na strone glowno po wpisaniu url kierujecego do profilu nie bedac zalgowanym
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/');
            return;
        }

        const fetchOpinie = async () => {
            try {
                const response = await fetch(`/api/user/${userId}/opinie`);
                if (!response.ok) {
                    throw new Error("Błąd podczas pobierania opinii");
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
    }, [userId]);

    if (loading) return <p className="loading">Ładowanie opinii...</p>;
    if (error) return <p className="error-message">{error}</p>;

    const handleEditPassword = () => {
        setIsEditingPassword(!isEditingPassword);
    };

    const handleDeleteOpinion = (opiniaId) => {
        setOpinie((prevOpinie) => prevOpinie.filter((opinia) => opinia.id !== opiniaId));
    }



  const handleError = (errorMessage) => {
    setError(errorMessage);
    setSuccess(null);
  };


  const handleSuccess = (successMessage) => {
    setSuccess(successMessage);
    setError(null);
  };


  return (
    <div className="profile-page">
        <div className="profile-container">
            {/* panel z danymi użytkownika */}
            <div className="profile-user-info">
                <h1>Profil użytkownika</h1>
                <p><strong>Username:</strong> {username}</p>
                <p><strong>Email:</strong> {email}</p>

                <div className="profile-password-section">
                    <p><strong>Hasło:</strong> ********</p>
                    <button className={`${isEditingPassword ? "btn-red" : "btn-green"}`} onClick={handleEditPassword}>
                        {isEditingPassword ? "Anuluj" : "Zmień hasło"}
                    </button>
                </div>

                {isEditingPassword && <ChangePasswordForm setIsEdittingPassword={setIsEditingPassword}/>}
            </div>
            
            {/* panel z opiniami */}
            <div className="profile-opinie-list">
                {error && <p style={{ color: "red" }}>{error}</p>}
                {success && <p style={{ color: "green" }}>{success}</p>}
                <h2>Twoje opinie</h2>
                {opinie.length === 0 ? (
                    <p>Brak opinii.</p>
                ) : (
                    <div className="profile-opinie-scrollable">
                        {opinie.map((opinia) => (
                            <div className="profile-opinia-card" key={opinia.id}>
                                <h3>
                                    <Link to={`/lowiska/${opinia.lowisko_id}`} className="profile-opinia-link">{opinia.nazwa}</Link>
                                </h3>
                                <p><strong>Ocena:</strong> {opinia.ocena}⭐</p>
                                <p><strong>Komentarz:</strong> {opinia.komentarz}</p>
                                <p className="profile-data-dodania">Dodano {new Date(opinia.data_dodania).toLocaleDateString()}</p>
                                <DeleteOpinion opiniaId={opinia.id} onDelete={handleDeleteOpinion} onError={handleError} onSuccess={handleSuccess} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
);

};
