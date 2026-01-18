# Helpdesk API Backend

Prosty backend dla aplikacji Helpdesk oparty na `json-server` z dodatkową warstwą autoryzacji JWT.

## Stos Technologiczny
- **Node.js**
- **json-server** (jako baza danych i silnik REST)
- **jsonwebtoken** (autoryzacja)
- **body-parser**
- **cors**

## Instalacja i Uruchomienie

1. Wejdź do katalogu backendu:
   ```bash
   cd backend
   ```
2. Zainstaluj zależności:
   ```bash
   npm install
   ```
3. Uruchom serwer:
   ```bash
   npm start
   ```
Serwer domyślnie nasłuchuje na `http://localhost:3000`.

## Główne Endpointy

| Metoda | Ścieżka | Opis | Wymaga Tokenu |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Logowanie (email, password) | Nie |
| `GET` | `/auth/me` | Pobieranie danych aktualnego użytkownika | Tak (Bearer) |
| `GET` | `/tickets` | Pobieranie zgłoszeń (zależne od roli) | Tak (Bearer) |
| `POST` | `/tickets` | Tworzenie nowego zgłoszenia | Tak (Bearer) |
| `GET` | `/categories` | Pobieranie kategorii zgłoszeń | Tak (Bearer) |

## Autoryzacja i Role
- Backend obsługuje autoryzację za pomocą nagłówka `Authorization: Bearer <token>`.
- **Rola `user`**: Widzi tylko własne zgłoszenia w `/tickets`.
- **Rola `admin`**: Widzi wszystkie zgłoszenia w systemie.
- Dane przechowywane są w pliku `db.json`.
