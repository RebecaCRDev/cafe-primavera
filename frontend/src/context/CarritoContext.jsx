import { createContext, useContext, useState, useEffect } from "react";

const CarritoContext = createContext();

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem("carrito");
    return guardado ? JSON.parse(guardado) : [];
  });

  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  const añadirAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.producto.id === producto.id);
      if (existe) {
        return prev.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  };

  const quitarDelCarrito = (productoId) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.producto.id === productoId);
      if (existe.cantidad === 1) {
        return prev.filter((item) => item.producto.id !== productoId);
      }
      return prev.map((item) =>
        item.producto.id === productoId
          ? { ...item, cantidad: item.cantidad - 1 }
          : item,
      );
    });
  };

  const vaciarCarrito = () => {
    setCarrito([]);
    localStorage.removeItem("carrito");
  };

  const total = carrito.reduce(
    (sum, item) => sum + item.producto.precio * item.cantidad,
    0,
  );

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        añadirAlCarrito,
        quitarDelCarrito,
        vaciarCarrito,
        total,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  return useContext(CarritoContext);
}
