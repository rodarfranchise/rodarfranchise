-- Rodar Franchise World Franchising Platform Database Setup
-- This file contains all the necessary tables and prepopulated data

-- Enable Row Level Security (RLS) for Supabase
-- You can enable this after creating the tables if needed

-- 1. Industries table
CREATE TABLE industries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Sectors table
CREATE TABLE sectors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    industry_id UUID NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, industry_id)
);

-- 3. Services/Products table
CREATE TABLE services_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sector_id UUID NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, sector_id)
);

-- 4. States table
CREATE TABLE states (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Cities table
CREATE TABLE cities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, state_id)
);

-- 6. Franchise Listings table
CREATE TABLE franchise_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Basic info
    brand_name VARCHAR(200) NOT NULL,
    tagline TEXT,
    description TEXT,
    about_brand TEXT,
    logo_url TEXT,
    industry_id UUID REFERENCES industries(id),
    
    -- Investment details
    min_investment DECIMAL(15,2),
    max_investment DECIMAL(15,2),
    franchise_fee DECIMAL(15,2),
    royalty_percentage DECIMAL(5,2),
    
    -- Area requirements
    min_area DECIMAL(10,2),
    max_area DECIMAL(10,2),
    area_unit VARCHAR(20) DEFAULT 'sqft',
    
    -- Business details
    establishment_year INTEGER,
    franchise_commenced_year INTEGER,
    franchise_outlets INTEGER,
    anticipated_roi DECIMAL(5,2),
    payback_period INTEGER, -- in months
    
    -- Location preferences
    preferred_locations TEXT[], -- Array of preferred cities/states
    expansion_states UUID[], -- Array of state IDs
    
    -- Franchise terms
    exclusive_territory BOOLEAN DEFAULT false,
    franchise_term_years INTEGER,
    term_renewable BOOLEAN DEFAULT false,
    
    -- Training and support
    training_provided BOOLEAN DEFAULT false,
    training_location TEXT,
    field_assistance BOOLEAN DEFAULT false,
    expert_guidance BOOLEAN DEFAULT false,
    operating_manuals BOOLEAN DEFAULT false,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Gallery table - separate table for storing gallery images

-- 8. Admins table
CREATE TABLE admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name VARCHAR(200) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_franchise_listings_industry ON franchise_listings(industry_id);
CREATE INDEX idx_franchise_listings_active ON franchise_listings(is_active);
CREATE INDEX idx_franchise_listings_investment ON franchise_listings(min_investment, max_investment);
CREATE INDEX idx_sectors_industry ON sectors(industry_id);
CREATE INDEX idx_cities_state ON cities(state_id);
-- Gallery table indexes are defined in the gallery table creation

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to franchise_listings
CREATE TRIGGER update_franchise_listings_updated_at 
    BEFORE UPDATE ON franchise_listings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert prepopulated data

-- 1. Industries
INSERT INTO industries (name) VALUES
('Automotive'),
('Beauty & Health'),
('Business Services'),
('Dealers & Distributors'),
('Education'),
('Fashion'),
('Food And Beverage'),
('Home Based Business'),
('Hotel Travel & Tourism'),
('Retail'),
('Sports Fitness & Entertainment');

-- 2. Indian States
INSERT INTO states (name) VALUES
('Andhra Pradesh'),
('Arunachal Pradesh'),
('Assam'),
('Bihar'),
('Chhattisgarh'),
('Goa'),
('Gujarat'),
('Haryana'),
('Himachal Pradesh'),
('Jharkhand'),
('Karnataka'),
('Kerala'),
('Madhya Pradesh'),
('Maharashtra'),
('Manipur'),
('Meghalaya'),
('Mizoram'),
('Nagaland'),
('Odisha'),
('Punjab'),
('Rajasthan'),
('Sikkim'),
('Tamil Nadu'),
('Telangana'),
('Tripura'),
('Uttar Pradesh'),
('Uttarakhand'),
('West Bengal'),
('Delhi'),
('Jammu & Kashmir'),
('Ladakh'),
('Chandigarh'),
('Dadra & Nagar Haveli'),
('Daman & Diu'),
('Lakshadweep'),
('Puducherry'),
('Andaman & Nicobar Islands');

