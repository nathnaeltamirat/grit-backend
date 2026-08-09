# Grit - Backend
REST API for Grit — a tool to log developer friction, tag it, and surface recurring patterns with AI-generated summaries.



**Version:** 0.4.0

## STACK 
- Node.js / Express
- PostgresSQL
- Prima (ORM)
- Zod (Validation)

## Getting Started
```bash
git clone https:/github.com/nathnaeltamirat/grit-backend.git  
cd grit-backend
npm i
npm run dev  
npm run prisma:migrate  
npm run prisma:generate
```

## Environment variables
```bash
DATABASE_URL - PostgresSQL connection string  
PORT - Port the server runs on  
NODE_ENV - state of the app development/production  
```

## Scripts
```bash
npm run dev - To run the app on dev mode  
npm run lint - Eslint  
npm run lint:fix - To fx eslint problems  
npm run build - To build the app  
npm run prisma:migrate - for database migration
npm run prisma:generate - Generates the database ORM client and TypeScript types.
npm run prisma:migrate - Wipes data and re-runs all migration files
```


## Roadmap
- [x] Initial setup (db, formatters etc)
- [x] Auth
- [ ] Friction Feed
- [ ] Insights
- [ ] Settings
- [ ] Initial beta release (v1.0.0-beta)
- [ ] Initial release (v1.0.0)
- [ ] Forgot password/reset flow
- [ ] Google sign-on
- [ ] Release (v1.1.0)
