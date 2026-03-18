package es.cafeprimavera.repository;

import es.cafeprimavera.model.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EmpleadoRepository extends JpaRepository<Empleado, Integer> {
    Optional<Empleado> findByEmail(String email);
}