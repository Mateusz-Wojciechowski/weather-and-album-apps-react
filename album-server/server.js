// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Włączenie CORS, aby umożliwić żądania z aplikacji React
app.use(cors());

// Middleware do obsługi JSON
app.use(express.json());

// Dane - lista albumów z dodanymi gatunkami i okładkami
const albums = [
  { 
    id: 1, 
    band: "Metallica", 
    title: "Master of Puppets", 
    year: 1986, 
    genre: "Thrash Metal",
    cover: "https://upload.wikimedia.org/wikipedia/en/b/b2/Metallica_-_Master_of_Puppets_cover.jpg"
  },
  { 
    id: 2, 
    band: "Metallica", 
    title: "Ride the Lightning", 
    year: 1984, 
    genre: "Thrash Metal",
    cover: "https://upload.wikimedia.org/wikipedia/en/f/f4/Ridetl.png"
  },
  { 
    id: 3, 
    band: "AC/DC", 
    title: "Back in Black", 
    year: 1980, 
    genre: "Hard Rock",
    cover: "https://upload.wikimedia.org/wikipedia/commons/9/92/ACDC_Back_in_Black.png"
  },
  { 
    id: 4, 
    band: "AC/DC", 
    title: "Highway to Hell", 
    year: 1979, 
    genre: "Hard Rock",
    cover: "https://upload.wikimedia.org/wikipedia/en/a/ac/Acdc_Highway_to_Hell.jpg"
  },
  { 
    id: 5, 
    band: "Iron Maiden", 
    title: "The Number of the Beast", 
    year: 1982, 
    genre: "Heavy Metal",
    cover: "https://upload.wikimedia.org/wikipedia/en/3/32/IronMaiden_NumberOfBeast.jpg"
  },
  { 
    id: 6, 
    band: "Iron Maiden", 
    title: "Powerslave", 
    year: 1984, 
    genre: "Heavy Metal",
    cover: "https://upload.wikimedia.org/wikipedia/en/b/b5/Iron_Maiden_-_Powerslave.jpg"
  }
];

// Endpoint do pobierania wszystkich albumów
app.get('/albums', (req, res) => {
  res.json(albums);
});

// Endpoint do pobierania albumów konkretnego zespołu
app.get('/albums/:band', (req, res) => {
  const band = req.params.band.toLowerCase();
  const filteredAlbums = albums.filter(album => album.band.toLowerCase() === band);

  if (filteredAlbums.length > 0) {
    res.json(filteredAlbums);
  } else {
    res.status(404).json({ message: "Nie znaleziono albumów dla tego zespołu." });
  }
});

// Endpoint do pobierania albumów według gatunku
app.get('/genres/:genre', (req, res) => {
  const genre = req.params.genre.toLowerCase();
  const filteredAlbums = albums.filter(album => album.genre.toLowerCase() === genre);

  if (filteredAlbums.length > 0) {
    res.json(filteredAlbums);
  } else {
    res.status(404).json({ message: "Nie znaleziono albumów w tym gatunku." });
  }
});

// Endpoint do pobierania pojedynczego albumu po ID
app.get('/album/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const album = albums.find(album => album.id === id);

  if (album) {
    res.json(album);
  } else {
    res.status(404).json({ message: "Album nie znaleziony." });
  }
});

// Endpoint do dodawania nowego albumu
app.post('/albums', (req, res) => {
  const { band, title, year, genre, cover } = req.body;
  
  // Sprawdzanie czy wszystkie wymagane pola są obecne
  if (!band || !title || !year) {
    return res.status(400).json({ message: "Brak wymaganych danych: zespół, tytuł i rok są obowiązkowe." });
  }
  
  // Tworzenie nowego albumu
  const newAlbum = { 
    id: albums.length > 0 ? Math.max(...albums.map(a => a.id)) + 1 : 1, 
    band, 
    title, 
    year: parseInt(year), 
    genre: genre || "Nieznany", 
    cover: cover || "https://via.placeholder.com/300x300?text=Brak+okładki" 
  };
  
  albums.push(newAlbum);
  res.status(201).json(newAlbum);
});

// Endpoint do aktualizacji albumu
app.put('/albums/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { band, title, year, genre, cover } = req.body;
  
  const albumIndex = albums.findIndex(album => album.id === id);
  if (albumIndex === -1) {
    return res.status(404).json({ message: "Album nie znaleziony." });
  }
  
  // Aktualizacja tylko podanych pól
  const updatedAlbum = { 
    ...albums[albumIndex],
    ...(band && { band }),
    ...(title && { title }),
    ...(year && { year: parseInt(year) }),
    ...(genre && { genre }),
    ...(cover && { cover })
  };
  
  albums[albumIndex] = updatedAlbum;
  res.json(updatedAlbum);
});

// Endpoint do usuwania albumu
app.delete('/albums/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = albums.findIndex(album => album.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: "Album nie znaleziony." });
  }
  
  const deletedAlbum = albums[index];
  albums.splice(index, 1);
  res.json({ message: "Album usunięty.", deletedAlbum });
});

// Endpoint do pobierania listy dostępnych gatunków
app.get('/genres', (req, res) => {
  const genres = [...new Set(albums.map(album => album.genre))];
  res.json(genres);
});

// Uruchomienie serwera
app.listen(port, () => {
  console.log(`Serwer REST API działa na http://localhost:${port}`);
});