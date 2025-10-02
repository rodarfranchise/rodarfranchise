# Database Setup Guide

## Overview
This document contains the SQL setup for the Rodar Franchise World franchising platform database. The database is designed to handle franchise listings, industries, sectors, locations, and administrative functions.

## Tables Structure

### 1. industries
- **Purpose**: Top-level business categories
- **Fields**: id, name, created_at
- **Prepopulated**: 11 major industries including Automotive, Beauty & Health, Food & Beverage, Retail, etc.

### 2. sectors
- **Purpose**: Sub-categories within industries
- **Fields**: id, name, industry_id, created_at
- **Prepopulated**: Sample sectors for major industries

### 3. services_products
- **Purpose**: Specific services or products within sectors
- **Fields**: id, name, sector_id, created_at
- **Prepopulated**: Common services/products for various sectors

### 4. states
- **Purpose**: Indian states and union territories
- **Fields**: id, name, created_at
- **Prepopulated**: All 36 states and union territories of India

### 5. cities
- **Purpose**: Major cities within states
- **Fields**: id, name, state_id, created_at
- **Prepopulated**: Major cities from different states

### 6. franchise_listings
- **Purpose**: Core franchise opportunity data
- **Key Fields**:
  - **Basic Info**: brand_name, tagline, description, about_brand, logo_url, industry_id
  - **Investment**: min_investment, max_investment, franchise_fee, royalty_percentage
  - **Area**: min_area, max_area, area_unit
  - **Business**: establishment_year, franchise_commenced_year, franchise_outlets, anticipated_roi, payback_period
  - **Location**: preferred_locations, expansion_states
  - **Franchise Terms**: exclusive_territory, franchise_term_years, term_renewable
  - **Training**: training_provided, training_location, field_assistance, expert_guidance, operating_manuals
  - **Status**: is_active, created_at, updated_at

### 7. admins
- **Purpose**: Administrative user accounts
- **Fields**: id, email, password_hash, name, created_at

## Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

### 2. Set Environment Variables
1. Copy `env.example` to `.env`
2. Fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### 3. Run Database Setup
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database_setup.sql`
4. Execute the script

### 4. Verify Setup
Check that all tables are created and populated:
```sql
SELECT COUNT(*) FROM industries; -- Should return 11
SELECT COUNT(*) FROM states; -- Should return 36
SELECT COUNT(*) FROM sectors; -- Should return sample sectors
SELECT COUNT(*) FROM cities; -- Should return sample cities
```

## Features

### Automatic Timestamps
- All tables have `created_at` timestamps
- `franchise_listings` has automatic `updated_at` updates via trigger

### Indexes
- Performance indexes on frequently queried fields
- Industry, status, and investment range indexes

### Data Integrity
- Foreign key constraints with cascade deletes
- Unique constraints where appropriate
- UUID primary keys for scalability

### Row Level Security (RLS)
- RLS is prepared but commented out
- Uncomment and customize policies based on your requirements

## Customization

### Adding More Data
- **Sectors**: Add more sectors to the `sectors` table
- **Cities**: Add more cities to the `cities` table
- **Services**: Expand the `services_products` table

### Modifying Structure
- Add new fields to `franchise_listings` as needed
- Create additional lookup tables for specific requirements
- Adjust field types and constraints based on your needs

## Security Considerations

### Production Setup
1. Enable Row Level Security (RLS)
2. Create appropriate policies for data access
3. Use proper password hashing for admin accounts
4. Implement authentication and authorization

### Environment Variables
- Never commit `.env` files to version control
- Use different keys for development and production
- Rotate keys regularly

## Support
For database-related issues or questions, refer to:
- Supabase documentation: [docs.supabase.com](https://docs.supabase.com)
- PostgreSQL documentation: [postgresql.org/docs](https://postgresql.org/docs)
