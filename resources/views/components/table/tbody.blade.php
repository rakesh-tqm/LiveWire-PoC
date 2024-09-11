@props(['class'])
<tbody {{$attributes}} class="border border-stone-500{{ isset($class) ? " ".$class : "" }}">
    {{$slot}}
</tbody>