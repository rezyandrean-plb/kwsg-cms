# Database Setup for New Launch Collection

## Current Situation
The existing database contains live Strapi CMS data that cannot be safely modified with Prisma migrations. 

## Recommended Solutions

### Option 1: Manual Table Creation (Recommended)
Connect to your PostgreSQL database and run this SQL command to create the table:

```sql
CREATE TABLE new_launch_collection (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    image VARCHAR(500),
    location VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    status VARCHAR(100) NOT NULL,
    visibility VARCHAR(20) NOT NULL DEFAULT 'Show',
    type VARCHAR(100),
    bedrooms VARCHAR(50),
    price VARCHAR(100),
    url VARCHAR(500),
    "launchDate" VARCHAR(50),
    active BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Option 2: Use Different Database
Create a separate database for the CMS application:

1. Create a new database: `kwsg_cms`
2. Update the DATABASE_URL in `.env.local`:
   ```
   DATABASE_URL="postgresql://postgres:kwpostgres@kw-1.cspkrkicfu7p.ap-southeast-1.rds.amazonaws.com:5432/kwsg_cms?sslmode=require"
   ```

### Option 3: Use Different Schema
Create the table in a different schema:

```sql
CREATE SCHEMA cms;
CREATE TABLE cms.new_launch_collection (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    image VARCHAR(500),
    location VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    status VARCHAR(100) NOT NULL,
    visibility VARCHAR(20) NOT NULL DEFAULT 'Show',
    type VARCHAR(100),
    bedrooms VARCHAR(50),
    price VARCHAR(100),
    url VARCHAR(500),
    "launchDate" VARCHAR(50),
    active BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## After Table Creation
Once the table is created, you can:

1. Run the seed script:
   ```bash
   npx tsx scripts/seed-new-launches.ts
   ```

2. The application will automatically start using the database instead of mock data.

## Current Status
The application is configured to:
- Try to connect to the database first
- Fall back to mock data if database connection fails
- Work seamlessly once the database table is created
