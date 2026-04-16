package es.cafeprimavera.controller;

import es.cafeprimavera.model.Empleado;
import es.cafeprimavera.service.EmpleadoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final EmpleadoService empleadoService;

    public AuthController(EmpleadoService empleadoService) {
        this.empleadoService = empleadoService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credenciales) {
        String email = credenciales.get("email");
        String password = credenciales.get("password");

        Optional<Empleado> empleado = empleadoService.findByEmail(email);

        if (empleado.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Credenciales incorrectas"));
        }

        if (!empleado.get().getActivo()) {
            return ResponseEntity.status(403).body(Map.of("error", "Usuario inactivo"));
        }

        boolean passwordCorrecta = empleadoService.verificarPassword(password, empleado.get().getPasswordHash());

        if (!passwordCorrecta) {
            return ResponseEntity.status(401).body(Map.of("error", "Credenciales incorrectas"));
        }

        Empleado e = empleado.get();
        return ResponseEntity.ok(Map.of(
            "id", e.getId(),
            "nombre", e.getNombre(),
            "email", e.getEmail(),
            "rol", e.getRol()
        ));
    }
}