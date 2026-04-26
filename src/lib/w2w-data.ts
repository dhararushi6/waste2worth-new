// Mock data for Waste2Worth prototype

export const user = {
  name: "Aarav",
  hostel: "Tagore Hostel",
  department: "CSE",
  coins: 1240,
  studentId: "21CS1042",
  streak: 12,
  totalKg: 24.6,
  co2Saved: 38.4,
  trees: 3,
};

export const scrapRates = [
  { type: "Plastic", rate: 20, unit: "kg" },
  { type: "Paper", rate: 10, unit: "kg" },
  { type: "Glass", rate: 5, unit: "kg" },
  { type: "Metal", rate: 50, unit: "kg" },
  { type: "E-waste", rate: 40, unit: "kg" },
];

export const recentActivity = [
  { id: 1, title: "Mobile Phone scan", subtitle: "E-waste · 0.18 kg", coins: 72, when: "2h ago" },
  { id: 2, title: "Plastic bottles deposit", subtitle: "Kiosk · Block C", coins: 24, when: "Yesterday" },
  { id: 3, title: "Paper bundle pickup", subtitle: "Hostel · 1.2 kg", coins: 12, when: "2 days ago" },
];

export const kiosks = [
  { id: "k1", name: "Block C Smart Kiosk", distance: "120 m", fill: 42, hours: "6am – 11pm", types: ["Plastic", "Paper", "E-waste"], x: 35, y: 40 },
  { id: "k2", name: "Library Kiosk", distance: "340 m", fill: 78, hours: "24/7", types: ["Paper", "Plastic"], x: 60, y: 25 },
  { id: "k3", name: "Canteen Kiosk", distance: "510 m", fill: 18, hours: "7am – 10pm", types: ["Glass", "Metal", "Plastic"], x: 70, y: 60 },
  { id: "k4", name: "Gate 2 Mega Kiosk", distance: "780 m", fill: 55, hours: "24/7", types: ["E-waste", "Metal", "Plastic", "Paper"], x: 25, y: 70 },
];

export const rewardCategories = [
  { id: "experiences", label: "Eco-Experiences ✨" },
  { id: "vouchers", label: "Vouchers" },
  { id: "recharge", label: "Recharge & Bills" },
  { id: "subs", label: "Subscriptions" },
  { id: "travel", label: "Travel & Rides" },
  { id: "swag", label: "Eco Swag" },
  { id: "donate", label: "Donate" },
  { id: "mystery", label: "Mystery Box" },
];

