package com.example.demo.service;

import com.example.demo.model.Task;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducerService {

    private static final Logger logger = LoggerFactory.getLogger(KafkaProducerService.class);

    @Value("${spring.kafka.topic.name:task-events}")
    private String topicName;

    private final KafkaTemplate<String, String> kafkaTemplate;

    public KafkaProducerService(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendMessage(String message) {
        logger.info("Sending message to Kafka: {}", message);
        kafkaTemplate.send(topicName, message);
    }

    public void sendTaskEvent(String action, Task task) {
        String event = String.format("Action: %s | Task ID: %d | Title: %s", action, task.getId(), task.getTitle());
        sendMessage(event);
    }
}
