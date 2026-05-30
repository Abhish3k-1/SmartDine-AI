/* ============================================================
   SmartDine AI — Data Layer (Version 2.3)
   Includes 45 Unique Dishes with High-Resolution Photos
   ============================================================ */

var MENU_CATEGORIES = ['All', 'Starters', 'Main Course', 'South Indian', 'North Indian', 'Chinese', 'Biryani', 'Desserts', 'Beverages', 'Combos', 'Healthy Picks'];

// Global variables for data
var SAMPLE_MENU = [];
var SAMPLE_INVENTORY = [];
var SAMPLE_WAITERS = [];

// ==========================================
// RAW DATA GENERATION
// ==========================================

function getRawMenu() {
    return [
        {
            id: 1, name: 'Paneer Tikka', category: 'Starters', price: 249,
            description: 'Smoky cottage cheese cubes marinated in aromatic spices.',
            image: 'assets/images/paneer_tikka_premium.png', rating: 4.5, prepTime: '15 min', isVeg: true,
            spiceLevel: 'Medium', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 2, name: 'Chicken Tikka', category: 'Starters', price: 299,
            description: 'Juicy chicken chunks marinated in spiced yogurt.',
            image: 'assets/images/chicken_tikka.png', rating: 4.6, prepTime: '20 min', isVeg: false,
            spiceLevel: 'Medium', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 3, name: 'Crispy Corn', category: 'Starters', price: 199,
            description: 'Deep fried corn kernels tossed in spicy seasoning.',
            image: 'assets/images/crispy_corn.png', rating: 4.3, prepTime: '10 min', isVeg: true,
            spiceLevel: 'Mild', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 4, name: 'Chilli Mushroom', category: 'Starters', price: 229,
            description: 'Batter-fried mushrooms tossed in spicy soy sauce.',
            image: 'assets/images/chilli_mushroom.png', rating: 4.4, prepTime: '15 min', isVeg: true,
            spiceLevel: 'Hot', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 5, name: 'Hara Bhara Kebab', category: 'Starters', price: 210,
            description: 'Healthy spinach and green peas patty, pan-fried.',
            image: 'assets/images/hara_bhara_kebab.png', rating: 4.2, prepTime: '15 min', isVeg: true,
            spiceLevel: 'Mild', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 6, name: 'Dal Makhani', category: 'Main Course', price: 240,
            description: 'Slow-cooked black lentils in creamy tomato gravy.',
            image: 'assets/images/dal_tadka.png', rating: 4.5, prepTime: '20 min', isVeg: true,
            spiceLevel: 'Mild', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 7, name: 'Butter Chicken', category: 'Main Course', price: 349,
            description: 'Tender chicken cooked in a rich, buttery tomato sauce.',
            image: 'assets/images/butter_chicken_premium.png', rating: 4.8, prepTime: '25 min', isVeg: false,
            spiceLevel: 'Mild', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 8, name: 'Kadhai Paneer', category: 'Main Course', price: 270,
            description: 'Cottage cheese cooked with bell peppers and ground spices.',
            image: 'assets/images/kadhai_paneer.png', rating: 4.4, prepTime: '20 min', isVeg: true,
            spiceLevel: 'Medium', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 9, name: 'Mutton Rogan Josh', category: 'Main Course', price: 420,
            description: 'Classic Kashmiri style mutton curry.',
            image: 'assets/images/mutton_rogan_josh.png', rating: 4.7, prepTime: '30 min', isVeg: false,
            spiceLevel: 'Hot', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 10, name: 'Masala Dosa', category: 'South Indian', price: 150,
            description: 'Crispy rice crepe stuffed with spiced potato filling.',
            image: 'assets/images/masala_dosa_premium.png', rating: 4.6, prepTime: '10 min', isVeg: true,
            spiceLevel: 'Mild', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 11, name: 'Idli Sambar', category: 'South Indian', price: 110,
            description: 'Steamed rice cakes served with lentil soup.',
            image: 'assets/images/idli_sambar.png', rating: 4.3, prepTime: '10 min', isVeg: true,
            spiceLevel: 'Mild', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 12, name: 'Medu Vada', category: 'South Indian', price: 120,
            description: 'Crispy fried lentil donuts served with chutney.',
            image: 'assets/images/medu_vada.png', rating: 4.4, prepTime: '10 min', isVeg: true,
            spiceLevel: 'Medium', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 13, name: 'Rava Onion Dosa', category: 'South Indian', price: 160,
            description: 'Crispy semolina crepe with chopped onions.',
            image: 'assets/images/rava_dosa.png', rating: 4.5, prepTime: '15 min', isVeg: true,
            spiceLevel: 'Medium', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 14, name: 'Chole Bhature', category: 'North Indian', price: 190,
            description: 'Spicy chickpea curry served with fried bread.',
            image: 'assets/images/chole_bhature.png', rating: 4.7, prepTime: '15 min', isVeg: true,
            spiceLevel: 'Medium', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 15, name: 'Palak Paneer', category: 'North Indian', price: 250,
            description: 'Cottage cheese cubes in a smooth spinach gravy.',
            image: 'assets/images/palak_paneer.png', rating: 4.4, prepTime: '20 min', isVeg: true,
            spiceLevel: 'Mild', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 16, name: 'Rajma Chawal', category: 'North Indian', price: 180,
            description: 'Red kidney beans curry served with steamed rice.',
            image: 'assets/images/rajma_chawal.png', rating: 4.5, prepTime: '15 min', isVeg: true,
            spiceLevel: 'Mild', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 17, name: 'Garlic Naan', category: 'North Indian', price: 60,
            description: 'Soft Indian bread baked in tandoor with garlic topping.',
            image: 'assets/images/butter_naan.png', rating: 4.5, prepTime: '5 min', isVeg: true,
            spiceLevel: 'Mild', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 18, name: 'Veg Fried Rice', category: 'Chinese', price: 190,
            description: 'Classic wok-tossed rice with finely chopped vegetables.',
            image: 'assets/images/veg_fried_rice.png', rating: 4.3, prepTime: '15 min', isVeg: true,
            spiceLevel: 'Mild', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 19, name: 'Hakka Noodles', category: 'Chinese', price: 210,
            description: 'Stir-fried noodles with crunchy vegetables.',
            image: 'assets/images/hakka_noodles.png', rating: 4.4, prepTime: '15 min', isVeg: true,
            spiceLevel: 'Medium', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 20, name: 'Chicken Manchurian', category: 'Chinese', price: 260,
            description: 'Fried chicken meatballs in spicy dark soy gravy.',
            image: 'assets/images/chicken_manchurian.png', rating: 4.5, prepTime: '20 min', isVeg: false,
            spiceLevel: 'Medium', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 21, name: 'Spring Rolls', category: 'Chinese', price: 180,
            description: 'Crispy fried rolls stuffed with julienne vegetables.',
            image: 'assets/images/spring_rolls.png', rating: 4.2, prepTime: '15 min', isVeg: true,
            spiceLevel: 'Mild', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 22, name: 'Chicken Dum Biryani', category: 'Biryani', price: 349,
            description: 'Aromatic basmati rice cooked with marinated chicken.',
            image: 'assets/images/dum_biryani_premium.png', rating: 4.8, prepTime: '25 min', isVeg: false,
            spiceLevel: 'Medium', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 23, name: 'Hyderabadi Mutton Biryani', category: 'Biryani', price: 449,
            description: 'Authentic slow-cooked mutton biryani with spices.',
            image: 'assets/images/mutton_biryani.png', rating: 4.9, prepTime: '30 min', isVeg: false,
            spiceLevel: 'Hot', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 24, name: 'Paneer Biryani', category: 'Biryani', price: 299,
            description: 'Fragrant rice cooked with spiced cottage cheese cubes.',
            image: 'assets/images/paneer_biryani.png', rating: 4.4, prepTime: '25 min', isVeg: true,
            spiceLevel: 'Medium', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 25, name: 'Egg Biryani', category: 'Biryani', price: 270,
            description: 'Flavorful rice cooked with boiled and spiced eggs.',
            image: 'assets/images/egg_biryani.png', rating: 4.3, prepTime: '20 min', isVeg: false,
            spiceLevel: 'Medium', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 26, name: 'Gulab Jamun', category: 'Desserts', price: 99,
            description: 'Deep fried milk solids soaked in sugar syrup.',
            image: 'assets/images/gulab_jamun.png', rating: 4.6, prepTime: '5 min', isVeg: true,
            spiceLevel: 'Mild', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 27, name: 'Rasmalai', category: 'Desserts', price: 120,
            description: 'Soft cottage cheese patties in thickened sweetened milk.',
            image: 'assets/images/rasmalai.png', rating: 4.6, prepTime: '5 min', isVeg: true,
            spiceLevel: 'Mild', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 28, name: 'Chocolate Brownie', category: 'Desserts', price: 150,
            description: 'Warm chocolate brownie served with vanilla ice cream.',
            image: 'assets/images/chocolate_brownie_premium.png', rating: 4.7, prepTime: '10 min', isVeg: true,
            spiceLevel: 'Mild', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 29, name: 'Cheesecake', category: 'Desserts', price: 199,
            description: 'Classic New York style baked cheesecake.',
            image: 'assets/images/cheesecake.png', rating: 4.5, prepTime: '10 min', isVeg: true,
            spiceLevel: 'Mild', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 30, name: 'Fresh Lime Soda', category: 'Beverages', price: 80,
            description: 'Refreshing sweet and salt lime soda.',
            image: 'assets/images/lemon_soda.png', rating: 4.2, prepTime: '5 min', isVeg: true,
            spiceLevel: 'Mild', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 31, name: 'Cold Coffee', category: 'Beverages', price: 120,
            description: 'Blended iced coffee with ice cream.',
            image: 'assets/images/cold_coffee.png', rating: 4.6, prepTime: '5 min', isVeg: true,
            spiceLevel: 'Mild', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 32, name: 'Mango Lassi', category: 'Beverages', price: 110,
            description: 'Sweet yogurt drink blended with mango pulp.',
            image: 'assets/images/mango_lassi.png', rating: 4.5, prepTime: '5 min', isVeg: true,
            spiceLevel: 'Mild', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 33, name: 'Virgin Mojito', category: 'Beverages', price: 130,
            description: 'Mint and lime muddled with soda.',
            image: 'assets/images/virgin_mojito.png', rating: 4.4, prepTime: '5 min', isVeg: true,
            spiceLevel: 'Mild', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 34, name: 'Executive Veg Thali', category: 'Combos', price: 350,
            description: 'Complete meal with roti, rice, dal, 2 sabzis, and dessert.',
            image: 'assets/images/veg_thali.png', rating: 4.6, prepTime: '20 min', isVeg: true,
            spiceLevel: 'Medium', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 35, name: 'Non-Veg Thali', category: 'Combos', price: 450,
            description: 'Complete meal with chicken curry, dal, roti, rice, and dessert.',
            image: 'assets/images/non_veg_thali.png', rating: 4.7, prepTime: '20 min', isVeg: false,
            spiceLevel: 'Medium', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 36, name: 'Chinese Combo', category: 'Combos', price: 320,
            description: 'Fried Rice/Noodles with Manchurian gravy.',
            image: 'assets/images/chinese_combo.png', rating: 4.4, prepTime: '15 min', isVeg: true,
            spiceLevel: 'Medium', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 37, name: 'Quinoa Salad', category: 'Healthy Picks', price: 250,
            description: 'High protein salad with fresh veggies and vinaigrette.',
            image: 'assets/images/quinoa_salad.png', rating: 4.4, prepTime: '10 min', isVeg: true,
            spiceLevel: 'Mild', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 38, name: 'Grilled Chicken Breast', category: 'Healthy Picks', price: 320,
            description: 'Herb-marinated grilled chicken with sautéed veggies.',
            image: 'assets/images/grilled_chicken_breast.png', rating: 4.5, prepTime: '20 min', isVeg: false,
            spiceLevel: 'Mild', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 39, name: 'Fruit Bowl', category: 'Healthy Picks', price: 180,
            description: 'Assortment of fresh seasonal fruits.',
            image: 'assets/images/fruit_bowl.png', rating: 4.2, prepTime: '5 min', isVeg: true,
            spiceLevel: 'Mild', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 40, name: 'Oats Smoothie', category: 'Healthy Picks', price: 160,
            description: 'Healthy blend of oats, banana, and almond milk.',
            image: 'assets/images/oats_smoothie.png', rating: 4.3, prepTime: '5 min', isVeg: true,
            spiceLevel: 'Mild', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 41, name: 'Tandoori Prawns', category: 'Starters', price: 399,
            description: 'Smoky and succulent prawns marinated with tandoori spices.',
            image: 'assets/images/tandoori_prawns.png', rating: 4.8, prepTime: '15 min', isVeg: false,
            spiceLevel: 'Hot', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 42, name: 'Truffle Mushroom Pasta', category: 'Main Course', price: 380,
            description: 'Gourmet pasta tossed in creamy white truffle sauce and mushrooms.',
            image: 'assets/images/truffle_mushroom_pasta.png', rating: 4.9, prepTime: '20 min', isVeg: true,
            spiceLevel: 'Mild', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 43, name: 'Premium Sushi Platter', category: 'Combos', price: 599,
            description: 'A gorgeous, premium combo selection of fresh maki and nigiri rolls.',
            image: 'assets/images/premium_sushi_platter.png', rating: 4.9, prepTime: '20 min', isVeg: false,
            spiceLevel: 'Medium', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 44, name: 'Avocado Toast', category: 'Healthy Picks', price: 220,
            description: 'Sourdough slices loaded with mashed seasoned avocado, cherry tomatoes, and microgreens.',
            image: 'assets/images/avocado_toast.png', rating: 4.6, prepTime: '10 min', isVeg: true,
            spiceLevel: 'Mild', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        },
        {
            id: 45, name: 'Matcha Latte', category: 'Beverages', price: 160,
            description: 'A refreshing hot or iced brew made with pure organic ceremonial grade green tea matcha and steamed oat milk.',
            image: 'assets/images/matcha_latte.png', rating: 4.7, prepTime: '5 min', isVeg: true,
            spiceLevel: 'Mild', tags: [], available: true,
            addOns: [], portionOptions: [{ name: 'Regular', priceMultiplier: 1 }]
        }
    ];
}

