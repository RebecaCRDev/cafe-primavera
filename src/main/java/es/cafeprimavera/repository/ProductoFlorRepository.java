package es.cafeprimavera.repository;

import es.cafeprimavera.model.ProductoFlor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProductoFlorRepository extends JpaRepository<ProductoFlor, Integer> {
    Optional<ProductoFlor> findByProducto_Id(Integer productoId);
}