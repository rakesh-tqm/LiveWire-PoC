<?php

namespace App\Livewire\Quote;

use Livewire\Component;

class ProductDetail extends Component
{
    public $product;

    public function render()
    {
        return view('livewire.quote.product-detail');
    }

    public function productCustomize(){
        $this->dispatch('nestedComponentLoaded', true);
        $this->dispatch('toggleSlideOver', $this->product);
    }
}
