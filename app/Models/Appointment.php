<?php
namespace App\Models;
use App\Config\Database;

class Appointment {
    public static function getByDate($date) {
        $sql = "SELECT a.*, p.full_name as patient_name, d.full_name as doctor_name 
                FROM appointments a JOIN patients p ON a.patient_id = p.id JOIN doctors d ON a.doctor_id = d.id 
                WHERE DATE(a.appointment_date) = ? ORDER BY a.appointment_date ASC";
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute([$date]);
        return $stmt->fetchAll();
    }
    public static function isDoctorAvailable($doctorId, $time) {
        $stmt = Database::getConnection()->prepare("SELECT count(*) FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND status != 'CANCELLED'");
        $stmt->execute([$doctorId, $time]);
        return $stmt->fetchColumn() == 0;
    }
    public static function create($data) {
        $sql = "INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, notes) VALUES (?, ?, ?, 'PENDING', ?)";
        return Database::getConnection()->prepare($sql)->execute([$data['patient_id'], $data['doctor_id'], $data['appointment_date'], $data['notes']]);
    }
}