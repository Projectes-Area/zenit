// protegir.js
(function() {
    'use strict';
    
    // Prevenir botó dret
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
    
    // Prevenir tecles d'inspecció
    document.addEventListener('keydown', function(e) {
        // F12
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
        }
        
        // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
        if (e.ctrlKey && e.shiftKey) {
            if (e.key === 'I' || e.keyCode === 73 ||
                e.key === 'J' || e.keyCode === 74 ||
                e.key === 'C' || e.keyCode === 67) {
                e.preventDefault();
            }
        }
        
        // Ctrl+U
        if (e.ctrlKey && (e.key === 'U' || e.keyCode === 85)) {
            e.preventDefault();
        }
        
        // Ctrl+Shift+K (Firefox)
        if (e.ctrlKey && e.shiftKey && (e.key === 'K' || e.keyCode === 75)) {
            e.preventDefault();
        }
    });
    
    // Detectar eines
    setInterval(() => {
        const before = new Date();
        debugger;
        const after = new Date();        
        if (after - before > 100) {
            location.reload();
        }
    }, 2000);
})();