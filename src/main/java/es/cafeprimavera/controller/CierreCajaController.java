package es.cafeprimavera.controller;

import es.cafeprimavera.model.CierreCaja;
import es.cafeprimavera.service.CierreCajaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cierre-caja")
@CrossOrigin(origins = "*")
public class CierreCajaController {

    private final CierreCajaService cierreCajaService;

    public CierreCajaController(CierreCajaService cierreCajaService) {
        this.cierreCajaService = cierreCajaService;
    }

    @GetMapping
    public List<CierreCaja> getAll() {
        return cierreCajaService.findAll();
    }

    @GetMapping("/hoy")
    public ResponseEntity<?> getHoy() {
        return cierreCajaService.findByFecha(LocalDate.now())
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.ok(null));
    }

    @PostMapping("/cerrar")
    public ResponseEntity<?> cerrar(@RequestBody Map<String, String> body) {
        try {
            String observaciones = body.getOrDefault("observaciones", "");
            Integer empleadoId = Integer.parseInt(body.getOrDefault("empleadoId", "1"));
            return ResponseEntity.ok(cierreCajaService.cerrarCaja(observaciones, empleadoId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}