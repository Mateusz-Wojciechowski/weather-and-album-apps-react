// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Stan dla filtrowania
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("band"); // band, genre, year
  
  // Stan dla nowego albumu
  const [newAlbum, setNewAlbum] = useState({
    band: "",
    title: "",
    year: "",
    genre: "",
    cover: ""
  });
  
  // Stan dla edycji albumu
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Stan dla dostępnych gatunków
  const [genres, setGenres] = useState([]);

  // Pobieranie albumów przy pierwszym renderowaniu
  useEffect(() => {
    fetchAlbums();
    fetchGenres();
  }, []);

  // Funkcja pobierania wszystkich albumów
  const fetchAlbums = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("http://localhost:3000/albums");
      
      if (!response.ok) {
        throw new Error(`Błąd HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      setAlbums(data);
      
      // Zapisanie do localStorage jako cache
      localStorage.setItem("albums", JSON.stringify(data));
    } catch (error) {
      console.error("Błąd pobierania danych:", error);
      setError("Nie udało się pobrać albumów. Sprawdź połączenie z serwerem.");
      
      // Próba pobrania z localStorage jako fallback
      const cachedAlbums = localStorage.getItem("albums");
      if (cachedAlbums) {
        setAlbums(JSON.parse(cachedAlbums));
      }
    } finally {
      setLoading(false);
    }
  };

  // Funkcja pobierania gatunków muzycznych
  const fetchGenres = async () => {
    try {
      const response = await fetch("http://localhost:3000/genres");
      
      if (!response.ok) {
        throw new Error(`Błąd HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      setGenres(data);
    } catch (error) {
      console.error("Błąd pobierania gatunków:", error);
    }
  };

  // Funkcja filtrowania albumów
  const filterAlbums = async () => {
    if (!searchTerm.trim()) {
      fetchAlbums();
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let url;
      
      if (filterType === "band") {
        url = `http://localhost:3000/albums/${searchTerm.trim()}`;
      } else if (filterType === "genre") {
        url = `http://localhost:3000/genres/${searchTerm.trim()}`;
      } else {
        // Filtrowanie po roku - wykonujemy lokalne filtrowanie
        const response = await fetch("http://localhost:3000/albums");
        if (!response.ok) {
          throw new Error(`Błąd HTTP: ${response.status}`);
        }
        
        const allAlbums = await response.json();
        const filteredByYear = allAlbums.filter(
          album => album.year.toString() === searchTerm.trim()
        );
        
        setAlbums(filteredByYear);
        setLoading(false);
        return;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          setAlbums([]);
          setLoading(false);
          return;
        }
        throw new Error(`Błąd HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      setAlbums(data);
    } catch (error) {
      console.error("Błąd filtrowania:", error);
      setError("Nie udało się filtrować albumów. Sprawdź połączenie z serwerem.");
    } finally {
      setLoading(false);
    }
  };

  // Dodawanie nowego albumu
  const addAlbum = async (e) => {
    e.preventDefault();
    
    // Walidacja podstawowych pól
    if (!newAlbum.band.trim() || !newAlbum.title.trim() || !newAlbum.year.trim()) {
      alert("Proszę wypełnić wymagane pola: zespół, tytuł i rok");
      return;
    }
    
    try {
      const response = await fetch("http://localhost:3000/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAlbum)
      });
      
      if (!response.ok) {
        throw new Error(`Błąd HTTP: ${response.status}`);
      }
      
      const addedAlbum = await response.json();
      
      // Aktualizacja listy albumów
      setAlbums([...albums, addedAlbum]);
      
      // Aktualizacja localStorage
      const updatedAlbums = [...albums, addedAlbum];
      localStorage.setItem("albums", JSON.stringify(updatedAlbums));
      
      // Resetowanie formularza
      setNewAlbum({
        band: "",
        title: "",
        year: "",
        genre: "",
        cover: ""
      });
      
      // Odświeżenie listy gatunków, jeśli dodano nowy
      if (newAlbum.genre && !genres.includes(newAlbum.genre)) {
        fetchGenres();
      }
    } catch (error) {
      console.error("Błąd dodawania albumu:", error);
      alert("Wystąpił błąd podczas dodawania albumu.");
    }
  };

  // Rozpoczęcie edycji albumu
  const startEditing = (album) => {
    setEditingAlbum(album);
    setIsEditing(true);
  };

  // Anulowanie edycji
  const cancelEditing = () => {
    setEditingAlbum(null);
    setIsEditing(false);
  };

  // Aktualizacja albumu
  const updateAlbum = async (e) => {
    e.preventDefault();
    
    if (!editingAlbum) return;
    
    try {
      const response = await fetch(`http://localhost:3000/albums/${editingAlbum.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingAlbum)
      });
      
      if (!response.ok) {
        throw new Error(`Błąd HTTP: ${response.status}`);
      }
      
      const updatedAlbum = await response.json();
      
      // Aktualizacja listy albumów
      const updatedAlbums = albums.map(album => 
        album.id === updatedAlbum.id ? updatedAlbum : album
      );
      
      setAlbums(updatedAlbums);
      
      // Aktualizacja localStorage
      localStorage.setItem("albums", JSON.stringify(updatedAlbums));
      
      // Zakończenie edycji
      setIsEditing(false);
      setEditingAlbum(null);
      
      // Odświeżenie listy gatunków, jeśli dodano nowy
      if (editingAlbum.genre && !genres.includes(editingAlbum.genre)) {
        fetchGenres();
      }
    } catch (error) {
      console.error("Błąd aktualizacji albumu:", error);
      alert("Wystąpił błąd podczas aktualizacji albumu.");
    }
  };

  // Usuwanie albumu
  const deleteAlbum = async (id) => {
    if (!window.confirm("Czy na pewno chcesz usunąć ten album?")) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3000/albums/${id}`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        throw new Error(`Błąd HTTP: ${response.status}`);
      }
      
      // Aktualizacja listy albumów
      const updatedAlbums = albums.filter(album => album.id !== id);
      setAlbums(updatedAlbums);
      
      // Aktualizacja localStorage
      localStorage.setItem("albums", JSON.stringify(updatedAlbums));
    } catch (error) {
      console.error("Błąd usuwania albumu:", error);
      alert("Wystąpił błąd podczas usuwania albumu.");
    }
  };

  // Obsługa zmiany inputów dla nowego albumu
  const handleNewAlbumChange = (e) => {
    const { name, value } = e.target;
    setNewAlbum({
      ...newAlbum,
      [name]: value
    });
  };

  // Obsługa zmiany inputów dla edytowanego albumu
  const handleEditingAlbumChange = (e) => {
    const { name, value } = e.target;
    setEditingAlbum({
      ...editingAlbum,
      [name]: value
    });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Kolekcja Albumów Muzycznych</h1>
        {error && <div className="error-message">{error}</div>}
      </header>
      
      <main className="app-content">
        {/* Kompaktowy pasek wyszukiwania */}
        <div className="search-bar">
          <div className="search-container">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="band">Zespół</option>
              <option value="genre">Gatunek</option>
              <option value="year">Rok</option>
            </select>
            
            {filterType === "genre" && genres.length > 0 ? (
              <select 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="genre-select"
              >
                <option value="">Wybierz gatunek</option>
                {genres.map((genre, index) => (
                  <option key={index} value={genre}>{genre}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  filterType === "band" 
                    ? "Wpisz nazwę zespołu" 
                    : filterType === "genre" 
                    ? "Wpisz gatunek" 
                    : "Wpisz rok"
                }
                className="search-input"
              />
            )}
            
            <button onClick={filterAlbums} className="search-button">
              Szukaj
            </button>
            
            <button onClick={fetchAlbums} className="reset-button">
              Pokaż wszystkie
            </button>
          </div>
        </div>
        
        {/* Główna zawartość */}
        <div className="main-content">
          {/* Panel boczny */}
          <div className="side-panel">
            {!isEditing ? (
              <div className="add-album-panel">
                <h2>Dodaj nowy album</h2>
                <form onSubmit={addAlbum} className="album-form">
                  <div className="form-group">
                    <label htmlFor="band">Zespół *</label>
                    <input
                      type="text"
                      id="band"
                      name="band"
                      value={newAlbum.band}
                      onChange={handleNewAlbumChange}
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="title">Tytuł *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={newAlbum.title}
                      onChange={handleNewAlbumChange}
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="year">Rok wydania *</label>
                    <input
                      type="number"
                      id="year"
                      name="year"
                      value={newAlbum.year}
                      onChange={handleNewAlbumChange}
                      required
                      min="1900"
                      max={new Date().getFullYear()}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="genre">Gatunek muzyczny</label>
                    <select
                      id="genre"
                      name="genre"
                      value={newAlbum.genre}
                      onChange={handleNewAlbumChange}
                      className="form-input"
                    >
                      <option value="">Wybierz gatunek</option>
                      {genres.map((genre, index) => (
                        <option key={index} value={genre}>{genre}</option>
                      ))}
                      <option value="custom">Inny (wpisz poniżej)</option>
                    </select>
                    
                    {newAlbum.genre === "custom" && (
                      <input
                        type="text"
                        name="genre"
                        placeholder="Wpisz nazwę gatunku"
                        onChange={handleNewAlbumChange}
                        className="form-input mt-2"
                      />
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="cover">URL okładki</label>
                    <input
                      type="url"
                      id="cover"
                      name="cover"
                      value={newAlbum.cover}
                      onChange={handleNewAlbumChange}
                      placeholder="https://przykład.com/okładka.jpg"
                      className="form-input"
                    />
                  </div>
                  
                  <button type="submit" className="submit-button">
                    Dodaj album
                  </button>
                </form>
              </div>
            ) : (
              <div className="edit-album-panel">
                <h2>Edytuj album</h2>
                <form onSubmit={updateAlbum} className="album-form">
                  <div className="form-group">
                    <label htmlFor="edit-band">Zespół *</label>
                    <input
                      type="text"
                      id="edit-band"
                      name="band"
                      value={editingAlbum.band}
                      onChange={handleEditingAlbumChange}
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-title">Tytuł *</label>
                    <input
                      type="text"
                      id="edit-title"
                      name="title"
                      value={editingAlbum.title}
                      onChange={handleEditingAlbumChange}
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-year">Rok wydania *</label>
                    <input
                      type="number"
                      id="edit-year"
                      name="year"
                      value={editingAlbum.year}
                      onChange={handleEditingAlbumChange}
                      required
                      min="1900"
                      max={new Date().getFullYear()}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-genre">Gatunek muzyczny</label>
                    <select
                      id="edit-genre"
                      name="genre"
                      value={
                        genres.includes(editingAlbum.genre)
                          ? editingAlbum.genre
                          : "custom"
                      }
                      onChange={handleEditingAlbumChange}
                      className="form-input"
                    >
                      <option value="">Wybierz gatunek</option>
                      {genres.map((genre, index) => (
                        <option key={index} value={genre}>{genre}</option>
                      ))}
                      <option value="custom">Inny (wpisz poniżej)</option>
                    </select>
                    
                    {editingAlbum.genre === "custom" && (
                      <input
                        type="text"
                        name="genre"
                        placeholder="Wpisz nazwę gatunku"
                        onChange={handleEditingAlbumChange}
                        className="form-input mt-2"
                      />
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-cover">URL okładki</label>
                    <input
                      type="url"
                      id="edit-cover"
                      name="cover"
                      value={editingAlbum.cover}
                      onChange={handleEditingAlbumChange}
                      placeholder="https://przykład.com/okładka.jpg"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="button-group">
                    <button type="submit" className="submit-button">
                      Zapisz zmiany
                    </button>
                    <button 
                      type="button" 
                      onClick={cancelEditing}
                      className="cancel-button"
                    >
                      Anuluj
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
          
          {/* Lista albumów */}
          <div className="albums-section">
            <h2>Lista albumów ({albums.length})</h2>
            
            {loading ? (
              <div className="loading-indicator">Ładowanie albumów...</div>
            ) : albums.length === 0 ? (
              <div className="no-albums-message">
                Brak albumów do wyświetlenia. {searchTerm && "Spróbuj zmienić kryteria wyszukiwania."}
              </div>
            ) : (
              <div className="albums-grid">
                {albums.map(album => (
                  <div key={album.id} className="album-card">
                    <div className="album-cover">
                      <img 
                        src={album.cover || "https://via.placeholder.com/300x300?text=Brak+okładki"} 
                        alt={`Okładka ${album.title}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/300x300?text=Błąd+ładowania";
                        }}
                      />
                    </div>
                    
                    <div className="album-info">
                      <h3 className="album-title">{album.title}</h3>
                      <p className="album-band">{album.band}</p>
                      <p className="album-details">
                        <span className="album-year">{album.year}</span>
                        {album.genre && <span className="album-genre">{album.genre}</span>}
                      </p>
                    </div>
                    
                    <div className="album-actions">
                      <button 
                        onClick={() => startEditing(album)}
                        className="edit-button"
                      >
                        Edytuj
                      </button>
                      <button 
                        onClick={() => deleteAlbum(album.id)}
                        className="delete-button"
                      >
                        Usuń
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;