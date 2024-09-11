<?php
if (!function_exists('auto_version ')) {
    function auto_version($file)
    {
        if (!file_exists(public_path() . "/" . $file)) {
            return $file;
        }

        $mtime = filemtime(public_path() . "/" . $file);
        return preg_replace('{\\.([^./]+)$}', ".$mtime.\$1", asset($file));
    }

    function pd($obj, $string = "")
    {

        if ($obj instanceof Collection || $obj instanceof \App\Models\ValData) {
            echo "<pre>";
            echo $string;
            print_r($obj->toArray());
        } else if (is_array($obj) || is_object($obj)) {
            echo "<pre>";
            echo $string;
            print_r($obj);
        } else {
            echo "<pre>";
            echo $string . $obj;
        }
        die;
    }

    function pr($obj, $string = "")
    {
        if ($obj instanceof Collection || $obj instanceof \App\Models\ValData) {
            echo "<pre>";
            echo $string;
            print_r($obj->toArray());
        } else if (is_array($obj) || is_object($obj)) {
            echo "<pre>";
            echo $string;
            print_r($obj);
        } else {
            echo "<pre>";
            echo $string . $obj;
        }
    }
}

if (!function_exists('price_format ')) {
    function price_format($amount, $curr = "$", $decimal = 2)
    {
        $number = $curr . " " . number_format((float) $amount, $decimal, '.', '');

        $formatter = new NumberFormatter('en_us', NumberFormatter::CURRENCY);
        return $formatter->formatCurrency((float) $amount, 'USD');
    }
}

