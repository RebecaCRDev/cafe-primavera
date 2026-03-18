package es.cafeprimavera.repository;

import es.cafeprimavera.model.LineaPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LineaPedidoRepository extends JpaRepository<LineaPedido, Integer> {
    List<LineaPedido> findByPedido_Id(Integer pedidoId);
}