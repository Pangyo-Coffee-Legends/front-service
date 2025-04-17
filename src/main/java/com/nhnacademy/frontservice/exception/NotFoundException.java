package com.nhnacademy.frontservice.exception;

public class NotFoundException extends CommonHttpException{
    public static final int STATUS_CODE = 404;
    public NotFoundException() {
        super(STATUS_CODE, "resource not found");
    }
    public NotFoundException(String message) {
        super(STATUS_CODE, message);
    }
}
