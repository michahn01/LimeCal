package com.limecal.scheduler.dao;

import java.util.List;
import java.util.Optional;


public interface DAO<T> {
    List<T> list();
    void create(T t);
    Optional<T> get(int id);

    // returns number of elements affected
    int update(T t, int id);
    
    void delete(int id);
}
