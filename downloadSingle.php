
<?php  
    if(isset($_GET['id'])) {
        $id = $_GET['id'];
        $url = 'https://celestrak.org/NORAD/elements/gp.php?CATNR=';
        $url = $url . $id;
        echo file_get_contents($url);
    }
?>