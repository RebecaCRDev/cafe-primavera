package es.cafeprimavera.repository;

import es.cafeprimavera.model.MovimientoStock;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MovimientoStockRepository extends JpaRepository<MovimientoStock, Integer> {
    List<MovimientoStock> findByProducto_Id(Integer productoId);
}