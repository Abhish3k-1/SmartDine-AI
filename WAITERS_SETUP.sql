-- ==============================================================================
-- SMARTDINE AI - WAITER AVATAR ROSTER ONLY
-- Paste this into Supabase SQL Editor if you only want to add/update waiter avatars.
-- This does not delete orders, menu items, carts, or users.
-- ==============================================================================

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

ALTER TABLE public.waiters DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.waiters TO anon;
