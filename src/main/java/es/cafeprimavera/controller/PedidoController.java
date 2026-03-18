package es.cafeprimavera.controller;

import es.cafeprimavera.model.Pedido;
import es.cafeprimavera.model.LineaPedido;
import es.cafeprimavera.service.PedidoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @GetMapping
    public List<Pedido> getAll() {
        return pedidoService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> getById(@PathVariable Integer id) {
        return pedidoService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/lineas")
    public List<LineaPedido> getLineas(@PathVariable Integer id) {
        return pedidoService.findLineasByPedido(id);
    }

    @GetMapping("/cliente/{clienteId}")
    public List<Pedido> getByCliente(@PathVariable Integer clienteId) {
        return pedidoService.findByCliente(clienteId);
    }

    @GetMapping("/estado/{estado}")
    public List<Pedido> getByEstado(@PathVariable String estado) {
        return pedidoService.findByEstado(estado);
    }

    @PostMapping
    public Pedido create(@RequestBody Pedido pedido) {
        return pedidoService.save(pedido);
    }

    @PostMapping("/{id}/lineas")
    public LineaPedido addLinea(@PathVariable Integer id,
                                 @RequestBody LineaPedido linea) {
        linea.setPedido(pedidoService.findById(id)
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado")));
        return pedidoService.saveLinea(linea);
    }

    @PatchMapping("/{id}/cerrar")
    public ResponseEntity<Pedido> cerrar(@PathVariable Integer id,
                                          @RequestParam String metodoPago) {
        return ResponseEntity.ok(pedidoService.cerrarPedido(id, metodoPago));
    }
}