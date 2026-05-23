package es.cafeprimavera.controller;

import es.cafeprimavera.model.Evento;
import es.cafeprimavera.model.LineaPedido;
import es.cafeprimavera.model.Pedido;
import es.cafeprimavera.model.Producto;
import es.cafeprimavera.model.ProductoFlor;
import es.cafeprimavera.repository.*;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.DayOfWeek;
import java.util.ArrayList;
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
    private final MesaRepository mesaRepository;
    private final ProductoFlorRepository productoFlorRepository;
    private final LineaPedidoRepository lineaPedidoRepository;

    public DashboardController(ReservaRepository reservaRepository,
                                PedidoRepository pedidoRepository,
                                ProductoRepository productoRepository,
                                EventoRepository eventoRepository,
                                MesaRepository mesaRepository,
                                ProductoFlorRepository productoFlorRepository,
                                LineaPedidoRepository lineaPedidoRepository) {
        this.reservaRepository = reservaRepository;
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.eventoRepository = eventoRepository;
        this.mesaRepository = mesaRepository;
        this.productoFlorRepository = productoFlorRepository;
        this.lineaPedidoRepository = lineaPedidoRepository;
    }

    @GetMapping
    public Map<String, Object> getDashboard() {
        Map<String, Object> data = new HashMap<>();

        LocalDateTime inicioDia = LocalDate.now().atStartOfDay();
        LocalDateTime finDia = LocalDate.now().atTime(23, 59, 59);
        DayOfWeek diaSemana = LocalDate.now().getDayOfWeek();

        // ── PREVISIÓN CAFETERÍA ──────────────────────────────

        long reservasMesaHoy = mesaRepository.findAll().stream()
            .filter(m -> "RESERVADA".equals(m.getEstado()))
            .count();
        data.put("reservasMesaHoy", reservasMesaHoy);

        long mesasOcupadas = mesaRepository.findAll().stream()
            .filter(m -> "OCUPADA".equals(m.getEstado()))
            .count();
        long mesasLibres = mesaRepository.findAll().stream()
            .filter(m -> "LIBRE".equals(m.getEstado()))
            .count();
        data.put("mesasOcupadas", mesasOcupadas);
        data.put("mesasLibres", mesasLibres);

        String previsionAfluencia;
        String previsionDescripcion;
        if (diaSemana == DayOfWeek.SATURDAY || diaSemana == DayOfWeek.SUNDAY) {
            previsionAfluencia = "ALTA";
            previsionDescripcion = "Fin de semana — se espera lleno. Prepara el doble de stock habitual.";
        } else if (diaSemana == DayOfWeek.FRIDAY) {
            previsionAfluencia = "MEDIA-ALTA";
            previsionDescripcion = "Viernes — tarde movida. Refuerza el stock de café y bollería.";
        } else if (diaSemana == DayOfWeek.MONDAY) {
            previsionAfluencia = "BAJA";
            previsionDescripcion = "Lunes — jornada tranquila. Stock habitual suficiente.";
        } else {
            previsionAfluencia = "MEDIA";
            previsionDescripcion = "Entre semana — afluencia normal. Revisa el stock de productos frescos.";
        }
        data.put("previsionAfluencia", previsionAfluencia);
        data.put("previsionDescripcion", previsionDescripcion);
        data.put("diaSemana", diaSemana.toString());

        List<Producto> stockCriticoCafeteria = productoRepository.findAll().stream()
            .filter(p -> p.getActivo() && p.getStock() < 10
                && p.getCategoria() != null
                && ("CAFETERIA".equals(p.getCategoria().getTipo()) || "PACK".equals(p.getCategoria().getTipo())))
            .toList();
        data.put("stockCriticoCafeteria", stockCriticoCafeteria.size());
        data.put("productosCriticosCafeteria", stockCriticoCafeteria.stream()
            .map(p -> p.getNombre() + " (" + p.getStock() + " ud.)")
            .toList());

        // ── PREVISIÓN FLORISTERÍA ────────────────────────────

        List<Evento> talleresHoy = eventoRepository.findAll().stream()
            .filter(e -> {
                LocalDateTime fecha = e.getFechaHora();
                return fecha != null && !fecha.isBefore(inicioDia) && !fecha.isAfter(finDia);
            }).toList();
        data.put("talleresHoy", talleresHoy.size());
        data.put("detalleTalleresHoy", talleresHoy.stream()
            .map(e -> Map.of(
                "nombre", e.getNombre(),
                "hora", e.getFechaHora().toLocalTime().toString().substring(0, 5),
                "plazasReservadas", e.getPlazasTotales() - e.getPlazasDisponibles(),
                "plazasDisponibles", e.getPlazasDisponibles(),
                "plazasTotales", e.getPlazasTotales()
            )).toList());

        List<Producto> stockCriticoFloristeria = productoRepository.findAll().stream()
            .filter(p -> p.getActivo() && p.getStock() < 10
                && p.getCategoria() != null
                && ("FLORISTERIA".equals(p.getCategoria().getTipo()) || "PACK".equals(p.getCategoria().getTipo())))
            .toList();
        data.put("stockCriticoFloristeria", stockCriticoFloristeria.size());
        data.put("productosCriticosFloristeria", stockCriticoFloristeria.stream()
            .map(p -> p.getNombre() + " (" + p.getStock() + " ud.)")
            .toList());

        List<String> nombresFloresCaducando = new ArrayList<>();
        for (ProductoFlor pf : productoFlorRepository.findAll()) {
            if (pf.getFechaCaducidad() != null
                && !pf.getFechaCaducidad().isAfter(LocalDate.now().plusDays(3))
                && pf.getProducto() != null
                && pf.getProducto().getActivo()) {
                nombresFloresCaducando.add(pf.getProducto().getNombre());
            }
        }
        data.put("floresCaducando", nombresFloresCaducando.size());
        data.put("nombresFloresCaducando", nombresFloresCaducando);

        // ── DATOS COMUNES ────────────────────────────────────

        List<Pedido> pedidosPagadosHoy = pedidoRepository.findByEstado("PAGADO").stream()
            .filter(p -> {
                LocalDateTime fecha = p.getFecha();
                return fecha != null && !fecha.isBefore(inicioDia) && !fecha.isAfter(finDia);
            }).toList();

        double ingresosHoy = pedidosPagadosHoy.stream().mapToDouble(Pedido::getTotal).sum();
        double ingresosEfectivo = pedidosPagadosHoy.stream()
            .filter(p -> "EFECTIVO".equals(p.getMetodoPago()))
            .mapToDouble(Pedido::getTotal).sum();
        double ingresosTarjeta = pedidosPagadosHoy.stream()
            .filter(p -> "TARJETA".equals(p.getMetodoPago()))
            .mapToDouble(Pedido::getTotal).sum();

        data.put("ingresosHoy", ingresosHoy);
        data.put("ingresosEfectivo", ingresosEfectivo);
        data.put("ingresosTarjeta", ingresosTarjeta);
        data.put("numPedidosPagados", pedidosPagadosHoy.size());

        long pedidosCancelados = pedidoRepository.findByEstado("CANCELADO").stream()
            .filter(p -> {
                LocalDateTime fecha = p.getFecha();
                return fecha != null && !fecha.isBefore(inicioDia) && !fecha.isAfter(finDia);
            }).count();
        data.put("pedidosCancelados", pedidosCancelados);

        // ── INGRESOS POR ÁREA LÍNEA A LÍNEA ─────────────────

        double ingresosCafeteria = 0.0;
        double ingresosFloristeria = 0.0;

        for (Pedido pedido : pedidosPagadosHoy) {
            List<LineaPedido> lineas = lineaPedidoRepository.findByPedido_Id(pedido.getId());
            for (LineaPedido linea : lineas) {
                String tipo = linea.getProducto() != null && linea.getProducto().getCategoria() != null
                    ? linea.getProducto().getCategoria().getTipo()
                    : null;
                double importe = linea.getPrecioUnitario() * linea.getCantidad();
                if ("PACK".equals(tipo)) {
                    ingresosCafeteria += importe / 2;
                    ingresosFloristeria += importe / 2;
                } else if ("CAFETERIA".equals(tipo)) {
                    ingresosCafeteria += importe;
                } else if ("FLORISTERIA".equals(tipo)) {
                    ingresosFloristeria += importe;
                }
            }
        }
        data.put("ingresosCafeteria", ingresosCafeteria);
        data.put("ingresosFloristeria", ingresosFloristeria);

        return data;
    }
}