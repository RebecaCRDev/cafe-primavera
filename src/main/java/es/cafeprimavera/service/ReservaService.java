package es.cafeprimavera.service;

import es.cafeprimavera.model.Reserva;
import es.cafeprimavera.model.Evento;
import es.cafeprimavera.repository.ReservaRepository;
import es.cafeprimavera.repository.EventoRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final EventoRepository eventoRepository;

    public ReservaService(ReservaRepository reservaRepository,
                          EventoRepository eventoRepository) {
        this.reservaRepository = reservaRepository;
        this.eventoRepository = eventoRepository;
    }

    public List<Reserva> findAll() {
        return reservaRepository.findAll();
    }

    public Optional<Reserva> findById(Integer id) {
        return reservaRepository.findById(id);
    }

    public List<Reserva> findByCliente(Integer clienteId) {
        return reservaRepository.findByCliente_Id(clienteId);
    }

    public Reserva save(Reserva reserva) {
        Evento evento = reserva.getEvento();
        if (evento.getPlazasDisponibles() <= 0) {
            throw new RuntimeException("No hay plazas disponibles");
        }
        evento.setPlazasDisponibles(evento.getPlazasDisponibles() - 1);
        eventoRepository.save(evento);
        return reservaRepository.save(reserva);
    }

    public Reserva cancelar(Integer id) {
        Reserva reserva = reservaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
        reserva.setEstado("CANCELADA");
        Evento evento = reserva.getEvento();
        evento.setPlazasDisponibles(evento.getPlazasDisponibles() + 1);
        eventoRepository.save(evento);
        return reservaRepository.save(reserva);
    }
}