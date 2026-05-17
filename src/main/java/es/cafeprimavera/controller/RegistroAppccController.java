package es.cafeprimavera.controller;

import es.cafeprimavera.model.RegistroAppcc;
import es.cafeprimavera.service.RegistroAppccService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/appcc")
@CrossOrigin(origins = "*")
public class RegistroAppccController {

    private final RegistroAppccService registroAppccService;

    public RegistroAppccController(RegistroAppccService registroAppccService) {
        this.registroAppccService = registroAppccService;
    }

    @GetMapping
    public List<RegistroAppcc> getAll() {
        return registroAppccService.findAll();
    }

    @GetMapping("/tipo/{tipo}")
    public List<RegistroAppcc> getByTipo(@PathVariable String tipo) {
        return registroAppccService.findByTipo(tipo);
    }

    @GetMapping("/incidencias")
    public List<RegistroAppcc> getIncidencias() {
        return registroAppccService.findByResultado("INCIDENCIA");
    }

    @PostMapping
    public RegistroAppcc create(@RequestBody RegistroAppcc registro) {
        return registroAppccService.save(registro);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        registroAppccService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}