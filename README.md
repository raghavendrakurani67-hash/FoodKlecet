# Foodklect

Foodklect is a campus food-ordering frontend prototype. It includes a menu, student registration and login, favourites, cart, checkout, order history, profile editing, contact information and an admin menu editor.

## Run locally

Open `index.html` in a browser, or serve this folder with a local static web server. The app uses `localStorage` for its demo data.

## Demo admin login

- Admin email: `admin@foodklect.com`
- Password: `admin123`

Use the **Admin Login** link on the home page to open the dashboard. The dashboard displays items as cards and can add, edit, remove and mark menu items unavailable. Images are fixed: existing items keep their image, and new items automatically use the selected category's default image. Menu updates appear on `menu.html` and the homepage popular items in the same browser.

## Prototype limitations

This is a browser-only prototype, not a production ordering system. Student accounts, passwords, cart contents, favourites, orders and admin session data are stored locally in the browser. The demo credentials and client-side login are not secure authentication; users can inspect or change local data. Do not use real student credentials or personal data. A production deployment needs a server-side API, database, password hashing, authorization and server-side order/price validation.
# FoodKlecet
