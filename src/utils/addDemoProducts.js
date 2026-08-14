import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const demoProducts = [
  {
    name: "Rose Silk Gown",
    description: "Elegant silk evening gown with delicate embroidery. Perfect for weddings, parties, and special occasions. Made with premium quality silk fabric that drapes beautifully.",
    price: 4999,
    oldPrice: 6999,
    rating: 4.8,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600",
    category: "Evening Wear"
  },
  {
    name: "Floral Summer Dress",
    description: "Lightweight cotton dress perfect for sunny days. Breathable fabric with beautiful floral prints. Ideal for casual outings and beach vacations.",
    price: 1899,
    oldPrice: 2499,
    rating: 4.6,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600",
    category: "Casual"
  },
  {
    name: "Royal Velvet Gown",
    description: "Luxurious velvet gown for special occasions. Rich texture with elegant silhouette. A statement piece for grand celebrations and evening events.",
    price: 7499,
    oldPrice: 9999,
    rating: 4.9,
    reviews: 201,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600",
    category: "Evening Wear"
  },
  {
    name: "Boho Maxi Dress",
    description: "Free-spirited bohemian maxi with floral prints. Flowy silhouette with comfortable fit. Perfect for festivals and casual gatherings.",
    price: 2499,
    oldPrice: 3299,
    rating: 4.5,
    reviews: 67,
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600",
    category: "Casual"
  },
  {
    name: "Classic Little Black Dress",
    description: "Timeless LBD — a wardrobe essential. Versatile design that works for any occasion. Elegant and sophisticated with a flattering cut.",
    price: 3299,
    oldPrice: 4499,
    rating: 4.7,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600",
    category: "Party Wear"
  },
  {
    name: "Pastel Party Dress",
    description: "Chic pastel dress for parties and celebrations. Soft colors with modern design. Perfect for birthdays, anniversaries, and cocktail events.",
    price: 2799,
    oldPrice: 3599,
    rating: 4.4,
    reviews: 43,
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600",
    category: "Party Wear"
  },
  {
    name: "Bridal Lehenga Set",
    description: "Exquisite bridal lehenga with heavy work. Hand-embroidered details with premium fabric. A dream outfit for your special day.",
    price: 14999,
    oldPrice: 19999,
    rating: 5.0,
    reviews: 78,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600",
    category: "Bridal"
  },
  {
    name: "Casual Shirt Dress",
    description: "Comfortable shirt dress for everyday wear. Classic design with modern touches. Perfect for office, college, and casual outings.",
    price: 1599,
    oldPrice: 2199,
    rating: 4.3,
    reviews: 92,
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600",
    category: "Casual"
  }
];

export async function addDemoProductsToFirestore() {
  try {
    const batchPromises = demoProducts.map(product => 
      addDoc(collection(db, 'products'), product)
    );
    await Promise.all(batchPromises);
    console.log('✅ Demo products added successfully!');
    return true;
  } catch (error) {
    console.error('Error adding demo products:', error);
    return false;
  }
}