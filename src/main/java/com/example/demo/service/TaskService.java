package com.example.demo.service;

import com.example.demo.model.Task;
import com.example.demo.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final KafkaProducerService kafkaProducerService;

    @Autowired
    public TaskService(TaskRepository taskRepository, KafkaProducerService kafkaProducerService) {
        this.taskRepository = taskRepository;
        this.kafkaProducerService = kafkaProducerService;
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }

    public Task createTask(Task task) {
        Task savedTask = taskRepository.save(task);
        kafkaProducerService.sendTaskEvent("CREATED", savedTask);
        return savedTask;
    }

    public Task updateTask(Long id, Task taskDetails) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        
        task.setTitle(taskDetails.getTitle());
        task.setDescription(taskDetails.getDescription());
        task.setCompleted(taskDetails.isCompleted());
        
        Task savedTask = taskRepository.save(task);
        kafkaProducerService.sendTaskEvent("UPDATED", savedTask);
        return savedTask;
    }

    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        taskRepository.delete(task);
    }
}
