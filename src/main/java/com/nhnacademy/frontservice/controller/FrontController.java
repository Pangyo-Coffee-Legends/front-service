package com.nhnacademy.frontservice.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class FrontController {
    @GetMapping(value = {"/index"})
    public String index(){
        return "index/index";
    }

    @GetMapping("/login")
    public String showLoginPage() {
        return "index/login";
    }

    @GetMapping("/")
    public String randing(){return "index/landing";}


    @GetMapping(value = {"/charts"})
    public String charts() { return "index/charts";}
}
