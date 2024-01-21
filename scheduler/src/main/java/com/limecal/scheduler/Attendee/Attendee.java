package com.limecal.scheduler.Attendee;

import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class Attendee {
    Long id;

    @NotBlank
    String event_public_id;

    @NotBlank
    String username;

    List<String> available_times;

    public Attendee() {

    }

    @JsonCreator
    public Attendee(@JsonProperty(value = "username", required = true) String username,
                    @JsonProperty(value = "event_public_id", required = true) String event_public_id,
                    @JsonProperty(value = "available_times") List<String> available_times) {
        this.username = username;
        this.event_public_id = event_public_id;
        this.available_times = available_times;
    }

    public void setId(Long id) {
        this.id = id;
    }
    public Long getId() {
        return this.id;
    }

    public void setEventPublicId(String event_public_id) {
        this.event_public_id = event_public_id;
    }
    public String getEventPublicId() {
        return this.event_public_id;
    }

    public void setUsername(String username) {
        this.username = username;
    }
    public String getUsername() {
        return this.username;
    }

    public void setAvailableTimes(List<String> available_times) {
        this.available_times = available_times;
    }
    public List<String> getAvailableTimes() {
        return this.available_times;
    }
};
