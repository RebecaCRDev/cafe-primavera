package es.cafeprimavera.repository;

import es.cafeprimavera.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Integer> {
    List<Pedido> findByCliente_Id(Integer clienteId);
    List<Pedido> findByEmpleado_Id(Integer empleadoId);
    List<Pedido> findByEstado(String estado);
}