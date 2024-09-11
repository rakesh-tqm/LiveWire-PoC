@props(['name'])
 
<textarea name="{{ $name }}" id="{{$name}}" autocomplete="off" {{ $attributes }} class="pt-3 pb-2 block w-full px-0 mt-0 bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 focus:border-black border-gray-200"></textarea>

<div>
    @error($name) <span class="error">{{ $message }}</span> @enderror
</div>