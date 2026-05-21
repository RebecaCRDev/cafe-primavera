package es.cafeprimavera.model;

import jakarta.persistence.*;

@Entity
@Table(name = "mesa")
public class Mesa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 10)
    private String numero;

    @Column(nullable = false, length = 20)
    private String zona;

    @Column(nullable = false)
    private Integer capacidad = 2;

    @Column(nullable = false)
    private String estado = "LIBRE";

    @Column(name = "nombre_reserva", length = 150)
    private String nombreReserva;

    @Column(name = "hora_reserva", length = 10)
    private String horaReserva;

    @Column(name = "personas_reserva")
    private Integer personasReserva;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }
    public String getZona() { return zona; }
    public void setZona(String zona) { this.zona = zona; }
    public Integer getCapacidad() { return capacidad; }
    public void setCapacidad(Integer capacidad) { this.capacidad = capacidad; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getNombreReserva() { return nombreReserva; }
    public void setNombreReserva(String nombreReserva) { this.nombreReserva = nombreReserva; }
    public String getHoraReserva() { return horaReserva; }
    public void setHoraReserva(String horaReserva) { this.horaReserva = horaReserva; }
    public Integer getPersonasReserva() { return personasReserva; }
    public void setPersonasReserva(Integer personasReserva) { this.personasReserva = personasReserva; }
}