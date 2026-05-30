# SmartDine AI

Intelligent QR-Based Restaurant Ordering & Kitchen Management System.

## Features
- **Customer Facing:**
  - Beautiful, dynamic Landing Page
  - Digital Menu with Categories and Filters
  - Rich Food Detail Modal (Zomato-style with portions, add-ons, instructions)
  - Cart and Order Checkout
  - Order Tracking Timeline
  - AI Assistant for Recommendations

- **Staff Facing:**
  - Kitchen Kanban Dashboard (New Orders, Preparing, Ready, Served)
  - Admin Analytics Dashboard with rich CSS charts and heatmaps
  - Table QR Tent Card Generator
  - Inventory Management System

## Tech Stack
- HTML5
- CSS3 (Vanilla, custom properties, animations, glassmorphism)
- JavaScript (Vanilla, ES5/ES6 compatible, modular structure without bundlers)
- Supabase-backed API client with localStorage fallback/cache
- PWA (Progressive Web App) Support

## File Structure
- `index.html`: Main SPA shell
- `css/`: Modular stylesheets (`themes.css`, `animations.css`, `style.css`, `responsive.css`)
- `js/`: Modular JavaScript logic
  - `utils.js`: Helpers, toast, modal
  - `storage.js`: LocalStorage wrapper
  - `data.js`: Mock data (40+ items)
  - `auth.js`: Customer Google login and predefined staff access
  - `router.js`: SPA hash router with role guards
  - `customer.js`, `cart.js`: Customer logic
  - `kitchen.js`, `admin.js`, `inventory.js`, `analytics.js`: Staff logic
  - `ai.js`: Mock AI chat
  - `pwa.js`, `app.js`: Initialization

## Setup
Just serve the directory via any standard static web server (e.g., Live Server in VSCode or Python's `http.server`). 

## Logins
- **Customer**: Google login only
- **Staff Page**: `#/staff-login`
- **Admin**: predefined `absihekdas@gmail.com`
- **Kitchen**: predefined `kitchen@gmail.com`

Enjoy your premium restaurant SaaS experience!
