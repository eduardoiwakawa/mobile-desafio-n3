/* eslint-disable array-callback-return */
/* eslint-disable @typescript-eslint/no-use-before-define */
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

interface Clean {
  id: number;
  isClean: boolean;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [itemRemove, setitemRemove] = useState<Clean[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      setProducts(
        products.map(item =>
          !item.quantity ? { ...item, quantity: 0 } : item,
        ),
      );
      console.log('paaaaroducts', products);
      const storagedProducts = await AsyncStorage.getItem(
        '@GoMarketPlace:products',
      );
      if (storagedProducts) {
        setProducts([...JSON.parse(storagedProducts)]);
      }
    }
    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productExist = products.find(item => item.id === product.id);

      if (productExist) {
        setProducts(
          products.map(item =>
            item.id === product.id
              ? { ...product, quantity: item.quantity + 1 }
              : item,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }
      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(product),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const addProduct = products.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      );
      setProducts(addProduct);

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(addProduct),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const addProduct = products.map(item =>
        item.id === id && item.quantity > 0
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      );

      setProducts(addProduct);

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(addProduct),
      );
      handleCleanCart();
    },
    [products],
  );

  function handleCleanCart(): void {
    products.map(item => {
      if (item.quantity === 0) {
        setProducts(products.filter(item2 => item2.id !== item.id));
      }
    });
  }

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
