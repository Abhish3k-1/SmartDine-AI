// ============================================================
// SmartDine AI - Menu Assistant
// ============================================================

var AI_QUICK_PROMPTS = [
    'High protein options',
    'High carb meal',
    'Healthy under 300',
    'Spicy vegetarian',
    'Best desserts',
    'Drinks under 150'
];

function toggleAIChat(prompt) {
    var panel = document.getElementById('ai-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'ai-panel';
        panel.className = 'ai-chat-panel';
        panel.innerHTML = renderAIChatPanel();
        document.body.appendChild(panel);
        void panel.offsetWidth;
    }
    if (prompt) {
        panel.classList.add('active');
        setTimeout(function() {
            askAI(prompt);
        }, 0);
    } else {
        panel.classList.toggle('active');
    }
    if (panel.classList.contains('active')) {
        var input = document.getElementById('ai-input');
        if (input) input.focus();
    }
}

function renderAIChatPanel() {
    var chips = AI_QUICK_PROMPTS.map(function(prompt) {
        return '<button type="button" class="ai-chip" data-action="ask-ai" data-prompt="' + escapeHTML(prompt) + '">' + escapeHTML(prompt) + '</button>';
    }).join('');

    return (
        '<div class="chat-header ai-chat-header">' +
            '<div class="ai-header-mark">AI</div>' +
            '<div class="ai-header-copy">' +
                '<h3>SmartDine AI</h3>' +
                '<span>Menu, macros, budget and taste helper</span>' +
            '</div>' +
            '<div class="ai-header-actions">' +
                '<button type="button" class="btn-icon ai-clear-btn" data-action="clear-ai-chat" aria-label="Clear chat">Clear</button>' +
                '<button type="button" class="btn-icon ai-close-btn" data-action="toggle-ai-chat" aria-label="Close">x</button>' +
            '</div>' +
        '</div>' +
        '<div class="ai-chip-row">' + chips + '</div>' +
        '<div class="chat-messages" id="chat-messages">' + getAIIntroMessage() + '</div>' +
        '<div class="chat-input-area">' +
            '<input type="text" id="ai-input" class="form-input" placeholder="Ask about menu, protein, carbs, budget..." autocomplete="off">' +
            '<button class="btn btn-primary ai-send-btn" data-action="send-ai-message">Send</button>' +
        '</div>'
    );
}

function getAIIntroMessage() {
    return (
        '<div class="chat-message bot">' +
            '<div class="chat-avatar">AI</div>' +
            '<div class="chat-bubble">' +
                '<strong>Tell me what you want to eat.</strong><br>' +
                'Say hi, i, i also, recommend something, high protein, high carbs, healthy, spicy veg, biryani under 400, dessert, drinks, or compare two dishes.' +
            '</div>' +
        '</div>'
    );
}

function clearAIChat() {
    var messages = document.getElementById('chat-messages');
    var input = document.getElementById('ai-input');
    if (messages) {
        messages.innerHTML = getAIIntroMessage();
        messages.scrollTop = 0;
    }
    if (input) {
        input.value = '';
        input.focus();
    }
}

function askAI(prompt) {
    var panel = document.getElementById('ai-panel');
    if (!panel) {
        toggleAIChat();
    } else if (!panel.classList.contains('active')) {
        panel.classList.add('active');
    }
    var input = document.getElementById('ai-input');
    if (!input) return;
    input.value = prompt;
    sendAIMessage();
}

function sendAIMessage() {
    var input = document.getElementById('ai-input');
    var messages = document.getElementById('chat-messages');
    if (!input || !messages || !input.value.trim()) return;

    var text = input.value.trim();
    input.value = '';

    var userMsg = document.createElement('div');
    userMsg.className = 'chat-message user';
    userMsg.innerHTML = '<div class="chat-avatar">You</div><div class="chat-bubble">' + escapeHTML(text) + '</div>';
    messages.appendChild(userMsg);
    messages.scrollTop = messages.scrollHeight;

    var typingMsg = document.createElement('div');
    typingMsg.className = 'chat-message bot';
    typingMsg.id = 'typing-indicator';
    typingMsg.innerHTML = '<div class="chat-avatar">AI</div><div class="chat-bubble"><span class="typing-dots"><span></span></span></div>';
    messages.appendChild(typingMsg);
    messages.scrollTop = messages.scrollHeight;

    setTimeout(function() {
        var typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();

        var response = mockAIResponse(text);

        var botMsg = document.createElement('div');
        botMsg.className = 'chat-message bot';
        botMsg.innerHTML = '<div class="chat-avatar">AI</div><div class="chat-bubble">' + formatAIResponse(response) + '</div>';
        messages.appendChild(botMsg);
        messages.scrollTop = messages.scrollHeight;
    }, 450);
}

