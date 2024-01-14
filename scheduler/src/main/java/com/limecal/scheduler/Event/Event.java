package com.limecal.scheduler.Event;

import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class Event {
    private Long id;
    private String public_id;

    @NotBlank
    private String title;


    // stored in yyyy-mm-dd format
    List<String> dates;

    // stored in ISO string format
    @NotBlank
    String start_time;
    @NotBlank
    String end_time;

    public Event() {

    }

    @JsonCreator
    public Event(@JsonProperty(value = "title", required = true) String title,
                 @JsonProperty(value = "start_time", required = true) String start_time,
                 @JsonProperty(value = "end_time", required = true) String end_time) {
        this.title = title;
        this.start_time = start_time;
        this.end_time = end_time;
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

    public List<String> getDates() {
        return dates;
    }
    public void setDates(List<String> dates) {
        this.dates = dates;
    }

    public String getStartTime() {
        return this.start_time;
    }
    public void setStartTime(String start_time) {
        this.start_time = start_time;
    }

    public String getEndTime() {
        return this.end_time;
    }
    public void setEndTime(String end_time) {
        this.end_time = end_time;
    }
}
