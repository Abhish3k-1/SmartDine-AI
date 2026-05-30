-- ==============================================================================
-- SMARTDINE AI - SUPABASE DATABASE SCHEMA
-- Copy and paste this entire file into the Supabase SQL Editor and click "Run"
-- ==============================================================================

-- Clean demo data before reseeding. This guarantees the full 40-item menu appears.
DROP TABLE IF EXISTS public.cart_items;
DROP TABLE IF EXISTS public.carts;
DROP TABLE IF EXISTS public.user_preferences;
DROP TABLE IF EXISTS public.profiles;
DROP TABLE IF EXISTS public.order_items;
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.inventory;
DROP TABLE IF EXISTS public.menu_items;
DROP TABLE IF EXISTS public.waiters;
DROP TABLE IF EXISTS public.users;

-- 1. Create USERS table (Custom table for demo login)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert demo users
INSERT INTO public.users (email, password_hash, role, name) VALUES 
('absihekdas@gmail.com', 'QWERTY@234', 'admin', 'System Admin'),
('kitchen@gmail.com', 'QWERTY@234', 'kitchen', 'Head Chef'),
('user@smartdine.com', 'user123', 'customer', 'Demo Customer')
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    name = EXCLUDED.name;

-- User profiles for Google/customer/staff metadata
CREATE TABLE IF NOT EXISTS public.profiles (
    email TEXT PRIMARY KEY,
    name TEXT,
    role TEXT DEFAULT 'customer',
    provider TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.profiles (email, name, role, provider) VALUES
('absihekdas@gmail.com', 'System Admin', 'admin', 'staff'),
('kitchen@gmail.com', 'Head Chef', 'kitchen', 'staff'),
('user@smartdine.com', 'Demo Customer', 'customer', 'demo')
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    provider = EXCLUDED.provider,
    updated_at = NOW();

-- Waiter/server roster used for table assignment and order tracking avatars
CREATE TABLE IF NOT EXISTS public.waiters (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT NOT NULL,
    rating NUMERIC(2,1) DEFAULT 4.8,
    status TEXT DEFAULT 'Active',
    tables INTEGER[] NOT NULL,
    description TEXT
);

INSERT INTO public.waiters (id, name, avatar, rating, status, tables, description) VALUES
(1, 'Ananya Rao', 'assets/images/avatars/ananya.png', 4.9, 'Active', ARRAY[1,2,3,4], 'Senior server, guest experience specialist'),
(2, 'Meera Kapoor', 'assets/images/avatars/meera.png', 4.8, 'Active', ARRAY[5,6,7,8], 'Quick service specialist'),
(3, 'Isha Nair', 'assets/images/avatars/isha.png', 4.9, 'Active', ARRAY[9,10,11,12], 'Customer favourite, dessert expert'),
(4, 'Kavya Menon', 'assets/images/avatars/kavya.png', 4.8, 'Active', ARRAY[13,14,15,16], 'Beverage and pairing specialist'),
(5, 'Arjun Sharma', 'assets/images/avatars/arjun.png', 4.7, 'Active', ARRAY[17,18,19,20], 'Floor coordinator and table runner')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    avatar = EXCLUDED.avatar,
    rating = EXCLUDED.rating,
    status = EXCLUDED.status,
    tables = EXCLUDED.tables,
    description = EXCLUDED.description;

-- Per-user preferences that used to live only in localStorage
CREATE TABLE IF NOT EXISTS public.user_preferences (
    customer_email TEXT PRIMARY KEY,
    theme TEXT DEFAULT 'dark',
    selected_table INTEGER,
    guest_count INTEGER DEFAULT 2,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Active carts before checkout
CREATE TABLE IF NOT EXISTS public.carts (
    id TEXT PRIMARY KEY,
    customer_email TEXT UNIQUE NOT NULL,
    table_number INTEGER,
    guest_count INTEGER DEFAULT 2,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id TEXT PRIMARY KEY,
    cart_id TEXT REFERENCES public.carts(id) ON DELETE CASCADE,
    menu_item_id INTEGER,
    menu_item_name TEXT NOT NULL,
    price INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    item_total NUMERIC NOT NULL,
    portion TEXT,
    spice_level TEXT,
    addons JSONB,
    special_instructions TEXT,
    image TEXT,
    is_veg BOOLEAN
);

-- 2. Create MENU_ITEMS table
CREATE TABLE IF NOT EXISTS public.menu_items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price INTEGER NOT NULL,
    description TEXT,
    image TEXT,
    rating NUMERIC(2,1) DEFAULT 4.5,
    "prepTime" TEXT DEFAULT '15 min',
    "isVeg" BOOLEAN DEFAULT true,
    "spiceLevel" TEXT DEFAULT 'Medium',
    available BOOLEAN DEFAULT true
);

-- Insert 40 Realistic Sample Menu Items with Premium Unsplash Images
INSERT INTO public.menu_items (id, name, category, price, description, image, "isVeg", "prepTime", "spiceLevel") VALUES
(1, 'Paneer Tikka', 'Starters', 249, 'Smoky cottage cheese cubes marinated in aromatic spices.', 'assets/images/paneer_tikka_premium.png', true, '15 min', 'Medium'),
(2, 'Chicken Tikka', 'Starters', 299, 'Juicy chicken chunks marinated in spiced yogurt.', 'assets/images/chicken_tikka.png', false, '20 min', 'Medium'),
(3, 'Crispy Corn', 'Starters', 199, 'Deep fried corn kernels tossed in spicy seasoning.', 'assets/images/crispy_corn.png', true, '10 min', 'Mild'),
(4, 'Chilli Mushroom', 'Starters', 229, 'Batter-fried mushrooms tossed in spicy soy sauce.', 'assets/images/chilli_mushroom.png', true, '15 min', 'Hot'),
(5, 'Hara Bhara Kebab', 'Starters', 210, 'Healthy spinach and green peas patty, pan-fried.', 'assets/images/hara_bhara_kebab.png', true, '15 min', 'Mild'),
(6, 'Dal Makhani', 'Main Course', 240, 'Slow-cooked black lentils in creamy tomato gravy.', 'assets/images/dal_tadka.png', true, '20 min', 'Mild'),
(7, 'Butter Chicken', 'Main Course', 349, 'Tender chicken cooked in a rich, buttery tomato sauce.', 'assets/images/butter_chicken_premium.png', false, '25 min', 'Mild'),
(8, 'Kadhai Paneer', 'Main Course', 270, 'Cottage cheese cooked with bell peppers and ground spices.', 'assets/images/kadhai_paneer.png', true, '20 min', 'Medium'),
(9, 'Mutton Rogan Josh', 'Main Course', 420, 'Classic Kashmiri style mutton curry.', 'assets/images/mutton_rogan_josh.png', false, '30 min', 'Hot'),
(10, 'Masala Dosa', 'South Indian', 150, 'Crispy rice crepe stuffed with spiced potato filling.', 'assets/images/masala_dosa_premium.png', true, '10 min', 'Mild'),
(11, 'Idli Sambar', 'South Indian', 110, 'Steamed rice cakes served with lentil soup.', 'assets/images/idli_sambar.png', true, '10 min', 'Mild'),
(12, 'Medu Vada', 'South Indian', 120, 'Crispy fried lentil donuts served with chutney.', 'assets/images/medu_vada.png', true, '10 min', 'Medium'),
(13, 'Rava Onion Dosa', 'South Indian', 160, 'Crispy semolina crepe with chopped onions.', 'assets/images/rava_dosa.png', true, '15 min', 'Medium'),
(14, 'Chole Bhature', 'North Indian', 190, 'Spicy chickpea curry served with fried bread.', 'assets/images/chole_bhature.png', true, '15 min', 'Medium'),
(15, 'Palak Paneer', 'North Indian', 250, 'Cottage cheese cubes in a smooth spinach gravy.', 'assets/images/palak_paneer.png', true, '20 min', 'Mild'),
(16, 'Rajma Chawal', 'North Indian', 180, 'Red kidney beans curry served with steamed rice.', 'assets/images/rajma_chawal.png', true, '15 min', 'Mild'),
(17, 'Garlic Naan', 'North Indian', 60, 'Soft Indian bread baked in tandoor with garlic topping.', 'assets/images/butter_naan.png', true, '5 min', 'Mild'),
(18, 'Veg Fried Rice', 'Chinese', 190, 'Classic wok-tossed rice with finely chopped vegetables.', 'assets/images/veg_fried_rice.png', true, '15 min', 'Mild'),
(19, 'Hakka Noodles', 'Chinese', 210, 'Stir-fried noodles with crunchy vegetables.', 'assets/images/hakka_noodles.png', true, '15 min', 'Medium'),
(20, 'Chicken Manchurian', 'Chinese', 260, 'Fried chicken meatballs in spicy dark soy gravy.', 'assets/images/chicken_manchurian.png', false, '20 min', 'Medium'),
(21, 'Spring Rolls', 'Chinese', 180, 'Crispy fried rolls stuffed with julienne vegetables.', 'assets/images/spring_rolls.png', true, '15 min', 'Mild'),
(22, 'Chicken Dum Biryani', 'Biryani', 349, 'Aromatic basmati rice cooked with marinated chicken.', 'assets/images/dum_biryani_premium.png', false, '25 min', 'Medium'),
(23, 'Hyderabadi Mutton Biryani', 'Biryani', 449, 'Authentic slow-cooked mutton biryani with spices.', 'assets/images/mutton_biryani.png', false, '30 min', 'Hot'),
(24, 'Paneer Biryani', 'Biryani', 299, 'Fragrant rice cooked with spiced cottage cheese cubes.', 'assets/images/paneer_biryani.png', true, '25 min', 'Medium'),
(25, 'Egg Biryani', 'Biryani', 270, 'Flavorful rice cooked with boiled and spiced eggs.', 'assets/images/egg_biryani.png', false, '20 min', 'Medium'),
(26, 'Gulab Jamun', 'Desserts', 99, 'Deep fried milk solids soaked in sugar syrup.', 'assets/images/gulab_jamun.png', true, '5 min', 'Mild'),
(27, 'Rasmalai', 'Desserts', 120, 'Soft cottage cheese patties in thickened sweetened milk.', 'assets/images/rasmalai.png', true, '5 min', 'Mild'),
(28, 'Chocolate Brownie', 'Desserts', 150, 'Warm chocolate brownie served with vanilla ice cream.', 'assets/images/chocolate_brownie_premium.png', true, '10 min', 'Mild'),
(29, 'Cheesecake', 'Desserts', 199, 'Classic New York style baked cheesecake.', 'assets/images/cheesecake.png', true, '10 min', 'Mild'),
(30, 'Fresh Lime Soda', 'Beverages', 80, 'Refreshing sweet and salt lime soda.', 'assets/images/lemon_soda.png', true, '5 min', 'Mild'),
(31, 'Cold Coffee', 'Beverages', 120, 'Blended iced coffee with ice cream.', 'assets/images/cold_coffee.png', true, '5 min', 'Mild'),
(32, 'Mango Lassi', 'Beverages', 110, 'Sweet yogurt drink blended with mango pulp.', 'assets/images/mango_lassi.png', true, '5 min', 'Mild'),
(33, 'Virgin Mojito', 'Beverages', 130, 'Mint and lime muddled with soda.', 'assets/images/virgin_mojito.png', true, '5 min', 'Mild'),
(34, 'Executive Veg Thali', 'Combos', 350, 'Complete meal with roti, rice, dal, 2 sabzis, and dessert.', 'assets/images/veg_thali.png', true, '20 min', 'Medium'),
(35, 'Non-Veg Thali', 'Combos', 450, 'Complete meal with chicken curry, dal, roti, rice, and dessert.', 'assets/images/non_veg_thali.png', false, '20 min', 'Medium'),
(36, 'Chinese Combo', 'Combos', 320, 'Fried Rice/Noodles with Manchurian gravy.', 'assets/images/chinese_combo.png', true, '15 min', 'Medium'),
(37, 'Quinoa Salad', 'Healthy Picks', 250, 'High protein salad with fresh veggies and vinaigrette.', 'assets/images/quinoa_salad.png', true, '10 min', 'Mild'),
(38, 'Grilled Chicken Breast', 'Healthy Picks', 320, 'Herb-marinated grilled chicken with sauteed veggies.', 'assets/images/grilled_chicken_breast.png', false, '20 min', 'Mild'),
(39, 'Fruit Bowl', 'Healthy Picks', 180, 'Assortment of fresh seasonal fruits.', 'assets/images/fruit_bowl.png', true, '5 min', 'Mild'),
(40, 'Oats Smoothie', 'Healthy Picks', 160, 'Healthy blend of oats, banana, and almond milk.', 'assets/images/oats_smoothie.png', true, '5 min', 'Mild'),
(41, 'Tandoori Prawns', 'Starters', 399, 'Smoky and succulent prawns marinated with tandoori spices.', 'assets/images/tandoori_prawns.png', false, '15 min', 'Hot'),
(42, 'Truffle Mushroom Pasta', 'Main Course', 380, 'Gourmet pasta tossed in creamy white truffle sauce and mushrooms.', 'assets/images/truffle_mushroom_pasta.png', true, '20 min', 'Mild'),
(43, 'Premium Sushi Platter', 'Combos', 599, 'A gorgeous, premium combo selection of fresh maki and nigiri rolls.', 'assets/images/premium_sushi_platter.png', false, '20 min', 'Medium'),
(44, 'Avocado Toast', 'Healthy Picks', 220, 'Sourdough slices loaded with mashed seasoned avocado, cherry tomatoes, and microgreens.', 'assets/images/avocado_toast.png', true, '10 min', 'Mild'),
(45, 'Matcha Latte', 'Beverages', 160, 'A refreshing hot or iced brew made with pure organic ceremonial grade green tea matcha and steamed oat milk.', 'assets/images/matcha_latte.png', true, '5 min', 'Mild')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    "isVeg" = EXCLUDED."isVeg",
    "prepTime" = EXCLUDED."prepTime",
    "spiceLevel" = EXCLUDED."spiceLevel";


-- 3. Create INVENTORY table
CREATE TABLE IF NOT EXISTS public.inventory (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    "availableStock" INTEGER DEFAULT 50,
    "usedStock" INTEGER DEFAULT 5
);

-- Insert sample inventory for all 40 items
INSERT INTO public.inventory (id, name, category, "availableStock") VALUES
(1, 'Paneer Tikka', 'Starters', 48),
(2, 'Chicken Tikka', 'Starters', 63),
(3, 'Crispy Corn', 'Starters', 26),
(4, 'Chilli Mushroom', 'Starters', 74),
(5, 'Hara Bhara Kebab', 'Starters', 61),
(6, 'Dal Makhani', 'Main Course', 67),
(7, 'Butter Chicken', 'Main Course', 53),
(8, 'Kadhai Paneer', 'Main Course', 73),
(9, 'Mutton Rogan Josh', 'Main Course', 78),
(10, 'Masala Dosa', 'South Indian', 38),
(11, 'Idli Sambar', 'South Indian', 63),
(12, 'Medu Vada', 'South Indian', 55),
(13, 'Rava Onion Dosa', 'South Indian', 23),
(14, 'Chole Bhature', 'North Indian', 67),
(15, 'Palak Paneer', 'North Indian', 47),
(16, 'Rajma Chawal', 'North Indian', 49),
(17, 'Garlic Naan', 'North Indian', 59),
(18, 'Veg Fried Rice', 'Chinese', 57),
(19, 'Hakka Noodles', 'Chinese', 20),
(20, 'Chicken Manchurian', 'Chinese', 37),
(21, 'Spring Rolls', 'Chinese', 52),
(22, 'Chicken Dum Biryani', 'Biryani', 69),
(23, 'Hyderabadi Mutton Biryani', 'Biryani', 61),
(24, 'Paneer Biryani', 'Biryani', 26),
(25, 'Egg Biryani', 'Biryani', 21),
(26, 'Gulab Jamun', 'Desserts', 35),
(27, 'Rasmalai', 'Desserts', 50),
(28, 'Chocolate Brownie', 'Desserts', 25),
(29, 'Cheesecake', 'Desserts', 68),
(30, 'Fresh Lime Soda', 'Beverages', 75),
(31, 'Cold Coffee', 'Beverages', 56),
(32, 'Mango Lassi', 'Beverages', 22),
(33, 'Virgin Mojito', 'Beverages', 32),
(34, 'Executive Veg Thali', 'Combos', 24),
(35, 'Non-Veg Thali', 'Combos', 50),
(36, 'Chinese Combo', 'Combos', 46),
(37, 'Quinoa Salad', 'Healthy Picks', 62),
(38, 'Grilled Chicken Breast', 'Healthy Picks', 31),
(39, 'Fruit Bowl', 'Healthy Picks', 24),
(40, 'Oats Smoothie', 'Healthy Picks', 29),
(41, 'Tandoori Prawns', 'Starters', 45),
(42, 'Truffle Mushroom Pasta', 'Main Course', 55),
(43, 'Premium Sushi Platter', 'Combos', 30),
(44, 'Avocado Toast', 'Healthy Picks', 60),
(45, 'Matcha Latte', 'Beverages', 80)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    "availableStock" = EXCLUDED."availableStock";


-- 4. Create ORDERS table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_email TEXT,
    table_number INTEGER NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'placed',
    guest_count INTEGER DEFAULT 2,
    waiter_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 5. Create ORDER_ITEMS table
CREATE TABLE IF NOT EXISTS public.order_items (
    id SERIAL PRIMARY KEY,
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id INTEGER,
    menu_item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    item_total NUMERIC(10,2) NOT NULL,
    portion TEXT,
    spice_level TEXT,
    addons JSONB,
    special_instructions TEXT
);


-- ==============================================================================
-- SET ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.waiters DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.user_preferences TO anon;
GRANT ALL ON TABLE public.carts TO anon;
GRANT ALL ON TABLE public.cart_items TO anon;
GRANT ALL ON TABLE public.menu_items TO anon;
GRANT ALL ON TABLE public.inventory TO anon;
GRANT ALL ON TABLE public.orders TO anon;
GRANT ALL ON TABLE public.order_items TO anon;
GRANT ALL ON TABLE public.waiters TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