function getRawInventory(menuItems) {
    return menuItems.map(function(item) {
        var available = Math.floor(Math.random() * 80) + 20; // 20 to 100
        var used = Math.floor(Math.random() * (available - 5)) + 5;
        return {
            id: item.id,
            name: item.name,
            category: item.category,
            availableStock: available,
            usedStock: used
        };
    });
}

function getRawWaiters() {
    return [
        { id: 1, name: 'Ananya Rao', avatar: '<img src="assets/images/avatars/ananya.png" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">', rating: 4.9, status: 'Active', tables: [1,2,3,4], description: 'Senior server, guest experience specialist' },
        { id: 2, name: 'Meera Kapoor', avatar: '<img src="assets/images/avatars/meera.png" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">', rating: 4.8, status: 'Active', tables: [5,6,7,8], description: 'Quick service specialist' },
        { id: 3, name: 'Isha Nair', avatar: '<img src="assets/images/avatars/isha.png" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">', rating: 4.9, status: 'Active', tables: [9,10,11,12], description: 'Customer favourite, dessert expert' },
        { id: 4, name: 'Kavya Menon', avatar: '<img src="assets/images/avatars/kavya.png" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">', rating: 4.8, status: 'Active', tables: [13,14,15,16], description: 'Beverage and pairing specialist' },
        { id: 5, name: 'Arjun Sharma', avatar: '<img src="assets/images/avatars/arjun.png" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">', rating: 4.7, status: 'Active', tables: [17,18,19,20], description: 'Floor coordinator and table runner' }
    ];
}

