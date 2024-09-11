<?php

namespace App\Livewire\Quote;

use Livewire\Component;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class Customize extends Component
{
    
    public $isOpen = false;
    public $loading = false;
    public $key;

    public Collection $productSelection;

    public $productArr;
    public $openSection = null;
    public $defaultProductImg;

    protected $listeners = ['toggleSlideOver', 'productSelection'];

    public function mount(){
        $this->defaultProductImg = Storage::disk('public')->url('default-images/index.jpeg');
    }

    public function render()
    {
        return view('livewire.quote.customize');
    }

    #[On('toggleSlideOver')]
    public function toggleSlideOver($product)
    {
        $this->openSection = null;
        $this->productArr = $product;
        $this->isOpen = !$this->isOpen;
    }

    public function rendered(){
        $this->loading = false;

        if(isset($this->productArr) && !empty($this->productArr)){
            $this->productSelection->map(function($item, $key){
                if($item['product'] == $this->productArr['id'])
                    $this->key = $key;
            });
        }

        $this->dispatch('nestedComponentLoaded', $this->loading);
    }

    public function toggleSection($index)
    {
        $this->openSection = $this->openSection === $index ? null : $index;
    }

    #[on('productSelection')]
    public function productSelection($updatedData){
        $this->productSelection = collect($updatedData);

    }

    public function addOptions($variantId, $variantValue){
        $this->productSelection->transform(function($value, $key) use($variantId, $variantValue){
            if($key == $this->key){
                $varintInfo = collect($this->productArr['variant_option'])->sole('id', $variantId);
                $data['id'] = $varintInfo['id'];
                $data['option'] = $varintInfo['variant_option_id'];

                if(!in_array($varintInfo['type'], ['text', 'numbers_only_text', 'multi_line_text'])){
                    $varintOptionInfo = collect($varintInfo['variant_option_value'])->sole('id', $variantValue);

                    $data['value_id'] = $varintOptionInfo['id'];
                    $data['option'] = $data['option']."_".$varintOptionInfo['variant_option_value_id'];
                    $data['selected_option'] = $varintOptionInfo["label"];

                } else {
                    $data['input_text_value'] = $variantValue;
                }
                
                if($varintInfo['options_type'] == "MODIFIERS"){
                    $data['display_name']   = $varintInfo["name"];
                    $data['price']          = 0;
                    $data['price_type']     = NULL;
                    if(isset($varintInfo['adjusters']) && !empty($varintInfo['adjusters'])){
                        $data['price'] = $varintInfo['adjusters']['price']["adjuster"];
                        $data['price_type'] = $varintInfo['adjusters']['price']["adjuster_value"];
                    }
                }
                
                $value[strtolower($varintInfo['options_type'])][$varintInfo['sort_order']] = $data;
                $value['bulkpricing'] = $this->productArr['bulkpricing'];
            }
            return $value;
        });
        dump($this->productSelection);
        $this->dispatch('updateProductSelction', $this->productSelection);
    }
}
