<?php
namespace App\Repositories;

use App\Interfaces\OrderRepositoryInterface;
use App\Models\Order;

class OrderRepository implements OrderRepositoryInterface{
    public function getAllOrder(){
        return Order::all();
    }

    public function createOrder(array $orderData){
        return Order::create($orderData);
    }

    public function getOrderById($orderId){
        return Order::findOrFail($orderId);
    }

    public function updateOrder($orderId, array $orderData){
        return Order::whereId($orderId)->update($orderData);
    }

    public function deleteOrder($orderId){
        return Order::destroy($orderId);
    }

    public function getFullFilledOrder(){
        return Order::where('is_fulfilled', true)->get();
    }

}