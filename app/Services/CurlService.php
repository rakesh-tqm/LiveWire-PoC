<?php
namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class CurlService {
	public function post($url, $options = [], $type = "PMEAPI") {

		$headers = $options['headers'];

		$body = $options['body'] ?? null;
		if ($type == "PMEAPI12") {
			$apiToken = Cache::store('database')->get('api-token');
			$response = Http::withToken($apiToken)->post($url, $body, ['headers' => $headers]);
		} else {
			$response = Http::post($url, $body,
				['headers' => $headers]
			);
		}

		if ($response->successful()) {
			return $responseData = $response->json();
		} else {
			$errorCode = $response->status();
			$errorReason = $response->body();
		}

		return $response->json();
	}
	public function get($url, $options = []) {
		$headers = $options['headers'];
		$body = $options['body'] ?? null;

		$response = Http::get($url, $body, ['headers' => $headers]);

		$response->throwUnlessStatus(200);

		return $responseData = $response->json();
	}
	
	public function put($url, $options = [], $type = "PMEAPI") {
		$headers = $options['headers'];
		$body = $options['body'] ?? null;
		if ($type == "PMEAPI") {
			$apiToken = Cache::store('database')->get('api-token');
			$response = Http::withToken($apiToken)->put($url, $body, ['headers' => $headers]);
		} else {
			$response = Http::put($url, $body, ['headers' => $headers]);
		}

		if ($response->successful()) {
			return $responseData = $response->json();
		} else {
			$errorCode = $response->status();
			$errorReason = $response->body();
		}

		return $response->json();
	}
	public function delete($url, $options = [], $type = "PMEAPI") {
		$headers = $options['headers'];
		$body = $options['body'] ?? null;

		if ($type == "PMEAPI") {
			$apiToken = Cache::store('database')->get('api-token');
			$response = Http::withToken($apiToken)->delete($url, $body);
		} else {
			$response = Http::delete($url, $body);
		}

		if ($response->successful()) {
			return $responseData = $response->json();
		} else {
			$errorCode = $response->status();
			$errorReason = $response->body();
		}

		return $response->json();
	}

	function postViaCurl($url, $options = []) {

		$method = $options['method'];
		$headers = $options['headers'];

		if (isset($headers) && !empty($headers) && is_array($headers)) {
			$headersArr = $headers;
			$headers = [];
			foreach ($headersArr as $key => $header) {
				$headers[] = $key . ':' . $header;
			}
		}

		$postData = $options['body'] ?? null;

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_ENCODING, "");
		curl_setopt($ch, CURLOPT_MAXREDIRS, 5);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 0);
		curl_setopt($ch, CURLOPT_TIMEOUT, 300);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
		curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
		curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		$response = curl_exec($ch);
		$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

		curl_close($ch);
		return $response;

	}
}
