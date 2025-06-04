package com.nhnacademy.frontservice.common.auth;

public class EmailThreadLocal {
    private static final ThreadLocal<String> emailLocal = new ThreadLocal<>();

    private EmailThreadLocal() {
        throw new IllegalStateException("Utility class");
    }

    public static String getEmail(){
        return emailLocal.get();
    }

    public static void setEmailLocal(String email) {
        emailLocal.set(email);
    }

    public static void removeEmail() {
        emailLocal.remove();
    }
}