function mockAIResponse(prompt) {
    return renderAIAnswer(buildAIAnswer(prompt));
}

function buildAIAnswer(prompt) {
    var query = parseAIQuery(prompt);
    var menu = getAIMenuItems();

    if ((query.greeting || query.recommendationStarter) && !hasAIRecommendationCriteria(query)) {
        return {
            title: 'Here are a few dishes to start with.',
            summary: 'I picked popular options from the current menu. Tell me veg, non-veg, spicy, healthy, budget, protein, carbs, dessert, or drinks and I will narrow it down.',
            items: getTopItems(menu, 4),
            note: 'You can ask a follow-up like "spicy veg under 300" or "high protein non-veg".'
        };
    }

    if (query.thanks) {
        return {
            title: 'Happy to help.',
            summary: 'Enjoy your meal. You can ask me for another dish style anytime.',
            items: []
        };
    }

    var mentioned = findMentionedItems(menu, query.text);
    if (query.compare && mentioned.length >= 2) {
        return buildComparisonAnswer(mentioned.slice(0, 2));
    }
    if (mentioned.length === 1 && query.itemSpecific) {
        return buildSingleItemAnswer(mentioned[0]);
    }

    if (query.menuOverview) {
        return buildMenuOverviewAnswer(menu);
    }

    var results = rankMenuItems(menu, query).slice(0, 4);
    if (results.length === 0) {
        results = getTopItems(menu, 4);
        return {
            title: 'I could not find an exact match.',
            summary: 'Here are reliable popular options from the menu instead.',
            items: results,
            note: 'Try asking with a dish, category, budget, spice level, or macro goal.'
        };
    }

    return {
        title: getAnswerTitle(query),
        summary: getAnswerSummary(query, results),
        items: results,
        note: getAnswerNote(query)
    };
}

function getAIMenuItems() {
    var menu = [];
    if (window.APP_MENU && window.APP_MENU.length) {
        menu = window.APP_MENU;
    } else {
        menu = Storage.get('smartdine_menu', []);
    }

    return (menu || []).filter(function(item) {
        return item && item.name && item.available !== false;
    }).map(function(item) {
        var normalized = {
            id: item.id,
            name: item.name || 'Menu item',
            category: item.category || 'Menu',
            price: Number(item.price || item.amount || 0),
            description: item.description || '',
            rating: Number(item.rating || 4.2),
            prepTime: item.prepTime || item.prep_time || '15 min',
            spiceLevel: item.spiceLevel || item.spice_level || 'Mild',
            isVeg: typeof item.isVeg === 'boolean' ? item.isVeg : (typeof item.is_veg === 'boolean' ? item.is_veg : true)
        };
        normalized.ai = classifyMenuItem(normalized);
        return normalized;
    });
}

