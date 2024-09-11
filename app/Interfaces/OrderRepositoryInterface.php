<?php
namespace App\Interfaces;

interface OrderRepositoryInterface{

    public function getAllOrder();
    public function createOrder(array $orderData);
    public function getOrderById($orderId);
    public function updateOrder($orderId, array $orderData);
    public function deleteOrder($orderId);
    public function getFullFilledOrder();
}