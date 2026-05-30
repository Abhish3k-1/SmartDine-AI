import re
import json

# Same 40 items logic
categories = ['Starters', 'Main Course', 'South Indian', 'North Indian', 'Chinese', 'Biryani', 'Desserts', 'Beverages', 'Combos', 'Healthy Picks']

item_images = {
    "Paneer Tikka": "assets/images/paneer_tikka_premium.png",
    "Chicken Tikka": "assets/images/chicken_tikka.png",
    "Crispy Corn": "assets/images/crispy_corn.png",
    "Chilli Mushroom": "assets/images/chilli_mushroom.png",
    "Hara Bhara Kebab": "assets/images/hara_bhara_kebab.png",
    "Dal Makhani": "assets/images/dal_tadka.png",
    "Butter Chicken": "assets/images/butter_chicken_premium.png",
    "Kadhai Paneer": "assets/images/kadhai_paneer.png",
    "Mutton Rogan Josh": "assets/images/mutton_rogan_josh.png",
    "Masala Dosa": "assets/images/masala_dosa_premium.png",
    "Idli Sambar": "assets/images/idli_sambar.png",
    "Medu Vada": "assets/images/medu_vada.png",
    "Rava Onion Dosa": "assets/images/rava_dosa.png",
    "Chole Bhature": "assets/images/chole_bhature.png",
    "Palak Paneer": "assets/images/palak_paneer.png",
    "Rajma Chawal": "assets/images/rajma_chawal.png",
    "Garlic Naan": "assets/images/butter_naan.png",
    "Veg Fried Rice": "assets/images/veg_fried_rice.png",
    "Hakka Noodles": "assets/images/veg_fried_rice.png",
    "Chicken Manchurian": "assets/images/chicken_tikka.png",
    "Spring Rolls": "assets/images/crispy_corn.png",
    "Chicken Dum Biryani": "assets/images/dum_biryani_premium.png",
    "Hyderabadi Mutton Biryani": "assets/images/dum_biryani_premium.png",
    "Paneer Biryani": "assets/images/dum_biryani_premium.png",
    "Egg Biryani": "assets/images/dum_biryani_premium.png",
    "Gulab Jamun": "assets/images/chocolate_brownie_premium.png",
    "Rasmalai": "assets/images/chocolate_brownie_premium.png",
    "Chocolate Brownie": "assets/images/chocolate_brownie_premium.png",
    "Cheesecake": "assets/images/chocolate_brownie_premium.png",
    "Fresh Lime Soda": "assets/images/lemon_soda.png",
    "Cold Coffee": "assets/images/cold_coffee_premium.png",
    "Mango Lassi": "assets/images/lemon_soda.png",
    "Virgin Mojito": "assets/images/lemon_soda.png",
    "Executive Veg Thali": "assets/images/dal_tadka.png",
    "Non-Veg Thali": "assets/images/butter_chicken_premium.png",
    "Chinese Combo": "assets/images/veg_fried_rice.png",
    "Quinoa Salad": "assets/images/crispy_corn.png",
    "Grilled Chicken Breast": "assets/images/chicken_tikka.png",
    "Fruit Bowl": "assets/images/crispy_corn.png",
    "Oats Smoothie": "assets/images/cold_coffee_premium.png"
}

