package es.cafeprimavera.repository;

import es.cafeprimavera.model.CierreCaja;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CierreCajaRepository extends JpaRepository<CierreCaja, Integer> {
    Optional<CierreCaja> findByFecha(LocalDate fecha);
    List<CierreCaja> findAllByOrderByFechaDesc();
}