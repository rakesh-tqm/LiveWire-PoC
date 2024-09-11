<?php

namespace App\Livewire\Quote;

use App\Services\CurlService;
use Livewire\Component;
use Illuminate\Pagination\LengthAwarePaginator;
use Livewire\WithPagination;
use App\Livewire\Brand\Index as BrandIndex;
use App\Livewire\Quote\Create as QuoteCreate;



class Index extends Component
{
    use WithPagination;

    protected $bcCustomerId = 2;
    protected $storeId = '3gch1lz';
    protected $brand = false;
    protected $page=1;
    // protected $paginationTheme = 'bootstrap';
    public $search = '';

    public function boot(CurlService $curl)
    {
        if ($this->brand !== true) {
            $curlData = [];
            $curlData['headers'] = '';
            $curlData['body'] = [
                'user_id' => $this->bcCustomerId,
                'store_id' => $this->storeId,
                'page' => $this->page
            ];
            $url = env('APP_API_URL') . 'apibcquotes/view-business-setting';
            $response = $curl->get($url, $curlData);
            // dd($response);

            if (!(isset($response['response']['id']) && !empty($response['response']['id']))) {
                $this->redirect(BrandIndex::class, navigate: true);
            } else {
                $this->brand = true;
            }
        }
    }

    public function render(CurlService $curl)
    {

        $curlData = [];
        $curlData['headers'] = '';
        $curlData['body'] = [
            'user_id' => $this->bcCustomerId,
            'store_id' => $this->bcCustomerId,
            'page' => $this->page
        ];
        $url = env('APP_API_URL') . 'apiquotelivewire/get-quote-table/' . $this->bcCustomerId;

        if(!empty($this->search)){
            $curlData['body']['search'] = $this->search;
        } else {
            unset($curlData['body']['search']);
        }
        $response = $curl->get($url, $curlData);

        $quotes = new LengthAwarePaginator($response['data'], $response['total'], $response['per_page'], $this->page, [
            'path' => LengthAwarePaginator::resolveCurrentPath(),
        ]);

        return view('livewire.quote.index',[
            'quotes' => $quotes
        ]);
    }

    public function gotoPage($request){
        $this->page = $request;
    }

    public function nextPage(){
        $this->page = $this->page + 1;
    }

    public function previousPage(){
        $this->page = $this->page - 1;
    }

    public function create(){
        $this->redirect(QuoteCreate::class, navigate: true);
    }
}

