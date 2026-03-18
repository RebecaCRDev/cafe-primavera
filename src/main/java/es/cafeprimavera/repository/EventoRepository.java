package es.cafeprimavera.repository;

import es.cafeprimavera.model.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventoRepository extends JpaRepository<Evento, Integer> {
    List<Evento> findByTipo(String tipo);
    List<Evento> findByPlazasDisponiblesGreaterThan(Integer plazas);
}