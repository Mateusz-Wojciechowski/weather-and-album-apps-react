# Aplikacja Prognoza Pogody

Aplikacja React wyświetlająca prognozę pogody dla podanego miasta lub aktualnej lokalizacji użytkownika.

## Funkcjonalności

- Wyszukiwanie prognozy pogody dla dowolnego miasta
- Pobieranie prognozy dla aktualnej lokalizacji użytkownika
- Dynamiczna zmiana tła i ikon w zależności od warunków pogodowych
- Wyświetlanie szczegółowych informacji:
  - Temperatura (aktualna, minimalna, maksymalna)
  - Ciśnienie atmosferyczne
  - Wilgotność powietrza
  - Prędkość i kierunek wiatru

## Instalacja

1. Sklonuj to repozytorium
2. Zainstaluj zależności:
```
npm install
```
3. Utwórz plik `.env` w głównym katalogu projektu i dodaj swój klucz API z OpenWeatherMap:
```
REACT_APP_OPENWEATHERMAP_API_KEY=twój_klucz_api
```
4. Uruchom aplikację:
```
npm start
```

## Technologie

- React
- OpenWeatherMap API
- React Icons (ikony pogodowe)
- CSS z animacjami

## Dodatkowe modyfikacje względem oryginalnej instrukcji:

- Ulepszona stylizacja z użyciem efektów CSS (animacje, przejścia, cienie)
- Rozszerzone informacje pogodowe (min/max temperatura, kierunek wiatru)
- Dodatkowe wskaźniki stanu (ładowanie, błędy)
- Responsywny design dla urządzeń mobilnych
- Przycisk do łatwego korzystania z geolokalizacji

## Uwaga

Aby aplikacja działała poprawnie, musisz uzyskać własny klucz API z [OpenWeatherMap](https://openweathermap.org/api).