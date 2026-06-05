package es.cafeprimavera.service;

import es.cafeprimavera.model.Mesa;
import es.cafeprimavera.model.Pedido;
import es.cafeprimavera.model.LineaPedido;
import es.cafeprimavera.repository.MesaRepository;
import es.cafeprimavera.repository.PedidoRepository;
import es.cafeprimavera.repository.LineaPedidoRepository;
import es.cafeprimavera.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final LineaPedidoRepository lineaPedidoRepository;
    private final MesaRepository mesaRepository;
    private final ProductoRepository productoRepository;

    public PedidoService(PedidoRepository pedidoRepository,
                         LineaPedidoRepository lineaPedidoRepository,
                         MesaRepository mesaRepository,
                         ProductoRepository productoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.lineaPedidoRepository = lineaPedidoRepository;
        this.mesaRepository = mesaRepository;
        this.productoRepository = productoRepository;
    }

    public List<Pedido> findAll() {
        return pedidoRepository.findAll();
    }

    public Optional<Pedido> findById(Integer id) {
        return pedidoRepository.findById(id);
    }

    public List<Pedido> findByCliente(Integer clienteId) {
        return pedidoRepository.findByCliente_Id(clienteId);
    }

    public List<Pedido> findByEstado(String estado) {
        return pedidoRepository.findByEstado(estado);
    }

    public Optional<Pedido> findByMesaAndEstado(Integer mesaId, String estado) {
        return pedidoRepository.findByMesa_IdAndEstado(mesaId, estado);
    }

    public Pedido save(Pedido pedido) {
        return pedidoRepository.save(pedido);
    }

    public List<LineaPedido> findLineasByPedido(Integer pedidoId) {
        return lineaPedidoRepository.findByPedido_Id(pedidoId);
    }

    public LineaPedido saveLinea(LineaPedido linea) {
        return lineaPedidoRepository.save(linea);
    }

    public Pedido cerrarPedido(Integer id, String metodoPago) {
        Pedido pedido = pedidoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        if ("PAGADO".equals(pedido.getEstado())) {
            return pedido;
        }

        List<LineaPedido> lineas = lineaPedidoRepository.findByPedido_Id(id);
        double total = lineas.stream()
            .mapToDouble(l -> l.getPrecioUnitario() * l.getCantidad())
            .sum();

        // Descontar stock de cada producto vendido
        lineas.forEach(l -> {
            if (l.getProducto() != null) {
                productoRepository.findById(l.getProducto().getId()).ifPresent(producto -> {
                    int nuevoStock = Math.max(0, producto.getStock() - l.getCantidad());
                    producto.setStock(nuevoStock);
                    productoRepository.save(producto);
                });
            }
        });

        pedido.setTotal(total);
        pedido.setMetodoPago(metodoPago);
        pedido.setEstado("PAGADO");

        if (pedido.getMesa() != null) {
            Mesa mesa = pedido.getMesa();
            mesa.setEstado("LIBRE");
            mesaRepository.save(mesa);
        }

        return pedidoRepository.save(pedido);
    }

    public Pedido cancelarPedido(Integer id, String motivo) {
        Pedido pedido = pedidoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        if ("PAGADO".equals(pedido.getEstado())) {
            throw new RuntimeException("No se puede cancelar un pedido ya pagado");
        }

        List<LineaPedido> lineas = lineaPedidoRepository.findByPedido_Id(id);
        double total = lineas.stream()
            .mapToDouble(l -> l.getPrecioUnitario() * l.getCantidad())
            .sum();
        pedido.setTotal(total);
        pedido.setEstado("CANCELADO");
        pedido.setMotivoCancelacion(motivo);

        if (pedido.getMesa() != null) {
            Mesa mesa = pedido.getMesa();
            mesa.setEstado("LIBRE");
            mesaRepository.save(mesa);
        }

        return pedidoRepository.save(pedido);
    }

    public List<Pedido> findByFecha(java.time.LocalDate fecha) {
        java.time.LocalDateTime inicio = fecha.atStartOfDay();
        java.time.LocalDateTime fin = fecha.atTime(23, 59, 59);
        return pedidoRepository.findAll().stream()
            .filter(p -> {
                java.time.LocalDateTime f = p.getFecha();
                return f != null && !f.isBefore(inicio) && !f.isAfter(fin);
            }).toList();
    }

    public void deleteLinea(Integer id) {
        lineaPedidoRepository.deleteById(id);
    }
}