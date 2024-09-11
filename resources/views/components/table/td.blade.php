@props(['class'])
<td {{$attributes}} class="border border-stone-500{{ isset($class) ? " ".$class : "" }}">
    {{$slot}}
</td>