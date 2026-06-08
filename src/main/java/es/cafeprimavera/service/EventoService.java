package es.cafeprimavera.service;

import es.cafeprimavera.model.Evento;
import es.cafeprimavera.repository.EventoRepository;
import es.cafeprimavera.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class EventoService {

    private final EventoRepository eventoRepository;
    private final ReservaRepository reservaRepository;

    public EventoService(EventoRepository eventoRepository,
                         ReservaRepository reservaRepository) {
        this.eventoRepository = eventoRepository;
        this.reservaRepository = reservaRepository;
    }

    public List<Evento> findAll() {
        return eventoRepository.findAll();
    }

    public Optional<Evento> findById(Integer id) {
        return eventoRepository.findById(id);
    }

    public List<Evento> findConPlazas() {
        return eventoRepository.findByPlazasDisponiblesGreaterThan(0);
    }

    public Evento save(Evento evento) {
        return eventoRepository.save(evento);
    }

    public void deleteById(Integer id) {
        reservaRepository.deleteByEvento_Id(id);
        eventoRepository.deleteById(id);
    }
}