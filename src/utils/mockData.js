// src/utils/mockData.js

export const PRODUCTS = [
  { 
    id: 1, 
    name: "Luxury Parfum 1", 
    brand: "Chanel", 
    price: 99, 
    size: "50ml", 
    category: "Women",
    notes: ["Fresh", "Citrus", "Woody"], 
    available: true,
    description: "A timeless fragrance with citrus top notes and a woody base."
  },
  { 
    id: 2, 
    name: "Luxury Parfum 2", 
    brand: "Dior", 
    price: 109, 
    size: "50ml", 
    category: "Men",
    notes: ["Floral", "Sweet", "Musk"], 
    available: true,
    description: "Sophisticated blend of floral and musk notes."
  },
  { 
    id: 3, 
    name: "Luxury Parfum 3", 
    brand: "Tom Ford", 
    price: 119, 
    size: "50ml", 
    category: "Unisex",
    notes: ["Oriental", "Spicy", "Amber"], 
    available: false,
    description: "Bold oriental fragrance with spicy undertones."
  },
  { 
    id: 4, 
    name: "Luxury Parfum 4", 
    brand: "Versace", 
    price: 129, 
    size: "50ml", 
    category: "Women",
    notes: ["Aquatic", "Fresh", "Clean"], 
    available: true,
    description: "Fresh aquatic scent perfect for everyday wear."
  },
  { 
    id: 5, 
    name: "Luxury Parfum 5", 
    brand: "Chanel", 
    price: 139, 
    size: "50ml", 
    category: "Men",
    notes: ["Woody", "Leather", "Smoky"], 
    available: true,
    description: "Masculine woody leather with smoky finish."
  },
  { 
    id: 6, 
    name: "Luxury Parfum 6", 
    brand: "Dior", 
    price: 149, 
    size: "50ml", 
    category: "Unisex",
    notes: ["Fruity", "Sweet", "Vanilla"], 
    available: true,
    description: "Sweet fruity fragrance with vanilla warmth."
  },
  { 
    id: 7, 
    name: "Luxury Parfum 7", 
    brand: "Tom Ford", 
    price: 159, 
    size: "50ml", 
    category: "Women",
    notes: ["Green", "Herbal", "Fresh"], 
    available: true,
    description: "Crisp green herbal scent for the modern woman."
  },
  { 
    id: 8, 
    name: "Luxury Parfum 8", 
    brand: "Versace", 
    price: 169, 
    size: "50ml", 
    category: "Men",
    notes: ["Gourmand", "Sweet", "Coffee"], 
    available: false,
    description: "Indulgent gourmand fragrance with coffee notes."
  },
  { 
    id: 9, 
    name: "Luxury Parfum 9", 
    brand: "Chanel", 
    price: 179, 
    size: "50ml", 
    category: "Unisex",
    notes: ["Chypre", "Mossy", "Citrus"], 
    available: true,
    description: "Classic chypre with mossy and citrus notes."
  }
];

export const MOCK_MESSAGES = [
  {
    id: 1,
    text: "Hello! Welcome to KL Scents PH. How can I help you today? 👋",
    sender: 'bot',
    timestamp: '10:30 AM'
  },
  {
    id: 2,
    text: "Hi! I'm interested in purchasing Luxury Parfum 1. Is it still available?",
    sender: 'user',
    timestamp: '10:32 AM'
  },
  {
    id: 3,
    text: "Yes, it's available! It's a wonderful choice. The price is ₱99. Would you like to know about payment and delivery options? 🧴✨",
    sender: 'bot',
    timestamp: '10:33 AM'
  },
  {
    id: 4,
    text: "Yes please! What payment methods do you accept?",
    sender: 'user',
    timestamp: '10:34 AM'
  },
  {
    id: 5,
    text: "We accept GCash, bank transfer, and cash on delivery for Metro Manila. Shipping takes 2-3 business days. I'll send you the payment details! 📦💜",
    sender: 'bot',
    timestamp: '10:35 AM'
  }
];

export const APP_ROUTES = [
  { id: 'welcome', name: 'Welcome/About', hideNav: false },
  { id: 'login', name: 'Login', hideNav: false },
  { id: 'products', name: 'Products', hideNav: false },
  { id: 'cart', name: 'Cart', hideNav: false },
  { id: 'messages', name: 'Messages', hideNav: false },
  { id: 'admin', name: 'Admin Dashboard', hideNav: true }
];

export const BRANDS = ["Chanel", "Dior", "Tom Ford", "Versace"];
export const CATEGORIES = ["Women", "Men", "Unisex"];