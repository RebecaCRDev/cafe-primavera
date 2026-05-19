package es.cafeprimavera.controller;

import es.cafeprimavera.repository.*;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final ReservaRepository reservaRepository;
    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final EventoRepository eventoRepository;

    public DashboardController(ReservaRepository reservaRepository,
                                PedidoRepository pedidoRepository,
                                ProductoRepository productoRepository,
                                EventoRepository eventoRepository) {
        this.reservaRepository = reservaRepository;
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.eventoRepository = eventoRepository;
    }

    @GetMapping
    public Map<String, Object> getDashboard() {
        Map<String, Object> data = new HashMap<>();

        // Reservas de hoy
        LocalDateTime inicioDia = LocalDate.now().atStartOfDay();
        LocalDateTime finDia = LocalDate.now().atTime(23, 59, 59);
        List<?> reservasHoy = reservaRepository.findAll().stream()
            .filter(r -> {
                LocalDateTime fecha = r.getFechaReserva();
                return fecha != null && !fecha.isBefore(inicioDia) && !fecha.isAfter(finDia);
            }).toList();
        data.put("reservasHoy", reservasHoy.size());

        // Pedidos de hoy
        List<?> pedidosHoy = pedidoRepository.findAll().stream()
            .filter(p -> {
                LocalDateTime fecha = p.getFecha();
                return fecha != null && !fecha.isBefore(inicioDia) && !fecha.isAfter(finDia);
            }).toList();
        data.put("pedidosHoy", pedidosHoy.size());

        // Ingresos de hoy
        double ingresosHoy = pedidoRepository.findByEstado("PAGADO").stream()
            .filter(p -> {
                LocalDateTime fecha = p.getFecha();
                return fecha != null && !fecha.isBefore(inicioDia) && !fecha.isAfter(finDia);
            })
            .mapToDouble(p -> p.getTotal())
            .sum();
        data.put("ingresosHoy", ingresosHoy);

        // Stock crítico (menos de 10 unidades)
        List<?> stockCritico = productoRepository.findAll().stream()
            .filter(p -> p.getActivo() && p.getStock() < 10)
            .toList();
        data.put("stockCritico", stockCritico.size());
        data.put("productosStockCritico", stockCritico.stream()
            .map(p -> ((es.cafeprimavera.model.Producto) p).getNombre() + " (" + ((es.cafeprimavera.model.Producto) p).getStock() + " ud.)")
            .toList());

        // Talleres de hoy
        List<?> talleresHoy = eventoRepository.findAll().stream()
            .filter(e -> {
                LocalDateTime fecha = e.getFechaHora();
                return fecha != null && !fecha.isBefore(inicioDia) && !fecha.isAfter(finDia);
            }).toList();
        data.put("talleresHoy", talleresHoy.size());

        return data;
    }
}