package es.cafeprimavera.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "producto_flor")
public class ProductoFlor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "producto_id", nullable = false, unique = true)
    private Producto producto;

    private LocalDate fechaCaducidad;

    @Column(nullable = false, name = "temporada")
    private String temporada = "TODO_AÑO";

    private String color;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }
    public LocalDate getFechaCaducidad() { return fechaCaducidad; }
    public void setFechaCaducidad(LocalDate fechaCaducidad) { this.fechaCaducidad = fechaCaducidad; }
    public String getTemporada() { return temporada; }
    public void setTemporada(String temporada) { this.temporada = temporada; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}