function parseAIQuery(prompt) {
    var text = String(prompt || '').toLowerCase();
    var normalizedText = text.replace(/\s+/g, ' ').trim();
    var budget = null;
    var budgetMatch = text.match(/(?:under|below|less than|within|max|maximum|upto|up to)\s*(?:rs\.?|inr|₹)?\s*(\d{2,4})/);
    if (!budgetMatch) budgetMatch = text.match(/(?:rs\.?|inr|₹)\s*(\d{2,4})/);
    if (budgetMatch) budget = parseInt(budgetMatch[1], 10);
    if (!budget && /cheap|budget|affordable|low price/.test(text)) budget = 250;

    var category = null;
    var categoryMap = [
        ['biryani', 'Biryani'],
        ['starter', 'Starters'],
        ['snack', 'Starters'],
        ['main course', 'Main Course'],
        ['main', 'Main Course'],
        ['south indian', 'South Indian'],
        ['north indian', 'North Indian'],
        ['chinese', 'Chinese'],
        ['dessert', 'Desserts'],
        ['sweet', 'Desserts'],
        ['beverage', 'Beverages'],
        ['drink', 'Beverages'],
        ['combo', 'Combos'],
        ['healthy', 'Healthy Picks']
    ];
    for (var i = 0; i < categoryMap.length; i++) {
        if (text.indexOf(categoryMap[i][0]) !== -1) {
            category = categoryMap[i][1];
            break;
        }
    }

    return {
        text: text,
        greeting: /\b(hi|hii|hello|hey)\b/.test(text),
        recommendationStarter: /^(i|i also|also|suggest|suggest me|recommend|recommend me|what should i eat|help me choose|hungry|i am hungry|start)$/i.test(normalizedText) || /\b(suggest|recommend)\b/.test(text),
        thanks: /thank|thanks/.test(text),
        menuOverview: /what.*menu|show.*menu|full menu|categories|what do you have/.test(text),
        compare: /compare| vs | versus |difference/.test(text),
        itemSpecific: /price|cost|prep|time|protein|carb|calorie|healthy|spicy|veg|about|tell me|is /.test(text),
        veg: /vegetarian|\bveg\b/.test(text) && !/non[-\s]?veg|chicken|mutton|prawn|egg|fish/.test(text),
        nonVeg: /non[-\s]?veg|chicken|mutton|prawn|egg|fish|meat/.test(text),
        highProtein: /high protein|protein|gym|muscle|bodybuilding/.test(text),
        highCarb: /high carb|carbs|carbohydrate|rice|energy|filling/.test(text),
        lowCarb: /low carb|less carb|no carb/.test(text),
        healthy: /healthy|diet|light|low calorie|calorie|clean|fitness/.test(text),
        spicy: /spicy|hot|extra hot|chilli|chili/.test(text),
        mild: /mild|not spicy|less spicy/.test(text),
        sweet: /sweet|dessert|cake|brownie|ice cream/.test(text),
        drink: /drink|beverage|coffee|lassi|soda|mojito|latte|thirst/.test(text),
        quick: /quick|fast|less time|jaldi|under 10 min|under ten/.test(text),
        budget: budget,
        category: category,
        ingredient: detectIngredient(text)
    };
}

function hasAIRecommendationCriteria(query) {
    return !!(
        query.menuOverview ||
        query.compare ||
        query.itemSpecific ||
        query.veg ||
        query.nonVeg ||
        query.highProtein ||
        query.highCarb ||
        query.lowCarb ||
        query.healthy ||
        query.spicy ||
        query.mild ||
        query.sweet ||
        query.drink ||
        query.quick ||
        query.budget ||
        query.category ||
        query.ingredient
    );
}

function detectIngredient(text) {
    var ingredients = ['paneer', 'chicken', 'mutton', 'prawn', 'egg', 'rice', 'dosa', 'idli', 'naan', 'dal', 'rajma', 'mushroom', 'corn', 'coffee', 'mango', 'oats', 'fruit', 'quinoa', 'avocado', 'pasta', 'noodles', 'sushi'];
    for (var i = 0; i < ingredients.length; i++) {
        if (text.indexOf(ingredients[i]) !== -1) return ingredients[i];
    }
    return null;
}

function classifyMenuItem(item) {
    var name = item.name.toLowerCase();
    var category = item.category.toLowerCase();
    var desc = item.description.toLowerCase();
    var text = name + ' ' + category + ' ' + desc;

    var protein = 'Medium';
    if (/chicken|mutton|prawn|egg|grilled|sushi/.test(text)) protein = 'High';
    if (/paneer|dal|rajma|quinoa|lentil|chickpea|chole|thali/.test(text) && protein !== 'High') protein = 'Medium-High';
    if (/fruit|soda|mojito|naan|rice|noodles|dessert|brownie|cheesecake|gulab|rasmalai|coffee|latte|lassi/.test(text)) protein = protein === 'High' ? protein : 'Low';

    var carbs = 'Medium';
    if (/rice|biryani|dosa|idli|vada|naan|noodles|pasta|toast|bhature|chawal|thali|combo|oats|smoothie|dessert|brownie|cheesecake|gulab|rasmalai/.test(text)) carbs = 'High';
    if (/grilled chicken|tikka|kebab|salad|prawns/.test(text)) carbs = 'Low-Medium';

    var energy = 'Balanced';
    if (/butter|fried|biryani|thali|combo|bhature|brownie|cheesecake|gulab|rasmalai|cream|pasta/.test(text)) energy = 'Rich';
    if (/healthy|salad|grilled|fruit|idli|smoothie|avocado|quinoa|lime/.test(text)) energy = 'Light';

    return {
        protein: protein,
        carbs: carbs,
        energy: energy,
        healthy: category === 'healthy picks' || /healthy|salad|grilled|fruit|oats|avocado|quinoa|idli/.test(text),
        spicy: item.spiceLevel === 'Hot' || item.spiceLevel === 'Extra Hot' || /chilli|spicy|tandoori|rogan/.test(text),
        sweet: category === 'desserts' || /sweet|brownie|cheesecake|gulab|rasmalai|lassi/.test(text),
        drink: category === 'beverages',
        highProtein: protein === 'High' || protein === 'Medium-High',
        highCarb: carbs === 'High',
        lowCarb: carbs === 'Low-Medium',
        quick: parseInt(item.prepTime, 10) <= 10
    };
}

