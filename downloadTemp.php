<?php  
    if(isset($_GET['id'])) {
        $id = $_GET['id'];
        $url = 'https://celestrak.org/NORAD/elements/supplemental/sup-gp.php?CATNR=';
        $url = $url . $id;
        $url = $url . '&FORMAT=tle';
        echo file_get_contents($url);
    }
?>