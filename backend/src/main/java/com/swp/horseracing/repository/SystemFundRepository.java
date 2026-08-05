package com.swp.horseracing.repository;

import com.swp.horseracing.model.SystemFund;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemFundRepository extends JpaRepository<SystemFund, Integer> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM SystemFund s WHERE s.fundType = :fundType AND s.classLevel IS NULL")
    Optional<SystemFund> findByFundTypeWithPessimisticWrite(@Param("fundType") String fundType);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM SystemFund s WHERE s.fundType = :fundType AND s.classLevel = :classLevel")
    Optional<SystemFund> findByFundTypeAndClassLevelWithPessimisticWrite(@Param("fundType") String fundType, @Param("classLevel") Integer classLevel);
}
