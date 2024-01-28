package com.limecal.scheduler.Email;

import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class Feedback {

    @NotBlank
    String feedbackType;

    @NotBlank
    String feedbackMessage;


    public Feedback() {

    }

    @JsonCreator
    public Feedback(@JsonProperty(value = "feedbackType", required = true) String feedbackType,
                    @JsonProperty(value = "feedbackMessage", required = true) String feedbackMessage) {
        this.feedbackType = feedbackType;
        this.feedbackMessage = feedbackMessage;
    }

    public void setFeedbackType(String feedbackType) {
        this.feedbackType = feedbackType;
    }
    public String getFeedbackType() {
        return this.feedbackType;
    }
    public void setFeedbackMessage(String feedbackMessage) {
        this.feedbackMessage = feedbackMessage;
    }
    public String getFeedbackMessage() {
        return this.feedbackMessage;
    }
}