function rankMenuItems(menu, query) {
    var scored = [];

    menu.forEach(function(item) {
        var score = item.rating || 4;
        var haystack = (item.name + ' ' + item.category + ' ' + item.description).toLowerCase();

        if (query.category && item.category === query.category) score += 10;
        if (query.ingredient && haystack.indexOf(query.ingredient) !== -1) score += 12;
        if (query.veg && !item.isVeg) score -= 100;
        if (query.nonVeg && item.isVeg) score -= 100;
        if (query.highProtein) score += item.ai.highProtein ? 14 : -8;
        if (query.highCarb) score += item.ai.highCarb ? 14 : -6;
        if (query.lowCarb) score += item.ai.lowCarb ? 12 : -8;
        if (query.healthy) score += item.ai.healthy || item.ai.energy === 'Light' ? 13 : -5;
        if (query.spicy) score += item.ai.spicy ? 10 : -4;
        if (query.mild) score += item.spiceLevel === 'Mild' ? 9 : -5;
        if (query.sweet) score += item.ai.sweet ? 12 : -8;
        if (query.drink) score += item.ai.drink ? 12 : -8;
        if (query.quick) score += item.ai.quick ? 8 : -3;
        if (query.budget) score += item.price <= query.budget ? 10 : -40;
        if (!query.category && !query.ingredient && !query.highProtein && !query.highCarb && !query.lowCarb && !query.healthy && !query.spicy && !query.sweet && !query.drink && !query.budget) {
            score += item.rating;
        }

        if (score > -20) scored.push({ item: item, score: score });
    });

    return scored.sort(function(a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return b.item.rating - a.item.rating;
    }).map(function(entry) {
        return entry.item;
    });
}

function findMentionedItems(menu, text) {
    var found = [];
    menu.forEach(function(item) {
        var itemName = item.name.toLowerCase();
        if (text.indexOf(itemName) !== -1) {
            found.push(item);
            return;
        }
        var words = itemName.split(/\s+/).filter(function(word) { return word.length > 3; });
        var matchedWords = 0;
        words.forEach(function(word) {
            if (text.indexOf(word) !== -1) matchedWords++;
        });
        if (words.length > 0 && matchedWords === words.length) found.push(item);
    });
    return found;
}

function getTopItems(menu, count) {
    return menu.slice().sort(function(a, b) {
        return b.rating - a.rating;
    }).slice(0, count || 3);
}

function buildSingleItemAnswer(item) {
    return {
        title: item.name,
        summary: escapeHTML(item.description) + ' It costs ' + formatCurrency(item.price) + ' and usually takes ' + escapeHTML(item.prepTime) + '.',
        items: [item],
        note: 'Dish profile: ' + item.ai.protein + ' protein, ' + item.ai.carbs + ' carbs, ' + item.ai.energy.toLowerCase() + ' meal.'
    };
}

function buildComparisonAnswer(items) {
    var first = items[0];
    var second = items[1];
    return {
        title: 'Quick comparison',
        summary: escapeHTML(first.name) + ' is ' + first.ai.protein.toLowerCase() + ' protein and ' + first.ai.carbs.toLowerCase() + ' carbs. ' + escapeHTML(second.name) + ' is ' + second.ai.protein.toLowerCase() + ' protein and ' + second.ai.carbs.toLowerCase() + ' carbs.',
        items: items,
        note: 'For fitness goals, choose the higher-protein option. For a filling energy meal, choose the higher-carb option.'
    };
}

