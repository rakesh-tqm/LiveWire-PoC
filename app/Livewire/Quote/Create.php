<?php

namespace App\Livewire\Quote;

use Livewire\Component;
use App\Services\CurlService;
use App\Livewire\Quote\Index as QuoteIndex;
use Livewire\Attributes\Validate;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class Create extends Component
{
    public $loading= true;
    protected $listeners = ['nestedComponentLoaded', 'updateProductSelction'];

    protected $bcCustomerId = 2;
    protected $storeId = '3gch1lz';
    protected $quote = [];
    protected $brand = [];
    
    public $category = [];
    public $categoryProducts = [];
    public $productsDetail = [];
    public $groupDiscount = [];
    public Collection $productSelection;

    #[Validate]
    public $title = 'title';
    #[Validate]
    public $name;
    #[Validate]
    public $email;
    #[Validate]
    public $phone;
    #[Validate]
    public $street1;
    #[Validate]
    public $street2;
    #[Validate]
    public $city;
    #[Validate]
    public $state;
    #[Validate]
    public $pincode;
    #[Validate]
    public $country = "US";
    #[Validate]
    public $paymentterm;
    #[Validate]
    public $termcondition;

    public $defaultProductImg;

    public function mount ()
    {
        $this->defaultProductImg = Storage::disk('public')->url('default-images/index.jpeg');
        $this->productSelection = collect();
        $this->productSelection->push(['qty' => 1,'category'=>null, 'product'=>null, 'image'=>null]);
    }

    public function boot()
    {
        try {
            $curl = new CurlService();
            $curlData = [];
            $curlData['headers'] = '';
            $curlData['body'] = [
                'store_id' => $this->storeId,
                'category_id' => env($this->storeId . "_CATEGORY"),
                'users_id' => $this->bcCustomerId,
            ];
            $url = env('APP_API_URL') . 'apibcquotes/create-quote';
            $response = $curl->get($url, $curlData);
    
            $this->quote = $response['response']['quote_model'];
            $this->brand = $response['response']['brand_setting'];
            $this->category = $response['response']['category'];
            $this->groupDiscount = $response['response']['group_discount'];
    
            $this->paymentterm = $this->brand['payment_terms'];
            $this->termcondition = $this->brand['term_condition'];
        } catch (\Throwable $th) {
            //throw $th;
        }
    }

    public function render()
    {
        return view('livewire.quote.create',[
            "quote"=>$this->quote,
            "brand"=>$this->brand,
            "category"=>$this->category,
            "groupDiscount"=>$this->groupDiscount,
        ]);
    }

    public function back(){
        $this->redirect(QuoteIndex::class, navigate: true);
    }

    public function rules()
    {
        return [
            'title' => ['required','min:5'],
            'name'=>['required'],
            'email'=>['required','email:filter,rfc,spoof'],
            'phone'=>['required'],
            'street1'=>['required'],
            'street2'=>['required'],
            'city'=>['required'],
            'state'=>['required'],
            'pincode'=>['required','regex:/^\d{5}(?:[-\s]\d{4})?$/'],
            'country'=>['required'],
            'paymentterm'=>['required'],
            'termcondition'=>['required']
        ];
    }

    public function messages() 
    {
        return [
            'title.required' => 'The :attribute can not be empty.',
            'title.min' => 'The :attribute is too short. Atleast 5 characters are required.',
            'name.required' => 'The :attribute can not be empty.',
            'email.required' => 'The :attribute can not be empty.',
            'email.email' => 'The :attribute is not valid.',
            'phone.required' => 'The :attribute can not be empty.',
            'street1.required' => 'The :attribute can not be empty.',
            'street2.required' => 'The :attribute can not be empty.',
            'city.required' => 'The :attribute can not be empty.',
            'state.required' => 'The :attribute can not be empty.',
            'pincode.required' => 'The :attribute can not be empty.',
            'pincode.regex' => 'The :attribute is not valid.',
            'country.required' => 'The :attribute can not be empty.',
            'paymentterm.required' => 'The :attribute can not be empty.',
            'termcondition.required' => 'The :attribute can not be empty.',
        ];
    }
 
    public function save()
    {
        sleep(5);
        $this->validate();
    }

    public function updatedProductSelection($value, $key)
    {
        $keyData = explode(".",$key);
        $index = $keyData[0];
        $input = $keyData[1];

        if($input == "category"){
            self::getProucts($index, $value);
        } else if($input == "product"){
            self::getProuctDetail($index, $value);
        }

        $this->dispatch('productSelection', $this->productSelection);
    }

    private function getProuctDetail($index, $productId){
        if(!array_key_exists($productId, $this->productsDetail) && $productId != ""){
            try {
                $curl = new CurlService();
                $curlData = [];
                $curlData['headers'] = '';
                $curlData['body'] = [
                    'store_id' => $this->storeId,
                    'product_id' => $productId,
                ];
                $url = env('APP_API_URL') . 'apibcquotes/get-product';
                $result = $curl->get($url, $curlData);
    
                if($result['code'] == 200){
                    $productdetail = $result['response'];
                    $this->productsDetail[$productId] = $productdetail;
                    
                    $this->productSelection->transform(function ($item, $key) use($index, $productdetail) {
                        if($key == $index){
                            $item['image'] = self::getProductDefaultImage($productdetail['images']);
                            $item['base_price'] = $productdetail['calculated_price'];
                            $item['total_price'] = $productdetail['calculated_price'];
                        }
                        return $item;
                    });


                }
            } catch (\Throwable $th) {
                //
            }
        }

    }

    private function getProductDefaultImage($imagesArray){
        if(isset($imagesArray) && !empty($imagesArray)){
            $imageArr = array_search('1', array_column($imagesArray, 'is_thumbnail'));
            if(!isset($imageArr) && empty($imageArr)){
                $imageArr = array_shift($imagesArray);
            }
            return $imagesArray[$imageArr]['url_standard'];
        } else {
            return $this->defaultProductImg;
        }

    }

    private function getProucts($index, $categoryId)
    {
        if(!array_key_exists($categoryId, $this->categoryProducts) && $categoryId != ""){
            try {                
                $curl = new CurlService();
                $curlData = [];
                $curlData['headers'] = '';
                $curlData['body'] = [
                    'store_id' => $this->storeId,
                    'category_id' => $categoryId,
                ];
                $url = env('APP_API_URL') . 'apibcquotes/get-products';
                $result = $curl->get($url, $curlData);
    
                if($result['code'] == 200){
                    $this->categoryProducts[$categoryId] = $result['response'];
                }
            } catch (\Throwable $th) {
                //
            }
        }
    }
    
    public function addmore()
    {
        $this->productSelection->push(['qty' => 1, 'category' => null, 'product' => null, 'image'=>null]);
    }

    public function removerow($key)
    {
        $this->productSelection->pull($key);
    }

    #[on('nestedComponentLoaded')]
    public function nestedComponentLoaded($hideShow)
    {
        // Add any logic you need
        $this->loading = $hideShow;
    }
    #[on('updateProductSelction')]
    public function updateProductSelction($updated)
    {
        $this->productSelection = collect($updated);
    }
}