-- 3. Sample Sectors (you can expand these based on your needs)
INSERT INTO sectors (name, industry_id) VALUES
-- Automotive sectors
('Car Dealerships', (SELECT id FROM industries WHERE name = 'Automotive')),
('Auto Parts & Accessories', (SELECT id FROM industries WHERE name = 'Automotive')),
('Auto Services & Repair', (SELECT id FROM industries WHERE name = 'Automotive')),
('Two Wheeler Dealerships', (SELECT id FROM industries WHERE name = 'Automotive')),

-- Beauty & Health sectors
('Beauty Salons', (SELECT id FROM industries WHERE name = 'Beauty & Health')),
('Hair Care', (SELECT id FROM industries WHERE name = 'Beauty & Health')),
('Skin Care', (SELECT id FROM industries WHERE name = 'Beauty & Health')),
('Fitness Centers', (SELECT id FROM industries WHERE name = 'Beauty & Health')),
('Wellness Centers', (SELECT id FROM industries WHERE name = 'Beauty & Health')),

-- Business Services sectors
('Consulting', (SELECT id FROM industries WHERE name = 'Business Services')),
('Digital Marketing', (SELECT id FROM industries WHERE name = 'Business Services')),
('Accounting & Finance', (SELECT id FROM industries WHERE name = 'Business Services')),
('HR Services', (SELECT id FROM industries WHERE name = 'Business Services')),

-- Food And Beverage sectors
('Quick Service Restaurants', (SELECT id FROM industries WHERE name = 'Food And Beverage')),
('Casual Dining', (SELECT id FROM industries WHERE name = 'Food And Beverage')),
('Cafes', (SELECT id FROM industries WHERE name = 'Food And Beverage')),
('Ice Cream & Desserts', (SELECT id FROM industries WHERE name = 'Food And Beverage')),
('Beverages', (SELECT id FROM industries WHERE name = 'Food And Beverage')),

-- Retail sectors
('Apparel & Fashion', (SELECT id FROM industries WHERE name = 'Retail')),
('Electronics', (SELECT id FROM industries WHERE name = 'Retail')),
('Home & Lifestyle', (SELECT id FROM industries WHERE name = 'Retail')),
('Books & Stationery', (SELECT id FROM industries WHERE name = 'Retail')),
('Jewelry & Accessories', (SELECT id FROM industries WHERE name = 'Retail'));

-- 4. Sample Cities (major cities from different states)
INSERT INTO cities (name, state_id) VALUES
-- Maharashtra
('Mumbai', (SELECT id FROM states WHERE name = 'Maharashtra')),
('Pune', (SELECT id FROM states WHERE name = 'Maharashtra')),
('Nagpur', (SELECT id FROM states WHERE name = 'Maharashtra')),
('Thane', (SELECT id FROM states WHERE name = 'Maharashtra')),

-- Karnataka
('Bangalore', (SELECT id FROM states WHERE name = 'Karnataka')),
('Mysore', (SELECT id FROM states WHERE name = 'Karnataka')),
('Hubli', (SELECT id FROM states WHERE name = 'Karnataka')),

-- Tamil Nadu
('Chennai', (SELECT id FROM states WHERE name = 'Tamil Nadu')),
('Coimbatore', (SELECT id FROM states WHERE name = 'Tamil Nadu')),
('Madurai', (SELECT id FROM states WHERE name = 'Tamil Nadu')),

-- Telangana
('Hyderabad', (SELECT id FROM states WHERE name = 'Telangana')),
('Warangal', (SELECT id FROM states WHERE name = 'Telangana')),

