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

    @GetMapping("/signup")
    public String showSignupPage() {
        return "index/signup";
    }

    @GetMapping("/")
    public String randing(){return "index/landing";}

    @GetMapping("/book")
    public String book(){
        return "book/index";
    }

    @GetMapping("/book/success")
    public String success(){
        return "book/success";
    }

    @GetMapping("/book/failed")
    public String failed(){
        return "book/failed";
    }

    @GetMapping(value = {"/charts"})
    public String charts() { return "index/charts";}
}
