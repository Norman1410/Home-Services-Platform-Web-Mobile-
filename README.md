# Home Services Platform (Web and Mobile)

Full stack application for hiring home services such as plumbing, cleaning, gardening, and maintenance.  
The platform allows clients to publish job offers and workers to apply. Once a worker is accepted, the job offer is closed and no longer visible.

## Main Features
- User authentication using Supabase
- Role-based system (clients and workers)
- Job offers creation and management by clients
- Workers can apply to job offers
- Offer closing once a worker is accepted
- User profiles with personal information
- Worker profiles include service description, pricing, and ratings
- Profile image upload using Supabase Storage
- Search and listing system for workers and job offers

## Architecture
- Backend with REST API and database access layer
- Web client and mobile client consuming the same backend
- ORM used to manage database models and relations
- Separation of concerns between API, web, and mobile applications

## Tech Stack
- Backend: Node.js, Express
- Database: PostgreSQL (Supabase)
- ORM: Prisma
- Authentication and Storage: Supabase
- Frontend Web: React
- Mobile App: React Native / Expo

## Project Structure
- hogar-api: Backend API and database logic
- hogar-web: Web client application
- hogar-movil: Mobile client application



