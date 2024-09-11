@props(['class'])
<tr {{$attributes}} class="{{ isset($class) ? " ".$class : "" }}">
    {{$slot}}
</tr>