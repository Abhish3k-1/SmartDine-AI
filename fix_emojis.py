import re

def replace_emojis(text):
    # Specific replacements
    text = text.replace('🟢 Veg', '<span class="veg-dot"></span> Veg')
    text = text.replace('🔴 Non-Veg', '<span class="nonveg-dot"></span> Non-Veg')
    text = text.replace('🟢', '<span class="veg-dot"></span>')
    text = text.replace('🔴', '<span class="nonveg-dot"></span>')
    text = text.replace('⭐', '★')
    
    # Emojis to remove completely or replace with standard text
    emojis_to_remove = ['🍽️', '💡', '📱', '🤖', '📍', '📊', '📦', '📶', '📷', '📋', '🔥', '🌶️', '💰', '👨‍🍳', '🔒', '⏱️', '📂', '📏', '🧩', '📝', '🛒', '✅', '🛎️', '🔍']
    for e in emojis_to_remove:
        text = text.replace(e + ' ', '')
        text = text.replace(' ' + e, '')
        text = text.replace(e, '')
        
    return text

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if filepath == 'js/customer.js':
        # Fix filter logic
        content = content.replace('if (menuFilters.spicy && !item.isSpicy) return false;', 'if (menuFilters.spicy && item.spiceLevel !== \'Hot\' && item.spiceLevel !== \'Extra Hot\') return false;')

        bestseller_logic = '''if (menuFilters.bestseller) {
      var en = getEnrichment(item.id);
      if (en.tags.indexOf('bestseller') === -1) return false;
    }'''

        bestseller_fixed = '''if (menuFilters.bestseller) {
      var tags = item.tags || [];
      var enTags = getEnrichment(item.id).tags || [];
      if (tags.indexOf('bestseller') === -1 && enTags.indexOf('bestseller') === -1) return false;
    }'''

        content = content.replace(bestseller_logic, bestseller_fixed)

    content = replace_emojis(content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

process_file('js/customer.js')
process_file('js/auth.js')
process_file('index.html')

print('Updated files successfully.')
