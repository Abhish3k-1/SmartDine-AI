import json
import random

categories = ['Starters', 'Main Course', 'South Indian', 'North Indian', 'Chinese', 'Biryani', 'Desserts', 'Beverages', 'Combos', 'Healthy Picks']

images = {
    'Starters': 'https://images.unsplash.com/photo-1599487405705-81781c81804c?w=400&q=80',
    'Main Course': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80',
    'South Indian': 'https://images.unsplash.com/photo-1610192205510-7057c31d102e?w=400&q=80',
    'North Indian': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80',
    'Chinese': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80',
    'Biryani': 'https://images.unsplash.com/photo-1631515243349-e0cb4c1133c9?w=400&q=80',
    'Desserts': 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&q=80',
    'Beverages': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80',
    'Combos': 'https://images.unsplash.com/photo-1547496502-affa22d38842?w=400&q=80',
    'Healthy Picks': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80'
}

items = [
    # Starters
    ("Paneer Tikka", "Starters", 249, "Smoky cottage cheese cubes marinated in aromatic spices.", True, "15 min", "Medium"),
    ("Chicken Tikka", "Starters", 299, "Juicy chicken chunks marinated in spiced yogurt.", False, "20 min", "Medium"),
    ("Crispy Corn", "Starters", 199, "Deep fried corn kernels tossed in spicy seasoning.", True, "10 min", "Mild"),
    ("Chilli Mushroom", "Starters", 229, "Batter-fried mushrooms tossed in spicy soy sauce.", True, "15 min", "Hot"),
    ("Hara Bhara Kebab", "Starters", 210, "Healthy spinach and green peas patty, pan-fried.", True, "15 min", "Mild"),
    # Main Course
    ("Dal Makhani", "Main Course", 240, "Slow-cooked black lentils in creamy tomato gravy.", True, "20 min", "Mild"),
    ("Butter Chicken", "Main Course", 349, "Tender chicken cooked in a rich, buttery tomato sauce.", False, "25 min", "Mild"),
    ("Kadhai Paneer", "Main Course", 270, "Cottage cheese cooked with bell peppers and ground spices.", True, "20 min", "Medium"),
    ("Mutton Rogan Josh", "Main Course", 420, "Classic Kashmiri style mutton curry.", False, "30 min", "Hot"),
    # South Indian
    ("Masala Dosa", "South Indian", 150, "Crispy rice crepe stuffed with spiced potato filling.", True, "10 min", "Mild"),
    ("Idli Sambar", "South Indian", 110, "Steamed rice cakes served with lentil soup.", True, "10 min", "Mild"),
    ("Medu Vada", "South Indian", 120, "Crispy fried lentil donuts served with chutney.", True, "10 min", "Medium"),
    ("Rava Onion Dosa", "South Indian", 160, "Crispy semolina crepe with chopped onions.", True, "15 min", "Medium"),
    # North Indian
    ("Chole Bhature", "North Indian", 190, "Spicy chickpea curry served with fried bread.", True, "15 min", "Medium"),
    ("Palak Paneer", "North Indian", 250, "Cottage cheese cubes in a smooth spinach gravy.", True, "20 min", "Mild"),
    ("Rajma Chawal", "North Indian", 180, "Red kidney beans curry served with steamed rice.", True, "15 min", "Mild"),
    ("Garlic Naan", "North Indian", 60, "Soft Indian bread baked in tandoor with garlic topping.", True, "5 min", "Mild"),
    # Chinese
    ("Veg Fried Rice", "Chinese", 190, "Classic wok-tossed rice with finely chopped vegetables.", True, "15 min", "Mild"),
    ("Hakka Noodles", "Chinese", 210, "Stir-fried noodles with crunchy vegetables.", True, "15 min", "Medium"),
    ("Chicken Manchurian", "Chinese", 260, "Fried chicken meatballs in spicy dark soy gravy.", False, "20 min", "Medium"),
    ("Spring Rolls", "Chinese", 180, "Crispy fried rolls stuffed with julienne vegetables.", True, "15 min", "Mild"),
    # Biryani
    ("Chicken Dum Biryani", "Biryani", 349, "Aromatic basmati rice cooked with marinated chicken.", False, "25 min", "Medium"),
    ("Hyderabadi Mutton Biryani", "Biryani", 449, "Authentic slow-cooked mutton biryani with spices.", False, "30 min", "Hot"),
    ("Paneer Biryani", "Biryani", 299, "Fragrant rice cooked with spiced cottage cheese cubes.", True, "25 min", "Medium"),
    ("Egg Biryani", "Biryani", 270, "Flavorful rice cooked with boiled and spiced eggs.", False, "20 min", "Medium"),
    # Desserts
    ("Gulab Jamun", "Desserts", 99, "Deep fried milk solids soaked in sugar syrup.", True, "5 min", "Mild"),
    ("Rasmalai", "Desserts", 120, "Soft cottage cheese patties in thickened sweetened milk.", True, "5 min", "Mild"),
    ("Chocolate Brownie", "Desserts", 150, "Warm chocolate brownie served with vanilla ice cream.", True, "10 min", "Mild"),
    ("Cheesecake", "Desserts", 199, "Classic New York style baked cheesecake.", True, "10 min", "Mild"),
    # Beverages
    ("Fresh Lime Soda", "Beverages", 80, "Refreshing sweet and salt lime soda.", True, "5 min", "Mild"),
    ("Cold Coffee", "Beverages", 120, "Blended iced coffee with ice cream.", True, "5 min", "Mild"),
    ("Mango Lassi", "Beverages", 110, "Sweet yogurt drink blended with mango pulp.", True, "5 min", "Mild"),
    ("Virgin Mojito", "Beverages", 130, "Mint and lime muddled with soda.", True, "5 min", "Mild"),
    # Combos
    ("Executive Veg Thali", "Combos", 350, "Complete meal with roti, rice, dal, 2 sabzis, and dessert.", True, "20 min", "Medium"),
    ("Non-Veg Thali", "Combos", 450, "Complete meal with chicken curry, dal, roti, rice, and dessert.", False, "20 min", "Medium"),
    ("Chinese Combo", "Combos", 320, "Fried Rice/Noodles with Manchurian gravy.", True, "15 min", "Medium"),
    # Healthy Picks
    ("Quinoa Salad", "Healthy Picks", 250, "High protein salad with fresh veggies and vinaigrette.", True, "10 min", "Mild"),
    ("Grilled Chicken Breast", "Healthy Picks", 320, "Herb-marinated grilled chicken with sautéed veggies.", False, "20 min", "Mild"),
    ("Fruit Bowl", "Healthy Picks", 180, "Assortment of fresh seasonal fruits.", True, "5 min", "Mild"),
    ("Oats Smoothie", "Healthy Picks", 160, "Healthy blend of oats, banana, and almond milk.", True, "5 min", "Mild")
]

menu_sql = "INSERT INTO public.menu_items (id, name, category, price, description, image, \"isVeg\", \"prepTime\", \"spiceLevel\") VALUES\n"
inv_sql = "INSERT INTO public.inventory (id, name, category, \"availableStock\") VALUES\n"

menu_values = []
inv_values = []

for idx, item in enumerate(items):
    id = idx + 1
    name, category, price, desc, isVeg, prepTime, spiceLevel = item
    img = images[category]
    isVeg_str = 'true' if isVeg else 'false'
    
    # Escape quotes
    name_esc = name.replace("'", "''")
    desc_esc = desc.replace("'", "''")
    
    menu_values.append(f"({id}, '{name_esc}', '{category}', {price}, '{desc_esc}', '{img}', {isVeg_str}, '{prepTime}', '{spiceLevel}')")
    inv_values.append(f"({id}, '{name_esc}', '{category}', {random.randint(20, 80)})")

menu_sql += ",\n".join(menu_values) + "\nON CONFLICT (id) DO NOTHING;\n"
inv_sql += ",\n".join(inv_values) + "\nON CONFLICT (id) DO NOTHING;\n"

with open("sql_gen.txt", "w") as f:
    f.write(menu_sql + "\n\n" + inv_sql)
