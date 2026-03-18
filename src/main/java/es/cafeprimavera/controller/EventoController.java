package es.cafeprimavera.controller;

import es.cafeprimavera.model.Evento;
import es.cafeprimavera.service.EventoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/eventos")
@CrossOrigin(origins = "*")
public class EventoController {

    private final EventoService eventoService;

    public EventoController(EventoService eventoService) {
        this.eventoService = eventoService;
    }

    @GetMapping
    public List<Evento> getAll() {
        return eventoService.findAll();
    }

    @GetMapping("/disponibles")
    public List<Evento> getDisponibles() {
        return eventoService.findConPlazas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Evento> getById(@PathVariable Integer id) {
        return eventoService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Evento create(@RequestBody Evento evento) {
        return eventoService.save(evento);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Evento> update(@PathVariable Integer id,
                                          @RequestBody Evento evento) {
        return eventoService.findById(id).map(e -> {
            evento.setId(id);
            return ResponseEntity.ok(eventoService.save(evento));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        eventoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}