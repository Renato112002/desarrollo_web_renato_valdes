package desarrollo_web_renato_valdes.spring_app.controllers;

import desarrollo_web_renato_valdes.spring_app.models.AvisoAdopcion;
import desarrollo_web_renato_valdes.spring_app.models.Nota;
import desarrollo_web_renato_valdes.spring_app.models.AvisoAdopcionRepository;
import desarrollo_web_renato_valdes.spring_app.models.NotaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/avisos")
public class ApiController {

    @Autowired
    private AvisoAdopcionRepository avisoRepo;

    @Autowired
    private NotaRepository notaRepo;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> mostrarAvisos() {

        List<AvisoAdopcion> avisos = avisoRepo.findAllWithComuna();
        List<Map<String, Object>> respuesta = new ArrayList<>();

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (AvisoAdopcion aviso : avisos) {
            Map<String, Object> m = new HashMap<>();

            m.put("id", aviso.getId());
            m.put("fecha_publicacion", aviso.getFechaIngreso().format(fmt));
            m.put("sector", aviso.getSector());
            m.put("cantidad", aviso.getCantidad());
            m.put("tipo", aviso.getTipo());
            m.put("edad", aviso.getEdad());
            m.put("unidad", aviso.getUnidadMedida());
            m.put("comuna", aviso.getComuna().getNombre());

            List<Nota> notas = notaRepo.findByAvisoId(aviso.getId());
            Double promedio = null;
            if (!notas.isEmpty()) {
                double prom = notas.stream().mapToInt(Nota::getNota).average().orElse(0);
                promedio = Math.round(prom * 10.0) / 10.0;
            }
            m.put("nota", promedio);
            respuesta.add(m);
        }
        return ResponseEntity.ok(respuesta);
    }

    @PostMapping("/evaluar")
    public ResponseEntity<Map<String, Object>> evaluar(
            @RequestParam Integer avisoId,
            @RequestParam Integer nuevaNota) {

        if (nuevaNota < 1 || nuevaNota > 7) {
            return ResponseEntity.badRequest().body(Map.of("error", "La nota debe estar entre 1 y 7"));
        }
        AvisoAdopcion aviso = avisoRepo.findById(avisoId).orElse(null);
        Nota nueva = new Nota();
        nueva.setAviso(aviso);
        nueva.setNota(nuevaNota);
        notaRepo.save(nueva);
        return ResponseEntity.ok(Map.of("ok", true));
    }

}