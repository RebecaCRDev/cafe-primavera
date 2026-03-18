package es.cafeprimavera.service;

import es.cafeprimavera.model.Empleado;
import es.cafeprimavera.repository.EmpleadoRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class EmpleadoService {

    private final EmpleadoRepository empleadoRepository;

    public EmpleadoService(EmpleadoRepository empleadoRepository) {
        this.empleadoRepository = empleadoRepository;
    }

    public List<Empleado> findAll() {
        return empleadoRepository.findAll();
    }

    public Optional<Empleado> findById(Integer id) {
        return empleadoRepository.findById(id);
    }

    public Optional<Empleado> findByEmail(String email) {
        return empleadoRepository.findByEmail(email);
    }

    public Empleado save(Empleado empleado) {
        return empleadoRepository.save(empleado);
    }

    public void deleteById(Integer id) {
        empleadoRepository.deleteById(id);
    }
}