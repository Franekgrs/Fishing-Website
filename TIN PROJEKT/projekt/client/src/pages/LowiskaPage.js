import { useEffect, useState } from "react";
import { SearchBar } from "../components/SearchBar";
import { TypeFilter } from "../components/TypeFIlter";
import { Link } from "react-router-dom";
import { LowiskoForm } from "../components/LowiskoForm";
import { useNavigate } from "react-router-dom";

export const LowiskaPage = () => {

    const [lowiska, setLowiska] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filteredLowiska, setFilteredLowiska] = useState([]);
    const [selectedType, setSelectedType] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(9);
    const navigate = useNavigate();


    // pobieranie danych o lowiskach
    useEffect(() => {
        const fetchLowiska = async () => {
            try {
                const response = await fetch('/lowiska');
                if (!response.ok) {
                    throw new Error('Błąd podczas pobierania łowisk');
                }
                const data = await response.json();
                setLowiska(data);
                setFilteredLowiska(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLowiska();
    }, []);

    // funkcja do filtrowania lowisk
    const filterLowiska = () => {
        let filtered = lowiska;

        if (searchQuery) {
            filtered = filtered.filter((item) =>
                item.nazwa?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedType) {
            filtered = filtered.filter((item) => item.typ === selectedType);
        }

        setFilteredLowiska(filtered);
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const handleTypeChange = (event) => {
        setSelectedType(event.target.value);
    };

    useEffect(() => {
        filterLowiska();
    }, [searchQuery, selectedType]);

    //paginacja
    const indexOfLastLowisko = currentPage * itemsPerPage;
    const indexOfFirstLowisko = indexOfLastLowisko - itemsPerPage;
    const currentLowiska = filteredLowiska.slice(indexOfFirstLowisko, indexOfLastLowisko);

    const nextPage = () => {
        if (currentPage < Math.ceil(filteredLowiska.length / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };
    
    
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }

    

    const handleNewLowisko = (newLowisko) => {
        console.log(newLowisko);
        setFilteredLowiska((prevLowiska) => [...prevLowiska, newLowisko]);
        setIsModalVisible(false);
    }

    const toggleModalVisibility = () => {
        setIsModalVisible(!isModalVisible);
    };

    // klikniecie poza modal
    const handleOverlayClick = (e) => {
        if (e.target.classList.contains("modal-overlay")) {
            const shouldClose = window.confirm("Czy na pewno chcesz zakończyć dodawanie łowiska?");
            if (shouldClose) {
                setIsModalVisible(false);
            }
        }
    };


    if (loading) return <p>Ładowanie łowisk...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="lowiska-page">
            <h1>Lista Łowisk</h1>
            <div className="filters-container">
                <SearchBar onSearch={handleSearch} />
                <TypeFilter selectedType={selectedType} onTypeChange={handleTypeChange} />

                {/* Przycisk dodawania łowiska */}
                <button onClick={toggleModalVisibility} className="btn-dodaj-lowisko">
                    {isModalVisible ? "Anuluj dodawanie" : "Dodaj nowe łowisko"}
                </button>
            </div>

            <div className="lowiska-list">
                {currentLowiska.length === 0 ? (
                    <p>Brak wyników dla tego zapytania.</p>
                ) : (
                    currentLowiska.map((lowisko) => (
                        <div className="card" key={lowisko.id}>
                            <h3>{lowisko.nazwa}</h3>
                            <p>Typ: {lowisko.typ}</p>
                            <p>Lokalizacja: {lowisko.lokalizacja}</p>
                            <p><strong>Opis: </strong>{lowisko.opis}</p>
                            <Link to={`/lowiska/${lowisko.id}`} key={lowisko.id}>Zobacz szczegóły</Link>
                        </div>
                    ))
                )}
            </div>
                {/* paginacja */}
            <div className="pagination">
                <button onClick={prevPage} disabled={currentPage === 1}>Poprzednia</button>
                <span>Strona {currentPage}</span>
                <button onClick={nextPage} disabled={currentPage === Math.ceil(filteredLowiska.length / itemsPerPage)}>Następna</button>
            </div>

            {isModalVisible && (
                <div className="modal-overlay" onClick={handleOverlayClick}>
                    <div className="modal-content">
                        <LowiskoForm onNewLowisko={handleNewLowisko} />
                        <button className="close-modal" onClick={toggleModalVisibility}>X</button>
                    </div>
                </div>
            )}
        </div>
    );
};
