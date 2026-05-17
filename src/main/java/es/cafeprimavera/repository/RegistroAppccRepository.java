package es.cafeprimavera.repository;

import es.cafeprimavera.model.RegistroAppcc;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RegistroAppccRepository extends JpaRepository<RegistroAppcc, Integer> {
    List<RegistroAppcc> findByTipo(String tipo);
    List<RegistroAppcc> findByResultado(String resultado);
    List<RegistroAppcc> findByEmpleado_Id(Integer empleadoId);
}