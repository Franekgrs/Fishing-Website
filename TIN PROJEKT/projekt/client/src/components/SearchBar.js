
const { useState } = require("react")

export const SearchBar = ({onSearch}) => {
    const [query, setQuery] = useState('');

    const handleInputChange = (event) => {
        setQuery(event.target.value);
        onSearch(event.target.value);
    }

    return (
        <div className="search-bar">
        <input type='text' placeholder="Wpisz nazwę łowiska..." value={query} onChange={handleInputChange}></input>
        </div>
    )
}