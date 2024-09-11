@props(['class'])
<th {{$attributes}} class="border border-stone-500{{ isset($class) ? " ".$class : "" }}">
    {{$slot}}
</th>