export const TypeFilter = ( {selectedType, onTypeChange}) => {

    return (
        <div className="filter-by-type">
            <label htmlFor="type-select">Wybierz typ Łowiska</label>
            <select id="type-select" value={selectedType} onChange={onTypeChange}>
            <option value="">Wszystkie</option>
            <option value="staw">Stawy</option>
            <option value="jezioro">Jeziora</option>
            <option value="rzeka">Rzeki</option>
            <option value="morze">Morze</option>
            <option value="komercyjne">Komercyjne</option>
            </select>
        </div>
    )
}