-- Gujarat
('Ahmedabad', (SELECT id FROM states WHERE name = 'Gujarat')),
('Surat', (SELECT id FROM states WHERE name = 'Gujarat')),
('Vadodara', (SELECT id FROM states WHERE name = 'Gujarat')),

-- Delhi
('New Delhi', (SELECT id FROM states WHERE name = 'Delhi')),
('Delhi', (SELECT id FROM states WHERE name = 'Delhi')),

-- Uttar Pradesh
('Lucknow', (SELECT id FROM states WHERE name = 'Uttar Pradesh')),
('Kanpur', (SELECT id FROM states WHERE name = 'Uttar Pradesh')),
('Varanasi', (SELECT id FROM states WHERE name = 'Uttar Pradesh')),

-- West Bengal
('Kolkata', (SELECT id FROM states WHERE name = 'West Bengal')),
('Howrah', (SELECT id FROM states WHERE name = 'West Bengal')),

-- Kerala
('Kochi', (SELECT id FROM states WHERE name = 'Kerala')),
('Thiruvananthapuram', (SELECT id FROM states WHERE name = 'Kerala')),

-- Punjab
('Chandigarh', (SELECT id FROM states WHERE name = 'Chandigarh')),
('Amritsar', (SELECT id FROM states WHERE name = 'Punjab'));

-- 5. Sample Services/Products
INSERT INTO services_products (name, sector_id) VALUES
-- Auto Services
('Car Wash & Detailing', (SELECT id FROM sectors WHERE name = 'Auto Services & Repair')),
('Oil Change Service', (SELECT id FROM sectors WHERE name = 'Auto Services & Repair')),
('Brake & Clutch Service', (SELECT id FROM sectors WHERE name = 'Auto Services & Repair')),

-- Beauty Services
('Hair Styling', (SELECT id FROM sectors WHERE name = 'Hair Care')),
('Hair Coloring', (SELECT id FROM sectors WHERE name = 'Hair Care')),
('Facial Treatments', (SELECT id FROM sectors WHERE name = 'Skin Care')),
('Manicure & Pedicure', (SELECT id FROM sectors WHERE name = 'Beauty Salons')),

-- Food Services
('Pizza Delivery', (SELECT id FROM sectors WHERE name = 'Quick Service Restaurants')),
('Burger Joints', (SELECT id FROM sectors WHERE name = 'Quick Service Restaurants')),
('Coffee Shops', (SELECT id FROM sectors WHERE name = 'Cafes')),
('Ice Cream Parlors', (SELECT id FROM sectors WHERE name = 'Ice Cream & Desserts')),

-- Retail Products
('Men''s Clothing', (SELECT id FROM sectors WHERE name = 'Apparel & Fashion')),
('Women''s Clothing', (SELECT id FROM sectors WHERE name = 'Apparel & Fashion')),
('Kids Wear', (SELECT id FROM sectors WHERE name = 'Apparel & Fashion')),
('Mobile Phones', (SELECT id FROM sectors WHERE name = 'Electronics')),
('Laptops & Computers', (SELECT id FROM sectors WHERE name = 'Electronics'));

-- Create a sample admin user (password should be hashed in production)
-- Note: In production, use proper password hashing (e.g., bcrypt)
INSERT INTO admins (email, password_hash, name) VALUES
('admin@rodar.com', 'temporary_hash_placeholder', 'Rodar Admin');

-- Grant necessary permissions (adjust based on your Supabase setup)
-- These are typically handled automatically by Supabase, but you can customize if needed

-- Enable Row Level Security (RLS) - Uncomment if you want to enable RLS
-- ALTER TABLE franchise_listings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (example - adjust based on your requirements)
-- CREATE POLICY "Public read access to franchise listings" ON franchise_listings
--     FOR SELECT USING (is_active = true);

-- CREATE POLICY "Admin full access to franchise listings" ON franchise_listings
--     FOR ALL USING (
--         EXISTS (
--             SELECT 1 FROM admins WHERE id = auth.uid()
--         )
--     );

COMMIT;
