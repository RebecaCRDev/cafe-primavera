package es.cafeprimavera.service;

import es.cafeprimavera.model.Empleado;
import es.cafeprimavera.model.MovimientoStock;
import es.cafeprimavera.model.Producto;
import es.cafeprimavera.repository.MovimientoStockRepository;
import es.cafeprimavera.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final MovimientoStockRepository movimientoStockRepository;

    public ProductoService(ProductoRepository productoRepository,
                           MovimientoStockRepository movimientoStockRepository) {
        this.productoRepository = productoRepository;
        this.movimientoStockRepository = movimientoStockRepository;
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

    public Producto gestionarStock(Integer productoId, String tipo, Integer cantidad, String motivo, Integer empleadoId) {
        Producto producto = productoRepository.findById(productoId)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        int stockAnterior = producto.getStock();
        int nuevoStock;

        switch (tipo) {
            case "COMPRA":
                nuevoStock = stockAnterior + cantidad;
                break;
            case "AJUSTE":
                nuevoStock = cantidad;
                break;
            case "BAJA":
                nuevoStock = Math.max(0, stockAnterior - cantidad);
                break;
            default:
                throw new RuntimeException("Tipo de movimiento no válido");
        }

        producto.setStock(nuevoStock);
        productoRepository.save(producto);

        MovimientoStock movimiento = new MovimientoStock();
        movimiento.setProducto(producto);
        movimiento.setTipo(tipo);
        movimiento.setCantidad(tipo.equals("AJUSTE") ? nuevoStock - stockAnterior : cantidad);
        movimiento.setMotivo(motivo);
        Empleado empleado = new Empleado();
        empleado.setId(empleadoId);
        movimiento.setEmpleado(empleado);
        movimientoStockRepository.save(movimiento);

        return producto;
    }
}