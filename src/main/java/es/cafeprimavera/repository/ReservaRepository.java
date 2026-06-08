package es.cafeprimavera.repository;

import es.cafeprimavera.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

public interface ReservaRepository extends JpaRepository<Reserva, Integer> {
    List<Reserva> findByCliente_Id(Integer clienteId);
    List<Reserva> findByEvento_Id(Integer eventoId);
    Optional<Reserva> findByCliente_IdAndEvento_IdAndEstadoNot(
        Integer clienteId, Integer eventoId, String estado);
    
    @Transactional
    void deleteByEvento_Id(Integer eventoId);
}