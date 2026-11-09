(function () {
    const KEYS = {
        cart: "foodklect_cart",
        favourites: "foodklect_favourites",
        menu: "foodklect_menu",
        users: "foodklect_users",
        currentUser: "foodklect_current_user",
        orders: "foodklect_orders",
        admin: "foodklect_admin_session"
    };

    const DEFAULT_MENU = [
        { id: "classic-cheese-burger", name: "Classic Cheese Burger", category: "snacks", price: 99, description: "Juicy burger with cheese and fresh vegetables.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80", available: true },
        { id: "cheese-pizza", name: "Cheese Pizza", category: "snacks", price: 149, description: "Freshly baked pizza loaded with melted cheese.", image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=600&q=80", available: true },
        { id: "crispy-french-fries", name: "Crispy French Fries", category: "snacks", price: 79, description: "Golden crispy fries served with tasty dip.", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80", available: true },
        { id: "veg-momos", name: "Veg Momos", category: "snacks", price: 89, description: "Soft steamed momos served with spicy chutney.", image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80", available: true },
        { id: "veg-fried-rice", name: "Veg Fried Rice", category: "meals", price: 129, description: "Delicious rice tossed with fresh vegetables.", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80", available: true },
        { id: "veg-noodles", name: "Veg Noodles", category: "meals", price: 89, description: "Hot and tasty noodles with fresh vegetables.", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80", available: true },
        { id: "special-veg-thali", name: "Special Veg Thali", category: "meals", price: 159, description: "Complete Indian meal with rice, roti and curry.", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80", available: true },
        { id: "paneer-masala", name: "Paneer Masala", category: "meals", price: 139, description: "Rich and creamy paneer curry with Indian spices.", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80", available: false },
        { id: "chocolate-shake", name: "Chocolate Shake", category: "beverages", price: 79, description: "Rich and creamy chocolate milkshake.", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80", available: true },
        { id: "cold-coffee", name: "Cold Coffee", category: "beverages", price: 89, description: "Chilled coffee with a smooth creamy taste.", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80", available: true },
        { id: "chocolate-brownie", name: "Chocolate Brownie", category: "desserts", price: 99, description: "Soft chocolate brownie with a rich flavour.", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80", available: true },
        { id: "vanilla-ice-cream", name: "Vanilla Ice Cream", category: "desserts", price: 69, description: "Classic creamy vanilla ice cream.", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80", available: true }
    ];

    function read(key, fallback) {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return value === null ? fallback : value;
        } catch (error) {
            console.error("Could not read Foodklect data:", error);
            return fallback;
        }
    }

    function write(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error("Could not save Foodklect data:", error);
            return false;
        }
    }

    function getMenu() {
        const menu = read(KEYS.menu, null);
        if (Array.isArray(menu)) return menu;
        write(KEYS.menu, DEFAULT_MENU);
        return DEFAULT_MENU.slice();
    }

    function readArray(key) {
        const value = read(key, []);
        return Array.isArray(value) ? value : [];
    }

    window.FoodklectStorage = {
        keys: KEYS,
        read,
        write,
        getCart: () => readArray(KEYS.cart),
        saveCart: cart => write(KEYS.cart, cart),
        getFavourites: () => readArray(KEYS.favourites),
        saveFavourites: favourites => write(KEYS.favourites, favourites),
        getMenu,
        getCategoryImage: category => {
            const item = DEFAULT_MENU.find(entry => entry.category === category);
            return item ? item.image : "";
        },
        saveMenu: menu => write(KEYS.menu, menu),
        getUsers: () => readArray(KEYS.users),
        saveUsers: users => write(KEYS.users, users),
        getCurrentUser: () => read(KEYS.currentUser, null),
        saveCurrentUser: user => write(KEYS.currentUser, user),
        clearCurrentUser: () => localStorage.removeItem(KEYS.currentUser),
        getOrders: () => readArray(KEYS.orders),
        saveOrders: orders => write(KEYS.orders, orders),
        getCurrentUserOrders: function () {
            const user = this.getCurrentUser();
            return user ? this.getOrders().filter(order => String(order.userId) === String(user.id)) : [];
        },
        formatPrice: amount => `₹${Number(amount || 0).toFixed(2)}`
    };
})();
