package es.cafeprimavera.controller;

import es.cafeprimavera.model.Reserva;
import es.cafeprimavera.service.ReservaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "*")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @GetMapping
    public List<Reserva> getAll() {
        return reservaService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reserva> getById(@PathVariable Integer id) {
        return reservaService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/cliente/{clienteId}")
    public List<Reserva> getByCliente(@PathVariable Integer clienteId) {
        return reservaService.findByCliente(clienteId);
    }

    @PostMapping
    public Reserva create(@RequestBody Reserva reserva) {
        return reservaService.save(reserva);
    }

    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<Reserva> cancelar(@PathVariable Integer id) {
        return ResponseEntity.ok(reservaService.cancelar(id));
    }
}