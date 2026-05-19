package es.cafeprimavera.service;

import es.cafeprimavera.model.Mesa;
import es.cafeprimavera.model.Pedido;
import es.cafeprimavera.model.LineaPedido;
import es.cafeprimavera.repository.MesaRepository;
import es.cafeprimavera.repository.PedidoRepository;
import es.cafeprimavera.repository.LineaPedidoRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final LineaPedidoRepository lineaPedidoRepository;
    private final MesaRepository mesaRepository;

    public PedidoService(PedidoRepository pedidoRepository,
                         LineaPedidoRepository lineaPedidoRepository,
                         MesaRepository mesaRepository) {
        this.pedidoRepository = pedidoRepository;
        this.lineaPedidoRepository = lineaPedidoRepository;
        this.mesaRepository = mesaRepository;
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

    public void deleteLinea(Integer id) {
    lineaPedidoRepository.deleteById(id);
}
}