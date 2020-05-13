import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const localStorage = '@GoMarketplace:products';

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsFromStorage = await AsyncStorage.getItem(localStorage);

      if (productsFromStorage) {
        const orderedProducts = [...JSON.parse(productsFromStorage)].sort(
          (a, b) => {
            if (a.title > b.title) {
              return 1;
            }
            return a.title < b.title ? -1 : 0;
          },
        );

        setProducts(orderedProducts);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    const productOnCart = products.find(prod => prod.id === product.id);
    const newProductQuantity = productOnCart ? product.quantity + 1 : 1;
    const newProductData = { ...product, quantity: newProductQuantity };

    if (productOnCart) {
      setProducts(
        products
          .map(prod => (prod.id === product.id ? newProductData : prod))
          .sort((a, b) => {
            if (a.title > b.title) {
              return 1;
            }
            return a.title < b.title ? -1 : 0;
          }),
      );
    } else {
      setProducts(
        [...products, product].sort((a, b) => {
          if (a.title > b.title) {
            return 1;
          }
          return a.title < b.title ? -1 : 0;
        }),
      );
    }

    setProducts([...products, product]);
    await AsyncStorage.setItem(localStorage, JSON.stringify(products));
  }, []);

  const increment = useCallback(async id => {
    // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
  }, []);

  const decrement = useCallback(async id => {
    // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
  }, []);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
