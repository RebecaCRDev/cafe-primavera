package es.cafeprimavera.controller;

import es.cafeprimavera.model.Producto;
import es.cafeprimavera.service.ProductoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public List<Producto> getAll() {
        return productoService.findAll();
    }

    @GetMapping("/activos")
    public List<Producto> getActivos() {
        return productoService.findActivos();
    }

    @GetMapping("/categoria/{categoriaId}")
    public List<Producto> getByCategoria(@PathVariable Integer categoriaId) {
        return productoService.findByCategoria(categoriaId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> getById(@PathVariable Integer id) {
        return productoService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Producto create(@RequestBody Producto producto) {
        return productoService.save(producto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> update(@PathVariable Integer id,
                                            @RequestBody Producto producto) {
        return productoService.findById(id).map(p -> {
            producto.setId(id);
            return ResponseEntity.ok(productoService.save(producto));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<Producto> updateStock(@PathVariable Integer id,
                                                 @RequestParam Integer cantidad) {
        return ResponseEntity.ok(productoService.actualizarStock(id, cantidad));
    }

    @PatchMapping("/{id}/gestionar-stock")
    public ResponseEntity<Producto> gestionarStock(@PathVariable Integer id,
                                                     @RequestBody Map<String, String> body) {
        String tipo = body.get("tipo");
        Integer cantidad = Integer.parseInt(body.get("cantidad"));
        String motivo = body.getOrDefault("motivo", "");
        Integer empleadoId = Integer.parseInt(body.getOrDefault("empleadoId", "1"));
        return ResponseEntity.ok(productoService.gestionarStock(id, tipo, cantidad, motivo, empleadoId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        productoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}