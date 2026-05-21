package es.cafeprimavera.service;

import es.cafeprimavera.model.CierreCaja;
import es.cafeprimavera.model.Empleado;
import es.cafeprimavera.model.Pedido;
import es.cafeprimavera.repository.CierreCajaRepository;
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

    public CierreCajaService(CierreCajaRepository cierreCajaRepository,
                              PedidoRepository pedidoRepository) {
        this.cierreCajaRepository = cierreCajaRepository;
        this.pedidoRepository = pedidoRepository;
    }

    public List<CierreCaja> findAll() {
        return cierreCajaRepository.findAllByOrderByFechaDesc();
    }

    public Optional<CierreCaja> findByFecha(LocalDate fecha) {
        return cierreCajaRepository.findByFecha(fecha);
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

        double efectivo = pedidosPagados.stream().filter(p -> "EFECTIVO".equals(p.getMetodoPago())).mapToDouble(Pedido::getTotal).sum();
        double tarjeta = pedidosPagados.stream().filter(p -> "TARJETA".equals(p.getMetodoPago())).mapToDouble(Pedido::getTotal).sum();
        double bizum = pedidosPagados.stream().filter(p -> "BIZUM".equals(p.getMetodoPago())).mapToDouble(Pedido::getTotal).sum();

        CierreCaja cierre = new CierreCaja();
        cierre.setFecha(hoy);
        cierre.setTotalEfectivo(efectivo);
        cierre.setTotalTarjeta(tarjeta);
        cierre.setTotalBizum(bizum);
        cierre.setTotalGeneral(efectivo + tarjeta + bizum);
        cierre.setNumPedidos(pedidosPagados.size());
        cierre.setNumCancelados((int) cancelados);
        cierre.setObservaciones(observaciones);
        Empleado empleado = new Empleado();
        empleado.setId(empleadoId);
        cierre.setEmpleado(empleado);

        return cierreCajaRepository.save(cierre);
    }
}