export const rewards = [
  // ✨ Eco-Experiences — adventures unlocked by recycling
  { id: 1001, cat: "experiences", name: "Sunrise Trek to Nandi Hills", cost: 1800, emoji: "🌄", tag: "ADVENTURE" },
  { id: 1002, cat: "experiences", name: "Sunburn Festival Pass", cost: 4500, emoji: "🎵", tag: "LEGENDARY" },
  { id: 1003, cat: "experiences", name: "Skydiving 20% Off", cost: 2200, emoji: "🪂", tag: "RUSH" },
  { id: 1004, cat: "experiences", name: "Scuba Dive in Goa", cost: 3000, emoji: "🤿", tag: "OCEAN" },
  { id: 1005, cat: "experiences", name: "AR Campus Treasure Hunt", cost: 400, emoji: "🗺️", tag: "EXCLUSIVE" },
  { id: 1006, cat: "experiences", name: "Offset 1 Domestic Flight", cost: 1500, emoji: "✈️", tag: "PLANET+" },
  { id: 1007, cat: "experiences", name: "Coffee with a Startup Founder", cost: 1200, emoji: "☕", tag: "MENTOR" },
  { id: 1008, cat: "experiences", name: "Stargazing Night at Coorg", cost: 2500, emoji: "🔭", tag: "DREAMY" },
  { id: 1009, cat: "experiences", name: "Pottery Workshop", cost: 700, emoji: "🏺", tag: "CHILL" },
  { id: 1010, cat: "experiences", name: "Esports Tournament Slot", cost: 900, emoji: "🎮", tag: "COMPETE" },
  // Vouchers
  { id: 101, cat: "vouchers", name: "Amazon ₹100 Voucher", cost: 950, emoji: "🛒" },
  { id: 102, cat: "vouchers", name: "Flipkart ₹50 Voucher", cost: 480, emoji: "🛍️" },
  { id: 103, cat: "vouchers", name: "Zomato ₹75 Off", cost: 720, emoji: "🍔" },
  { id: 104, cat: "vouchers", name: "Swiggy ₹50 Off", cost: 480, emoji: "🥡" },
  { id: 105, cat: "vouchers", name: "BookMyShow ₹150", cost: 1400, emoji: "🎬" },
  // Recharge & Bills
  { id: 3, cat: "recharge", name: "₹20 Mobile Recharge", cost: 200, emoji: "📱" },
  { id: 4, cat: "recharge", name: "₹50 Recharge", cost: 480, emoji: "💸" },
  { id: 201, cat: "recharge", name: "₹100 Data Pack", cost: 950, emoji: "📶" },
  { id: 202, cat: "recharge", name: "Electricity Bill ₹200", cost: 1900, emoji: "💡" },
  // Subscriptions
  { id: 301, cat: "subs", name: "Spotify 1-Month", cost: 1100, emoji: "🎧" },
  { id: 302, cat: "subs", name: "Netflix Mobile 1-Month", cost: 1400, emoji: "🎞️" },
  { id: 303, cat: "subs", name: "JioCinema Premium", cost: 800, emoji: "📺" },
  { id: 304, cat: "subs", name: "Audible 1-Month", cost: 1200, emoji: "🎙️" },
  // Travel & Rides
  { id: 501, cat: "travel", name: "Uber ₹100 Voucher", cost: 950, emoji: "🚗" },
  { id: 502, cat: "travel", name: "Rapido 5 Free Rides", cost: 1100, emoji: "🛵" },
  { id: 503, cat: "travel", name: "Yulu Bike 1-Hour", cost: 140, emoji: "🚲" },
  { id: 504, cat: "travel", name: "Metro Smart Card ₹50", cost: 480, emoji: "🚇" },
  // Eco Swag
  { id: 7, cat: "swag", name: "Eco Tote Bag", cost: 350, emoji: "👜" },
  { id: 8, cat: "swag", name: "Bamboo Bottle", cost: 600, emoji: "🍶" },
  { id: 601, cat: "swag", name: "Recycled Notebook", cost: 280, emoji: "📓" },
  { id: 602, cat: "swag", name: "Plantable Pen Set", cost: 320, emoji: "🖊️" },
  { id: 603, cat: "swag", name: "W2W Hoodie", cost: 2200, emoji: "🧥" },
  // Donate (give back)
  { id: 701, cat: "donate", name: "Plant a Tree", cost: 200, emoji: "🌳" },
  { id: 702, cat: "donate", name: "Sponsor a School Kit", cost: 600, emoji: "🎒" },
  { id: 703, cat: "donate", name: "Feed a Stray (1 week)", cost: 350, emoji: "🐶" },
  { id: 704, cat: "donate", name: "Clean a Beach (m²)", cost: 150, emoji: "🏖️" },
  // Mystery
  { id: 9, cat: "mystery", name: "Mystery Box", cost: 250, emoji: "🎁" },
  { id: 801, cat: "mystery", name: "Premium Mystery Box", cost: 800, emoji: "📦" },
  { id: 802, cat: "mystery", name: "Legendary Drop", cost: 2500, emoji: "💎" },
];

export const challenges = {
  title: "Hostel League",
  body: "Your hostel is #2 — recycle 5 kg more to win!",
  progress: 64,
};

export const workshops = [
  { id: 1, title: "Trash to Treasure", date: "May 04", time: "4:00 PM", location: "Open Air Theatre", tag: "Workshop" },
  { id: 2, title: "Repair Cafe", date: "May 11", time: "11:00 AM", location: "Maker Lab", tag: "Hands-on" },
  { id: 3, title: "Swachh Campus Challenge", date: "May 18", time: "9:00 AM", location: "Main Quad", tag: "Challenge" },
];

export const pastWorkshops = [
  { id: 1, title: "E-waste 101", date: "Mar 12", certificate: true },
  { id: 2, title: "Compost Crew", date: "Feb 22", certificate: true },
];

export const badges = [
  { id: 1, name: "Eco Warrior I", emoji: "🌱", earned: true },
  { id: 2, name: "Eco Warrior II", emoji: "🌿", earned: true },
  { id: 3, name: "Eco Warrior III", emoji: "🌳", earned: false },
  { id: 4, name: "Mentor", emoji: "🧑‍🏫", earned: true },
  { id: 5, name: "Workshop Pro", emoji: "🛠️", earned: true },
  { id: 6, name: "Streak 30", emoji: "🔥", earned: false },
];

export const leaderboardHostels = [
  { name: "Nehru Hostel", kg: 312 },
  { name: "Tagore Hostel", kg: 284 },
  { name: "Bose Hostel", kg: 251 },
  { name: "Raman Hostel", kg: 198 },
];

export const leaderboardDepts = [
  { name: "Mechanical", kg: 540 },
  { name: "CSE", kg: 488 },
  { name: "ECE", kg: 412 },
  { name: "Civil", kg: 380 },
];