// ==========================================
// INITIALIZATION (Database resets on version change)
// ==========================================

function initializeData() {
    var version = '2.4';
    var storedVersion = Storage.get('smartdine_version', null);
    var storedMenu = Storage.get('smartdine_menu', []);
    var storedWaiters = Storage.get('smartdine_waiters', []);
    var waiterAvatarsReady = storedWaiters && storedWaiters.length >= 5 && String(storedWaiters[0].avatar || '').indexOf('assets/images/avatars/ananya.png') !== -1;

    if (storedVersion !== version || !storedMenu || storedMenu.length < 45 || !waiterAvatarsReady) {
        console.log('[Data] Initializing premium data version 2.4...');
        
        var menu = getRawMenu();
        Storage.set('smartdine_menu', menu);
        Storage.set('smartdine_inventory', getRawInventory(menu));
        Storage.set('smartdine_waiters', getRawWaiters());
        
        if (!Storage.get('smartdine_cart')) Storage.set('smartdine_cart', []);
        if (!Storage.get('smartdine_orders')) Storage.set('smartdine_orders', []);
        
        Storage.set('smartdine_version', version);
    }

    // Load to global variables
    SAMPLE_MENU = Storage.get('smartdine_menu', []);
    SAMPLE_INVENTORY = Storage.get('smartdine_inventory', []);
    SAMPLE_WAITERS = Storage.get('smartdine_waiters', []);

    parseTableFromURL();
}

function parseTableFromURL() {
    var hash = window.location.hash;
    if (hash.indexOf('?table=') !== -1) {
        var parts = hash.split('?table=');
        if (parts.length > 1) {
            var tableNum = parseInt(parts[1]);
            if (!isNaN(tableNum) && tableNum >= 1 && tableNum <= 20) {
                Storage.set('smartdine_table', tableNum);
            }
        }
    }
}
