import re

images = [
    "paneer_tikka_premium.png",
    "chicken_tikka.png",
    "crispy_corn.png",
    "chilli_mushroom.png",
    "hara_bhara_kebab.png",
    "dal_tadka.png",
    "butter_chicken_premium.png",
    "kadhai_paneer.png",
    "mutton_rogan_josh.png",
    "masala_dosa_premium.png",
    "idli_sambar.png",
    "medu_vada.png",
    "rava_dosa.png",
    "chole_bhature.png",
    "palak_paneer.png",
    "rajma_chawal.png",
    "butter_naan.png",
    "veg_fried_rice.png",
    "hakka_noodles.png",
    "chicken_manchurian.png",
    "spring_rolls.png",
    "dum_biryani_premium.png",
    "mutton_biryani.png",
    "paneer_biryani.png",
    "egg_biryani.png",
    "gulab_jamun.png",
    "rasmalai.png",
    "chocolate_brownie_premium.png",
    "cheesecake.png",
    "lemon_soda.png",
    "cold_coffee.png",
    "mango_lassi.png",
    "virgin_mojito.png",
    "veg_thali.png",
    "non_veg_thali.png",
    "chinese_combo.png",
    "quinoa_salad.png",
    "grilled_chicken_breast.png",
    "fruit_bowl.png",
    "oats_smoothie.png",
    "tandoori_prawns.png",
    "truffle_mushroom_pasta.png",
    "premium_sushi_platter.png",
    "avocado_toast.png",
    "matcha_latte.png"
]

def update_js_data():
    with open('js/data.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # We want to replace the image path for id 1 to 45.
    for i, img in enumerate(images):
        id_num = i + 1
        # Regex to find: id: X, ... image: '...',
        # We need a robust regex because the fields are ordered a certain way, but it might vary.
        # Let's find the id line and replace the image on the subsequent lines.
        # A simpler way is to find id: X, and the very next image: '...',
        pattern = r"(id:\s*" + str(id_num) + r".*?image:\s*')[^']+(')"
        new_path = "assets/images/" + img
        content = re.sub(pattern, r"\g<1>" + new_path + r"\g<2>", content, flags=re.DOTALL)

    with open('js/data.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated js/data.js")

def update_sql_seed():
    with open('SUPABASE_SETUP.sql', 'r', encoding='utf-8') as f:
        content = f.read()

    # The SQL lines look like:
    # (X, 'Name', 'Cat', Price, 'Desc', 'https://...', true, '15 min', 'Medium'),
    for i, img in enumerate(images):
        id_num = i + 1
        new_path = "assets/images/" + img
        # Match (id_num, ... , 'url',
        # To be safe, we find: ^(id_num, '.*?', '.*?', \d+, '.*?', ')[^']+(')
        pattern = r"(\n\(" + str(id_num) + r",\s*'[^']*',\s*'[^']*',\s*\d+,\s*'[^']*',\s*')[^']+(')"
        content = re.sub(pattern, r"\g<1>" + new_path + r"\g<2>", content)

    with open('SUPABASE_SETUP.sql', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated SUPABASE_SETUP.sql")

update_js_data()
update_sql_seed()