items = [
    ("Paneer Tikka", "Starters", 249, "Smoky cottage cheese cubes marinated in aromatic spices.", True, "15 min", "Medium"),
    ("Chicken Tikka", "Starters", 299, "Juicy chicken chunks marinated in spiced yogurt.", False, "20 min", "Medium"),
    ("Crispy Corn", "Starters", 199, "Deep fried corn kernels tossed in spicy seasoning.", True, "10 min", "Mild"),
    ("Chilli Mushroom", "Starters", 229, "Batter-fried mushrooms tossed in spicy soy sauce.", True, "15 min", "Hot"),
    ("Hara Bhara Kebab", "Starters", 210, "Healthy spinach and green peas patty, pan-fried.", True, "15 min", "Mild"),
    ("Dal Makhani", "Main Course", 240, "Slow-cooked black lentils in creamy tomato gravy.", True, "20 min", "Mild"),
    ("Butter Chicken", "Main Course", 349, "Tender chicken cooked in a rich, buttery tomato sauce.", False, "25 min", "Mild"),
    ("Kadhai Paneer", "Main Course", 270, "Cottage cheese cooked with bell peppers and ground spices.", True, "20 min", "Medium"),
    ("Mutton Rogan Josh", "Main Course", 420, "Classic Kashmiri style mutton curry.", False, "30 min", "Hot"),
    ("Masala Dosa", "South Indian", 150, "Crispy rice crepe stuffed with spiced potato filling.", True, "10 min", "Mild"),
    ("Idli Sambar", "South Indian", 110, "Steamed rice cakes served with lentil soup.", True, "10 min", "Mild"),
    ("Medu Vada", "South Indian", 120, "Crispy fried lentil donuts served with chutney.", True, "10 min", "Medium"),
    ("Rava Onion Dosa", "South Indian", 160, "Crispy semolina crepe with chopped onions.", True, "15 min", "Medium"),
    ("Chole Bhature", "North Indian", 190, "Spicy chickpea curry served with fried bread.", True, "15 min", "Medium"),
    ("Palak Paneer", "North Indian", 250, "Cottage cheese cubes in a smooth spinach gravy.", True, "20 min", "Mild"),
    ("Rajma Chawal", "North Indian", 180, "Red kidney beans curry served with steamed rice.", True, "15 min", "Mild"),
    ("Garlic Naan", "North Indian", 60, "Soft Indian bread baked in tandoor with garlic topping.", True, "5 min", "Mild"),
    ("Veg Fried Rice", "Chinese", 190, "Classic wok-tossed rice with finely chopped vegetables.", True, "15 min", "Mild"),
    ("Hakka Noodles", "Chinese", 210, "Stir-fried noodles with crunchy vegetables.", True, "15 min", "Medium"),
    ("Chicken Manchurian", "Chinese", 260, "Fried chicken meatballs in spicy dark soy gravy.", False, "20 min", "Medium"),
    ("Spring Rolls", "Chinese", 180, "Crispy fried rolls stuffed with julienne vegetables.", True, "15 min", "Mild"),
    ("Chicken Dum Biryani", "Biryani", 349, "Aromatic basmati rice cooked with marinated chicken.", False, "25 min", "Medium"),
    ("Hyderabadi Mutton Biryani", "Biryani", 449, "Authentic slow-cooked mutton biryani with spices.", False, "30 min", "Hot"),
    ("Paneer Biryani", "Biryani", 299, "Fragrant rice cooked with spiced cottage cheese cubes.", True, "25 min", "Medium"),
    ("Egg Biryani", "Biryani", 270, "Flavorful rice cooked with boiled and spiced eggs.", False, "20 min", "Medium"),
    ("Gulab Jamun", "Desserts", 99, "Deep fried milk solids soaked in sugar syrup.", True, "5 min", "Mild"),
    ("Rasmalai", "Desserts", 120, "Soft cottage cheese patties in thickened sweetened milk.", True, "5 min", "Mild"),
    ("Chocolate Brownie", "Desserts", 150, "Warm chocolate brownie served with vanilla ice cream.", True, "10 min", "Mild"),
    ("Cheesecake", "Desserts", 199, "Classic New York style baked cheesecake.", True, "10 min", "Mild"),
    ("Fresh Lime Soda", "Beverages", 80, "Refreshing sweet and salt lime soda.", True, "5 min", "Mild"),
    ("Cold Coffee", "Beverages", 120, "Blended iced coffee with ice cream.", True, "5 min", "Mild"),
    ("Mango Lassi", "Beverages", 110, "Sweet yogurt drink blended with mango pulp.", True, "5 min", "Mild"),
    ("Virgin Mojito", "Beverages", 130, "Mint and lime muddled with soda.", True, "5 min", "Mild"),
    ("Executive Veg Thali", "Combos", 350, "Complete meal with roti, rice, dal, 2 sabzis, and dessert.", True, "20 min", "Medium"),
    ("Non-Veg Thali", "Combos", 450, "Complete meal with chicken curry, dal, roti, rice, and dessert.", False, "20 min", "Medium"),
    ("Chinese Combo", "Combos", 320, "Fried Rice/Noodles with Manchurian gravy.", True, "15 min", "Medium"),
    ("Quinoa Salad", "Healthy Picks", 250, "High protein salad with fresh veggies and vinaigrette.", True, "10 min", "Mild"),
    ("Grilled Chicken Breast", "Healthy Picks", 320, "Herb-marinated grilled chicken with sautéed veggies.", False, "20 min", "Mild"),
    ("Fruit Bowl", "Healthy Picks", 180, "Assortment of fresh seasonal fruits.", True, "5 min", "Mild"),
    ("Oats Smoothie", "Healthy Picks", 160, "Healthy blend of oats, banana, and almond milk.", True, "5 min", "Mild")
]

js_items = []
for idx, (name, cat, price, desc, isVeg, prep, spice) in enumerate(items):
    js_obj = f"""        {{
            id: {idx+1}, name: '{name}', category: '{cat}', price: {price},
            description: '{desc}',
            image: '{item_images[name]}', rating: 4.5, prepTime: '{prep}', isVeg: {'true' if isVeg else 'false'},
            spiceLevel: '{spice}', tags: [], available: true,
            addOns: [], portionOptions: [{{ name: 'Regular', priceMultiplier: 1 }}]
        }}"""
    js_items.append(js_obj)

js_array_str = "[\n" + ",\n".join(js_items) + "\n    ]"


# Read data.js
with open("c:/coding files/college project(codex)/js/data.js", "r", encoding="utf-8") as f:
    data = f.read()

# Update Menu array
new_menu_func = f"""function getRawMenu() {{
    return {js_array_str};
}}"""
data = re.sub(r'function getRawMenu\(\) \{.*?\n\}', new_menu_func, data, flags=re.DOTALL)

# Update Waiters array to use img tags
new_waiters = """function getRawWaiters() {
    return [
        { id: 1, name: 'Rahul Sharma', avatar: '<img src="assets/images/avatars/rahul.jpg" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">', rating: 4.9, status: 'Active', tables: [1,2,3,4,5], description: 'Senior server, 5 years experience' },
        { id: 2, name: 'Amit Patel', avatar: '<img src="assets/images/avatars/amit.jpg" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">', rating: 4.8, status: 'Active', tables: [6,7,8,9,10], description: 'Quick service specialist' },
        { id: 3, name: 'Priya Nair', avatar: '<img src="assets/images/avatars/priya.jpg" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">', rating: 4.9, status: 'Active', tables: [11,12,13,14,15], description: 'Customer favourite, dessert expert' },
        { id: 4, name: 'Sarah Khan', avatar: '<img src="assets/images/avatars/sarah.jpg" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">', rating: 4.7, status: 'Active', tables: [16,17,18,19,20], description: 'Beverage specialist, wine knowledge' }
    ];
}"""

data = re.sub(r'function getRawWaiters\(\) \{.*?\n\}', new_waiters, data, flags=re.DOTALL)

# Write it back
with open("c:/coding files/college project(codex)/js/data.js", "w", encoding="utf-8") as f:
    f.write(data)

print("Updated data.js with image-based avatars and 40 items!")
