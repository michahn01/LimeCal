package com.limecal.scheduler.Event;

import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class Event {
    private Long id;
    private String public_id;

    @NotBlank
    private String title;

    public Event() {

    }

    @JsonCreator
    public Event(@JsonProperty(value = "title", required = true) String title) {
        this.title = title;
    }

    public Event(String title, Long Id, String public_id) {
        this.id = Id;
        this.public_id = public_id;
        this.title = title;
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
}
