<?php
namespace App\Services;

use Illuminate\Support\Facades\Http;

class ResponseService
{
    public function request($code, $response, $message)
    {
        return [
            'code' => $code,
            'response' => $response,
            'message' => $message
        ];
    }
}