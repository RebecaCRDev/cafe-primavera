package es.cafeprimavera.service;

import es.cafeprimavera.model.CierreCaja;
import es.cafeprimavera.model.Empleado;
import es.cafeprimavera.model.LineaPedido;
import es.cafeprimavera.model.Pedido;
import es.cafeprimavera.repository.CierreCajaRepository;
import es.cafeprimavera.repository.LineaPedidoRepository;
import es.cafeprimavera.repository.PedidoRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CierreCajaService {

    private final CierreCajaRepository cierreCajaRepository;
    private final PedidoRepository pedidoRepository;
    private final LineaPedidoRepository lineaPedidoRepository;

    public CierreCajaService(CierreCajaRepository cierreCajaRepository,
                              PedidoRepository pedidoRepository,
                              LineaPedidoRepository lineaPedidoRepository) {
        this.cierreCajaRepository = cierreCajaRepository;
        this.pedidoRepository = pedidoRepository;
        this.lineaPedidoRepository = lineaPedidoRepository;
    }

    public List<CierreCaja> findAll() {
        return cierreCajaRepository.findAllByOrderByFechaDesc();
    }

    public Optional<CierreCaja> findByFecha(LocalDate fecha) {
        return cierreCajaRepository.findByFecha(fecha);
    }

    private boolean esCafeteria(String tipo) {
        return "CAFETERIA".equals(tipo) || "PACK".equals(tipo);
    }

    private boolean esFloristeria(String tipo) {
        return "FLORISTERIA".equals(tipo) || "PACK".equals(tipo);
    }

    public CierreCaja cerrarCaja(String observaciones, Integer empleadoId) {
        LocalDate hoy = LocalDate.now();

        if (cierreCajaRepository.findByFecha(hoy).isPresent()) {
            throw new RuntimeException("La caja ya ha sido cerrada hoy");
        }

        LocalDateTime inicioDia = hoy.atStartOfDay();
        LocalDateTime finDia = hoy.atTime(23, 59, 59);

        List<Pedido> pedidosPagados = pedidoRepository.findByEstado("PAGADO").stream()
            .filter(p -> {
                LocalDateTime fecha = p.getFecha();
                return fecha != null && !fecha.isBefore(inicioDia) && !fecha.isAfter(finDia);
            }).toList();

        long cancelados = pedidoRepository.findByEstado("CANCELADO").stream()
            .filter(p -> {
                LocalDateTime fecha = p.getFecha();
                return fecha != null && !fecha.isBefore(inicioDia) && !fecha.isAfter(finDia);
            }).count();

        double efectivo = pedidosPagados.stream()
            .filter(p -> "EFECTIVO".equals(p.getMetodoPago()))
            .mapToDouble(Pedido::getTotal).sum();

        double tarjeta = pedidosPagados.stream()
            .filter(p -> "TARJETA".equals(p.getMetodoPago()))
            .mapToDouble(Pedido::getTotal).sum();

        // Calcular desglose por área línea a línea
        double totalCafeteria = 0.0;
        double totalFloristeria = 0.0;

        for (Pedido pedido : pedidosPagados) {
            List<LineaPedido> lineas = lineaPedidoRepository.findByPedido_Id(pedido.getId());
            for (LineaPedido linea : lineas) {
                String tipo = linea.getProducto() != null && linea.getProducto().getCategoria() != null
                    ? linea.getProducto().getCategoria().getTipo()
                    : null;
                double importe = linea.getPrecioUnitario() * linea.getCantidad();
                if (tipo != null) {
                    if ("PACK".equals(tipo)) {
                        // Los PACK se reparten al 50% entre cafetería y floristería
                        totalCafeteria += importe / 2;
                        totalFloristeria += importe / 2;
                    } else if ("CAFETERIA".equals(tipo)) {
                        totalCafeteria += importe;
                    } else if ("FLORISTERIA".equals(tipo)) {
                        totalFloristeria += importe;
                    }
                }
            }
        }

        CierreCaja cierre = new CierreCaja();
        cierre.setFecha(hoy);
        cierre.setTotalEfectivo(efectivo);
        cierre.setTotalTarjeta(tarjeta);
        cierre.setTotalGeneral(efectivo + tarjeta);
        cierre.setTotalCafeteria(totalCafeteria);
        cierre.setTotalFloristeria(totalFloristeria);
        cierre.setNumPedidos(pedidosPagados.size());
        cierre.setNumCancelados((int) cancelados);
        cierre.setObservaciones(observaciones);
        Empleado empleado = new Empleado();
        empleado.setId(empleadoId);
        cierre.setEmpleado(empleado);

        return cierreCajaRepository.save(cierre);
    }
}