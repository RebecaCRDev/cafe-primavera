package es.cafeprimavera.controller;

import es.cafeprimavera.model.Empleado;
import es.cafeprimavera.service.EmpleadoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/empleados")
@CrossOrigin(origins = "*")
public class EmpleadoController {

    private final EmpleadoService empleadoService;

    public EmpleadoController(EmpleadoService empleadoService) {
        this.empleadoService = empleadoService;
    }

    @GetMapping
    public List<Empleado> getAll() {
        return empleadoService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Empleado> getById(@PathVariable Integer id) {
        return empleadoService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Empleado create(@RequestBody Empleado empleado) {
        return empleadoService.save(empleado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Empleado> update(@PathVariable Integer id,
                                            @RequestBody Empleado empleado) {
        return empleadoService.findById(id).map(e -> {
            empleado.setId(id);
            return ResponseEntity.ok(empleadoService.save(empleado));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        empleadoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}