function buildMenuOverviewAnswer(menu) {
    var categories = {};
    menu.forEach(function(item) {
        if (!categories[item.category]) categories[item.category] = [];
        if (categories[item.category].length < 2) categories[item.category].push(item.name);
    });

    var lines = [];
    Object.keys(categories).sort().forEach(function(category) {
        lines.push('<div class="ai-menu-line"><strong>' + escapeHTML(category) + '</strong><span>' + categories[category].map(escapeHTML).join(', ') + '</span></div>');
    });

    return {
        title: 'Menu overview',
        summary: lines.join(''),
        items: getTopItems(menu, 3),
        note: 'Ask for a category, budget, taste, or macro goal and I will narrow it down.'
    };
}

function getAnswerTitle(query) {
    if (query.highProtein) return 'Best high-protein picks';
    if (query.highCarb) return 'Best high-carb energy meals';
    if (query.lowCarb) return 'Lower-carb menu picks';
    if (query.healthy) return 'Healthier menu picks';
    if (query.spicy) return 'Spicy recommendations';
    if (query.sweet) return 'Dessert recommendations';
    if (query.drink) return 'Drink recommendations';
    if (query.budget) return 'Best picks under ' + formatCurrency(query.budget);
    if (query.category) return query.category + ' recommendations';
    return 'Recommended from the menu';
}

function getAnswerSummary(query, results) {
    var parts = [];
    if (query.veg) parts.push('vegetarian');
    if (query.nonVeg) parts.push('non-veg');
    if (query.highProtein) parts.push('higher protein');
    if (query.highCarb) parts.push('higher carb');
    if (query.lowCarb) parts.push('lower carb');
    if (query.healthy) parts.push('lighter/healthier');
    if (query.spicy) parts.push('spicy');
    if (query.mild) parts.push('mild');
    if (query.budget) parts.push('within ' + formatCurrency(query.budget));

    if (parts.length === 0) {
        return 'These are strong choices based on rating, category fit, and menu details.';
    }
    return 'I filtered the menu for ' + parts.join(', ') + ' choices and found ' + results.length + ' good match' + (results.length === 1 ? '' : 'es') + '.';
}

function getAnswerNote(query) {
    if (query.highProtein || query.highCarb || query.lowCarb || query.healthy) {
        return '';
    }
    if (query.budget) {
        return 'Prices are pulled from the current menu data.';
    }
    return '';
}

function renderAIAnswer(answer) {
    var html = '<div class="ai-answer">';
    html += '<div class="ai-answer-title">' + escapeHTML(answer.title) + '</div>';
    html += '<div class="ai-answer-summary">' + answer.summary + '</div>';

    if (answer.items && answer.items.length) {
        html += '<div class="ai-reco-list">';
        answer.items.forEach(function(item) {
            html += renderAIItemCard(item);
        });
        html += '</div>';
    }

    if (answer.note) {
        html += '<div class="ai-answer-note">' + escapeHTML(answer.note) + '</div>';
    }
    html += '</div>';
    return html;
}

function renderAIItemCard(item) {
    var badges = [
        item.isVeg ? 'Veg' : 'Non-veg',
        item.ai.protein + ' protein',
        item.ai.carbs + ' carbs',
        item.spiceLevel
    ];

    return (
        '<div class="ai-reco-card">' +
            '<div class="ai-reco-main">' +
                '<strong>' + escapeHTML(item.name) + '</strong>' +
                '<span>' + escapeHTML(item.category) + ' - ' + formatCurrency(item.price) + ' - ' + escapeHTML(item.prepTime) + '</span>' +
                '<p>' + escapeHTML(item.description) + '</p>' +
                '<div class="ai-badge-row">' + badges.map(function(label) {
                    return '<small>' + escapeHTML(label) + '</small>';
                }).join('') + '</div>' +
            '</div>' +
            '<button class="btn btn-primary btn-sm ai-add-btn" onclick="addToCart(' + item.id + ', {quantity:1, portion:\'Regular\', spiceLevel:\'Medium\', addOns:[], specialInstructions:\'AI Recommendation\'})">Add</button>' +
        '</div>'
    );
}

function formatAIResponse(text) {
    return text;
}

function escapeRegExp(string) {
    return String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

window.askAI = askAI;
window.clearAIChat = clearAIChat;
