package es.cafeprimavera.repository;

import es.cafeprimavera.model.Mesa;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MesaRepository extends JpaRepository<Mesa, Integer> {
    List<Mesa> findByZona(String zona);
    List<Mesa> findByEstado(String estado);
}