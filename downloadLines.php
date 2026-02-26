
<?php  
    if(isset($_GET['tipus'])) {
        $tipus = $_GET['tipus'];
        $url = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=';
        $url = $url . $tipus;
        echo file_get_contents($url);
    }
?>