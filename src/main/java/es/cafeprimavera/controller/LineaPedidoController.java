package es.cafeprimavera.controller;

import es.cafeprimavera.model.LineaPedido;
import es.cafeprimavera.service.PedidoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/lineas-pedido")
@CrossOrigin(origins = "*")
public class LineaPedidoController {

    private final PedidoService pedidoService;

    public LineaPedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PutMapping("/{id}")
    public ResponseEntity<LineaPedido> update(@PathVariable Integer id,
                                               @RequestBody LineaPedido linea) {
        linea.setId(id);
        return ResponseEntity.ok(pedidoService.saveLinea(linea));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        pedidoService.deleteLinea(id);
        return ResponseEntity.noContent().build();
    }
}