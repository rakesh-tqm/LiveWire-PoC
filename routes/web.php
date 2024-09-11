<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

use App\Livewire\Quote\{Index as QuoteIndex, Create as QuoteCreate};
use App\Livewire\Brand\{Index as BrandIndex};

Route::get('/', QuoteIndex::class);
Route::get('/create', QuoteCreate::class);
Route::get('/brand', BrandIndex::class);
