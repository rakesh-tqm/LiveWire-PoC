@props(['class'])
<thead {{$attributes}} class="bg-gray-200{{ isset($class) ? " ".$class : "" }}">
    {{$slot}}
</thead>