
<?php  
    if(isset($_GET['tipus'])) {
        $tipus = $_GET['tipus'];
        $url = 'https://www.celestrak.com/NORAD/elements/';
        $url = $url . $tipus;
        $url = $url . '.txt';
        echo file_get_contents($url);
    }
?>