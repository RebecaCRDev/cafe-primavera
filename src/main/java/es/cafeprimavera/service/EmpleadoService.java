package es.cafeprimavera.service;

import es.cafeprimavera.model.Empleado;
import es.cafeprimavera.repository.EmpleadoRepository;
import org.springframework.stereotype.Service;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
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
        if (empleado.getPasswordHash() != null && !empleado.getPasswordHash().startsWith("SHA256:")) {
            String hashed = hashPassword(empleado.getPasswordHash());
            empleado.setPasswordHash(hashed);
        }
        return empleadoRepository.save(empleado);
    }

    public void deleteById(Integer id) {
        empleadoRepository.deleteById(id);
    }

    public boolean verificarPassword(String passwordPlano, String passwordHashAlmacenado) {
        try {
            String[] partes = passwordHashAlmacenado.replace("SHA256:", "").split(":");
            String sal = partes[0];
            String hashAlmacenado = partes[1];
            String hashCalculado = sha256(passwordPlano + sal);
            return hashCalculado.equals(hashAlmacenado);
        } catch (Exception e) {
            return false;
        }
    }

    private String hashPassword(String passwordPlano) {
        try {
            SecureRandom random = new SecureRandom();
            byte[] salBytes = new byte[16];
            random.nextBytes(salBytes);
            String sal = Base64.getEncoder().encodeToString(salBytes);
            String hash = sha256(passwordPlano + sal);
            return "SHA256:" + sal + ":" + hash;
        } catch (Exception e) {
            throw new RuntimeException("Error al hashear la contraseña");
        }
    }

    private String sha256(String input) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hashBytes = digest.digest(input.getBytes("UTF-8"));
        StringBuilder sb = new StringBuilder();
        for (byte b : hashBytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}