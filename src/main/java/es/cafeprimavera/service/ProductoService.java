package es.cafeprimavera.service;

import es.cafeprimavera.model.Producto;
import es.cafeprimavera.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public List<Producto> findAll() {
        return productoRepository.findAll();
    }

    public List<Producto> findActivos() {
        return productoRepository.findByActivoTrue();
    }

    public List<Producto> findByCategoria(Integer categoriaId) {
        return productoRepository.findByCategoria_Id(categoriaId);
    }

    public Optional<Producto> findById(Integer id) {
        return productoRepository.findById(id);
    }

    public Producto save(Producto producto) {
        return productoRepository.save(producto);
    }

    public void deleteById(Integer id) {
        productoRepository.deleteById(id);
    }

    public Producto actualizarStock(Integer id, Integer cantidad) {
        Producto producto = productoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        producto.setStock(producto.getStock() + cantidad);
        return productoRepository.save(producto);
    }
}