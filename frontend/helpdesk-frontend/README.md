# Helpdesk Client

Aplikacja kliencka systemu Helpdesk zbudowana w Angularze. Umożliwia użytkownikom zgłaszanie problemów, a administratorom zarządzanie nimi.

## Funkcje
- **Logowanie i autoryzacja**: System oparty na JWT z zapamiętywaniem sesji.
- **Zarządzanie zgłoszeniami**:
    - Przeglądanie listy zgłoszeń (filtrowanie dla użytkowników).
    - Szczegóły zgłoszenia wraz z komentarzami.
    - Tworzenie nowych zgłoszeń z wyborem kategorii.
- **Rola Administratora**: Pełny wgląd we wszystkie zgłoszenia w systemie.
- **Responsywny Design**: Przygotowany z użyciem nowoczesnych standardów CSS/SCSS.

## Stos Technologiczny
- **Angular 20**
- **RxJS** (reaktywne zarządzanie danymi)
- **SCSS** (stylowanie)
- **ESLint & Stylelint** (jakość kodu)

## Instalacja i Uruchomienie

1. Wejdź do katalogu frontendu:
   ```bash
   cd frontend/helpdesk-frontend
   ```
2. Zainstaluj zależności:
   ```bash
   npm install
   ```
3. Uruchom serwer deweloperski:
   ```bash
   npm start
   # lub
   ng serve
   ```
Aplikacja będzie dostępna pod adresem `http://localhost:4200`.

## Struktura Projektu
- `src/app/core`: Serwisy globalne, modele, guardy i interceptory (np. `AuthInterceptor`).
- `src/app/features`: Moduły funkcjonalne (auth, tickets, home, profile).
- `src/app/layout`: Komponenty układu strony (shell, navigation).
- `src/app/shared`: Współdzielone UI, rury (pipes) i dyrektywy.

## Wymagania
Do poprawnego działania aplikacji wymagane jest uruchomienie backendu na porcie 3000.
