@props(['class'])
<table {{$attributes}} class="table-auto border-collapse border border-grey-500{{ isset($class) ? " ".$class : "" }}">
    {{$slot}}
</table>