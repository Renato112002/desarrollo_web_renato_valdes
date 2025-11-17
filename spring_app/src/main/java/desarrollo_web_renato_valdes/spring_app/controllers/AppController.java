package desarrollo_web_renato_valdes.spring_app.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AppController {

    @GetMapping("/")
    public String mostrarListado(Model model) {
        return "listado";
    }
}
