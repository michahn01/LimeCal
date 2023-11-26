package com.limecal.scheduler.Event;

import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class Event {
    private Long id;
    private String public_id;

    @NotBlank
    private String title;
    private String password;

    public Event() {

    }

    @JsonCreator
    public Event(@JsonProperty(value = "title", required = true) String title, 
                 @JsonProperty(value = "password", required = false) String password) {
        this.title = title;
        this.password = password;
    }

    public Event(String title, String password, Long Id, String public_id) {
        this.id = Id;
        this.public_id = public_id;
        this.title = title;
        this.password = password;
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getPublicId() {
        return public_id;
    }
    public void setPublicId(String public_id) {
        this.public_id = public_id;
    }

    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
}
