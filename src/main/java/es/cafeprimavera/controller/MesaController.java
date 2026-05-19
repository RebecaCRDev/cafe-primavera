package es.cafeprimavera.controller;

import es.cafeprimavera.model.Mesa;
import es.cafeprimavera.service.MesaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/mesas")
@CrossOrigin(origins = "*")
public class MesaController {

    private final MesaService mesaService;

    public MesaController(MesaService mesaService) {
        this.mesaService = mesaService;
    }

    @GetMapping
    public List<Mesa> getAll() {
        return mesaService.findAll();
    }

    @GetMapping("/zona/{zona}")
    public List<Mesa> getByZona(@PathVariable String zona) {
        return mesaService.findByZona(zona);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Mesa> getById(@PathVariable Integer id) {
        return mesaService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Mesa> cambiarEstado(@PathVariable Integer id, @RequestParam String estado) {
        return ResponseEntity.ok(mesaService.cambiarEstado(id, estado));
    }
}