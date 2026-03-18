package es.cafeprimavera.repository;

import es.cafeprimavera.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Integer> {
    List<Producto> findByActivoTrue();
    List<Producto> findByCategoria_Id(Integer categoriaId);
}