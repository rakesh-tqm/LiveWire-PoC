<div x-data="{ open: @entangle('isOpen') }" class="relative z-10" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
    <div x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100" x-transition:leave="transition ease-in duration-300" x-transition:leave-start="opacity-100" x-transition:leave-end="opacity-0" x-show="open" >
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        <div class="fixed inset-0 overflow-hidden">
        <div class="absolute inset-0 overflow-hidden">
            <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div class="pointer-events-auto relative w-screen max-w-md">
                <div class="absolute left-0 top-0 -ml-8 flex pr-2 pt-4 sm:-ml-10 sm:pr-4" @click="open = false">
                <button type="button" class="relative rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white">
                    <span class="absolute -inset-2.5"></span>
                    <span class="sr-only">Close panel</span>
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                </div>

                <div class="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                <div class="px-4 sm:px-6">
                    <h2 class="text-base font-semibold leading-6 text-gray-900" id="slide-over-title">{{$productArr['name']??""}}</h2>
                </div>
                <div class="relative mt-6 flex-1 px-4 sm:px-6">
                    @if(isset($productArr['variant_option']) && !empty($productArr['variant_option']))
                    @foreach($productArr['variant_option'] as $key => $value)
                        <div class="mb-4 border border-gray-300 rounded">
                            <button wire:click="toggleSection({{ $key }})" class="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 focus:outline-none">
                                {{ $value['display_name'] }}
                            </button>
                            <div wire:key="section-{{ $key }}" class="{{ $openSection === $key ? 'block' : 'hidden' }} px-4 py-2">
                                @if($value['type'] == "swatch")
                                    @foreach($value['variant_option_value'] as $subindex=>$variantinfovalue)
                                        @php
                                            $optionValue = json_decode($variantinfovalue['value_data'], true);
                                        @endphp
                                        
                                        @if(isset($optionValue['image_url']) && !empty($optionValue['image_url'])) 
                                            <div class="caps toggle-element2" wire:click='addOptions({{$value['id']}},{{$variantinfovalue['id']}})'>
                                                <img src="{{$optionValue['image_url']}}" onerror="this.src={{$defaultProductImg}}" class="img-fluid rounded" alt="dummy">
                                                <p class="text-center">{{$variantinfovalue['label']}}</p>
                                            </div>
                                        @else
                                            <div class="caps toggle-element2" wire:click='addOptions({{$value['id']}}, {{$variantinfovalue['id']}})'>
                                                <span class="img-fluid rounded" style="display: flex; border:1px solid black; height:100px; width:100px; background-color:{{$optionValue['colors'][0]}}" title="{{$variantinfovalue['label']}}"></span>
                                                <p class="text-center">{{$variantinfovalue['label']}}</p>
                                            </div>
                                        @endif
                                    @endforeach
                                @elseif($value['type'] == "dropdown" || $value['type'] == "checkbox")
                                    @foreach($value['variant_option_value'] as $subindex=>$variantinfovalue)
                                        <div class="caps toggle-element number-elements" wire:click='addOptions({{$value['id']}}, {{$variantinfovalue['id']}})'>{{$variantinfovalue['label']}}</div>
                                    @endforeach
                                @elseif($value['type'] == "text" || $value['type'] == "numbers_only_text" || $value['type'] == "multi_line_text")
                                    <input type="text" class="form-control toggle-element" wire:change='addOptions({{$value['id']}}, $event.target.value)'/>
                                @else
                                    NOT CONFIGURED
                                @endif
                            </div>
                        </div>
                    @endforeach
                    @endif
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>
    </div>
</div>
