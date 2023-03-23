var container,  container2, content, content2, camera, camera2D, scene, renderer;
var meshTerra, llegenda, discs, bateria, orbita, tauler, mapa2D;
var omegaSat, periodeSat, aOrbita, bOrbita, eOrbita, pOrbita;
var angleInclinacio;
var vEsferic;
var geometrySat, geometryLink3D, materialLink3D, materialOrbita, geometryEstacio, geometryEstacio3D, materialEstacio3D;
var textPeriode;
var grupMon;
var arrowHelper, axesHelper, plaEquatorial, plaOrbita;
var folder1,folder3,folder4;
var quaternionTerra;
var estacio3D=[];
var link2D=[];
var link3D=[];
var posLink3D=[];
var proximitat=[];
var zonaProx=[];
var maxSat=1;
var maxOrb=1;
var sat3D=[];
var grupSat=[];
var angleEscombrat=[];
var app;
var puntSat=[];
var puntEstacio=[];
var puntZona=[];
var tros=[];
var appExploracio;
var mapa=[];
var capa=[];
var sensor=[];
var sensorsIniciats=false;
var numSensors=0;
var angleRotTerra=0;
var estat=0; // 0-no_assignada // 1-assignada  // 2-iniciada

// CONSTANTS TERRA            
const MU=398694790080000; // G * massa de la Terra, S.I.
const rTerra=6458428; // radi de l'esfera terrestre, metres
const segonsDia=23*3600+56*60+4; // nombre de segons que té un dia
const omega=2*Math.PI/segonsDia; // freqüencia angular de rotació de la Terra entorn al seu eix, rad/s
const angleTerra=0 //23.4369*Math.PI/180; // angle d'inclinació de l'eix terrestre, rad
const omegaSol=omega/365.256363; // freqüencia angular de translació de la Terra entorn al Sol, rad/s

// CONSTANTS SIMULACIÓ
const maxPointsGraph = 8192; // màxim de punts en les gràfiques
const shiftCount=1;	// al cap de quants renderings s'agafa un punt de la trajectòria
const midaSatelit=0.04; // escala d'ampliació del OBJ del satèl·lit
const stepAngle=1; // al cap de quants graus es considera un nou punt en la zona de proximitat
const ample = 0.5;
const ampleRight = 0.5;
const radiPunt=4;
const midaMapa=256;
const midaQuadre=16;

// CONSTANTS DESPESA DISC I BATERIA
const ritmeDiscTransfer=0.02;

//const ritmeBateriaDiscs=0;//-0.05;
const ritmeBateriaTransfer=-0.01;
const ritmeBateriaPanell=0.01;

// VARIABLES DE SIMULACIÓ	
var ambWebgl; // el navegador suporta WebGL			
var temps, previousTime, interval; // en segons
var count; // comptador de punts en la trajectòria
var countGraph; // comptador de punts en les gràfiques
var steps; // comptador de renderings
var enPausa = true; // animació
var dintre = []; // dins de la zona de proximitat
var dintreZona = []; // dins de la zona d'estudi
var ambLlum = true; // fora de la zona d'ombra
var maxCountGraph; // nombre de punts necessaris en les gràfiques per representar un dia sencer
var diaSencer; // ha transcorregut més d'un dia sencer (boolean)
var nivellDiscs; // espai d'emmagatzematge de dades sense ocupar (%)
var nivellBateria; // nivell de càrrega de les bateries (%)
var vectorLlum; // vector amb origen al Sol i final a la Terra (unitari)
var longitudAnterior; // en el traçat de la trajectòria, longitud del satèl·lit 2D en l'anterior rendering
var dragging=false; // arrossegant un element del mapa
var dragEstacio; // arrossegant una estació de seguiment (i no una zona d'estudi)
var angleLatEstacio=[]; // array de latituds de les estacions
var angleLonEstacio=[]; // array de longituds de les estacions
angleLatEstacio[0]=41*Math.PI/180; // latitud inicial de l'estació per defecte
angleLonEstacio[0]=2*Math.PI/180; // longitud inicial de l'estació per defecte
var angleLatZona=[]; // array de latituds de les zones d'estudi
var angleLonZona=[]; // array de longituds de les zones d'estudi
angleLatZona[0]=-50*Math.PI/180; // latitud inicial de la zona d'estudi per defecte
angleLonZona[0]=-90*Math.PI/180; // longitud inicial de la zona d'estudi per defecte
var numEstacions=1; // nombre actual d'estacions
var numZones=1; // nombre actual de zones d'estudi
var satMin=1; // distància mínima entre el centre de la Terra i el Satèl·lit (en referència a 1, radi de la Terra)
var botoIniciar;
var estil;
var botoMissio;
var origenX, finalX, origenY, finalY;
var app;
var ritmeDisc = 0;
var ritmeBateria = 0;
var centreMapaX = midaMapa; //window.innerWidth * ampleRight / 2;
var centreMapaY = 600; //window.innerHeight/ 2 + midaMapa;

// SENSORS
var row_sen=[];
var potSensors=0;
var disSensors=0;	
var totalPot=0;
var totalDis=0;

var temps_exploració;
var gigues_transferits = 0;
var zonesTotal;
var gui;
var ciutats = ["Barcelona", "Cap Canaveral", "Sydney", "Pol nord", "Johannesburg", "Punta Arenas","Iakutsk"];
ciutats_lat = [41.39, 28.40, -33.87, 90, -26.21, -53.16, 62.03];
ciutats_lon = [2.16, -80.61, 151.21, 0, 28.05, -70.91, 129.73];

function initGUI() {
    var menuDiv = document.getElementById('dat');
    gui = new dat.GUI({autoPlace: false, width:250});
    menuDiv.appendChild( gui.domElement );
    folder1 = gui.addFolder( 'ÒRBITA DEL SATÈL·LIT' );
    folder1.add( parametres, "infoParametres").name("Elements orbitals");
    folder1.add( parametres, "longitud", 0, 360, 0.01 ).name("L. node ascendent").onChange( canviaParametres );
    folder1.add( parametres, "inclinacio", 0, 180, 0.01 ).name("Inclinació").onChange( canviaParametres );
    folder1.add( parametres, "argPerigeu", 0, 360, 0.01 ).name("Arg. del perigeu").onChange( canviaParametres );
    folder1.add( parametres, "aOrbita", satMin*rTerra/1000, 50000, 1 ).name("Semieix major").onChange( canviaSemieix );
    folder1.add( parametres, "excentricitat", 0, 1-satMin*rTerra/parametres.aOrbita/1000, 0.00001 ).name("Excentricitat").onChange( canviaExcentricitat );
    folder1.add( parametres, "anomalia", 0, 360, 0.01 ).name("Anomalia veritable").onChange( canviaAnomalia );
    textPeriode=folder1.add( parametres, "display").name("PERÍODE");
    textPeriode.domElement.childNodes[0].setAttribute("disabled", "true");    
    folder1.add( parametres, "ERA", 0, 360, 0.01).name("Angle rotació Terra").onChange(canviaParametres);
    folder3 = gui.addFolder( 'SIMULACIÓ' );	
    botoIniciar = folder3.add( parametres, "pausa").name("I N I C I A");
    estil = botoIniciar.domElement.previousSibling.style;
        
    folder3.add( parametres, "velAnimacio",1,10,1).name("Velocitat d'animació"); //.onChange( canviaParametres );
    folder3.add( parametres, "veureEixos").name("Mostra eixos i plans").onChange( veureEixos );
    
    var guiDret = new dat.GUI({width:250});
    var folder5 = guiDret.addFolder( 'MISSIÓ' );
    //folder5.add( parametres, "infoSatelit").name("Satèl·lit");
    folder5.add( parametres, "infoInstruccions").name("Instruccions");		
    //folder5.add( parametres, "infoMissions").name("Missions");						
    botoMissio = folder5.add( parametres, "selMissio").name("Assignació de missió");	
    estil_missio = botoMissio.domElement.previousSibling.style;				
    folder5.open();	
    //$('.ul .close-button').html("Plega/desplega panell");	
    folder4 = guiDret.addFolder( 'EQUIPAMENT DEL SATÈL·LIT' );
    folder4.add( parametres, "infoSensors").name("Sensors");
    folder4.add( parametres, "panells", 1, 5, 1 ).name("Panells solars");
    folder4.add( parametres, "discs", 1, 5, 1 ).name("Unitats de disc"); // disc de 100 GB           
}

init();
function init() {
    // PARÀMETRES DE SIMULACIÓ
    parametres = {
        longitud: 0, // de l'òrbita del satèl·lit, graus
        inclinacio: 20, // de l'òrbita del satèl·lit, graus
        argPerigeu: 0, // argument del perigeu, graus
        aOrbita: 10000, // semieix major de l'òrbita el·líptica, km
        excentricitat: 0, // excentricitat de l'òrbita (entre 0 i 1)
        anomalia:0, // anomalia veritable, graus
        ERA:0,
        nSat:1, // quantitat de satèl·lits a l'òrbita
        nOrb:1, // quantitat d'òrbites
        radiProximitat: 2000, // radi de la zona de proximitat a l'estació, km
        radiZona: 5000, // radi de la zona d'estudi, km
        afegirEstacio: botoAfegirEstacio,
        eliminarEstacio: botoEliminarEstacio,
        afegirZona: botoAfegirZona,
        eliminarZona: botoEliminarZona,
        mapa2D: 'mapa_fisic_silueta.png', // fitxer de textura del mapa
        mapa3D: '8k_earth_daymap.jpg', // fitxer de textura del mapa
        veureEixos: true, // veure o no els eixos i plans
        velAnimacio: 1, // velocitat de l'animació
        display : '', // visualitzador del període del satèl·lit.
        pausa: botoPausa, // botó per pausar o reprendre la simulació
        infoSensors: botoInfoSensors, // finestra modal amb informació sobre els sensors
        infoMissions: botoInfoMissions, // finestra modal amb informació sobre els sensors					
        selMissio: botoSelMissio, //selecciona una missió
        infoParametres: botoInfoParametres, //Presenta la inforació dels paràmetres configurables del simulador
        infoInstruccions: botoMostraInstruccions,
        panells: 1, 
        discs:1,
        cameres: 1,
        radars: 1
    };

    container = document.getElementById( 'content' );
    container2 = document.getElementById( 'content2' );
    // CÀMERA
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.up.set(0,0,1);
    camera.position.x = 8; // red
    camera.position.y = -8; // green
    camera.position.z = 1; // blue

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x131313 );

    // LLUM
    var ambientLight = new THREE.AmbientLight( 0xfffffff ); // 10%
    scene.add(ambientLight);

    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1);
    
    vectorLlum=new THREE.Vector3(-1,0,0);
    directionalLight.position.set(-vectorLlum.x, -vectorLlum.y, -vectorLlum.z);
    directionalLight.castShadow=true;
    scene.add( directionalLight ); 
    
    // EIXOS DE COORDENADES
    axesHelper = new THREE.AxesHelper(1.1);
    scene.add( axesHelper );				

    // EIX TERRA
    var dir = new THREE.Vector3(0,Math.sin(angleTerra),Math.cos(angleTerra));
    var origin = new THREE.Vector3( 0, 0, 0 );
    arrowHelper = new THREE.ArrowHelper( dir, origin, 1.1, 0x555555, 0.075, 0.05);
    scene.add( arrowHelper );

    // TERRA I MAPA 2D
    canviaMapa();

    // SATÈL·LIT 3D
    grupMon=new THREE.Group();
    var manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {					
        for(s=0;s<maxOrb;s++) {
            grupSat[s]=new THREE.Group();
            grupMon.add(grupSat[s]);
        }
        canviaParametres();
        animate();
    };
    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
        }
    };
    var onError = function ( xhr ) {
    };
    var loader = new THREE.OBJLoader( manager );
    loader.load( 'imatges/sat.obj', function ( object ) {
        object.traverse( function ( child ) {
            if ( child instanceof THREE.Mesh ) {
                child.material=new THREE.MeshStandardMaterial( { color: 0x565758, overdraw: true} );
                child.receiveShadow = true;
            }
        } );
        object.scale.set(midaSatelit,midaSatelit,midaSatelit);
        for(s=0;s<maxOrb;s++) {
            sat3D[s]=[];
            for(i=0;i<maxSat;i++) {							
                sat3D[s][i]=object.clone();
            }
        }					
    }, onProgress, onError );				

    // ÒRBITA
    materialOrbita = new THREE.LineBasicMaterial( { color : 0xffffff } );
    var geometryOrbita = new THREE.BufferGeometry();
    orbita = new THREE.Line( geometryOrbita, materialOrbita );

    // PLA EQUATORIAL
    materialPlaEquatorial = new THREE.MeshPhongMaterial({color: 0xffff00, opacity: 0.5,transparent: true, side: THREE.DoubleSide});
    var geometryPlaEquatorial = new THREE.PlaneGeometry( 8, 8 );
    plaEquatorial = new THREE.Mesh( geometryPlaEquatorial, materialPlaEquatorial );
    scene.add(plaEquatorial);

    // PLA ÒRBITA
    materialPlaOrbita = new THREE.MeshPhongMaterial({color: 0xff0000, opacity: 0.5,transparent: true, side: THREE.DoubleSide});
    var geometryPlaOrbita = new THREE.PlaneGeometry( 8, 8 );
    plaOrbita = new THREE.Mesh( geometryPlaOrbita, materialPlaOrbita );

    // ESTACIÓ 3D
    materialEstacio3D = new THREE.MeshBasicMaterial( { color: 0xff0000} );
    geometryEstacio3D = new THREE.SphereGeometry( 0.02, 6, 6 );
    estacio3D[0] = new THREE.Mesh( geometryEstacio3D, materialEstacio3D );

    // MÓN
    grupMon.setRotationFromAxisAngle(new THREE.Vector3(1,0,0),-angleTerra);
    scene.add(grupMon);

    // RENDERER
    if (Detector.webgl) {
        ambWebgl=true;
        renderer = new THREE.WebGLRenderer();
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    } else {
        ambWebgl=false;
        renderer = new THREE.CanvasRenderer();
        console.log("WebGL no és compatible, renderitzant amb CanvasRenderer.");
        alert("Aquest navegador no és compatible amb WebGL,\nalgunes funcionalitats del simulador no estaran disponibles.");
    }
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth * ample, window.innerHeight );
    container.appendChild( renderer.domElement );
    app = new PIXI.Application({width: window.innerWidth * ampleRight, height: window.innerHeight});
    app.renderer.backgroundColor = 0x131313;
    container2.appendChild(app.view);	

    centreMapaX = window.innerWidth * ampleRight / 2;
    centreMapaY = window.innerHeight/ 2 + midaMapa-20;

    origenX=centreMapaX-240;
    finalX=centreMapaX+240;
    origenY=centreMapaY-260-midaMapa;
    finalY=centreMapaY+90-midaMapa;

    PIXI.loader
        .add("imatges/mapa_fisic.png")
        .add("imatges/mapa_fisic_silueta.png")
        .add("imatges/sat_punt.png")
        .add("imatges/estacio_punt.png")
        .add("imatges/zona_punt.png")
        .add("imatges/eixos2DNou.png")
        .add("imatges/llegenda2D.png")
        .add("imatges/8k_earth_daymap.jpg")
        .load(setup);
        function setup() {
            var silueta = new PIXI.Sprite(PIXI.loader.resources["imatges/mapa_fisic_silueta.png"].texture);
            silueta.x=centreMapaX-midaMapa;
            silueta.y=centreMapaY-midaMapa/2;
            app.stage.addChild(silueta);

            // TAULER DE GRÀFIQUES	

            var tauler = new PIXI.Sprite(PIXI.loader.resources["imatges/eixos2DNou.png"].texture);
            tauler.x = centreMapaX-257;
            tauler.y = centreMapaY-midaMapa-280;
            app.stage.addChild(tauler);

            var llegenda = new PIXI.Sprite(PIXI.loader.resources["imatges/llegenda2D.png"].texture);
            llegenda.x = centreMapaX-258;
            llegenda.y = centreMapaY-midaMapa-340;
            app.stage.addChild(llegenda);
    
            baseTx=PIXI.loader.resources["imatges/mapa_fisic.png"].texture;
            for(i=0;i<midaQuadre*2;i++){
                tros[i]=[];
                for(j=0;j<midaQuadre;j++) {
                    var rectangle = new PIXI.Rectangle(i*midaQuadre, j*midaQuadre, midaQuadre, midaQuadre);
                    texture = new PIXI.Texture(baseTx, rectangle);
                    tros[i][j]= new PIXI.Sprite(texture);
                    tros[i][j].x=centreMapaX - midaMapa + i * midaQuadre;
                    tros[i][j].y=centreMapaY - midaMapa/2 + j * midaQuadre;
                    tros[i][j].visible=false;
                    tros[i][j].interactive = true;
                    tros[i][j].buttonMode = true;
                    tros[i][j].on('pointerdown', function(e) {
                                    var i=(this.position.x+midaMapa-centreMapaX)/midaQuadre;
                                    var j=midaQuadre+(this.position.y-midaMapa/2-centreMapaY)/midaQuadre;
                                    mostraTros(i,j);
                                });
                    app.stage.addChild(tros[i][j]);
                }
            }

            baseHD=PIXI.loader.resources["imatges/8k_earth_daymap.jpg"].texture;	

            puntEstacio[0]=new PIXI.Sprite(PIXI.loader.resources["imatges/estacio_punt.png"].texture);
            puntEstacio[0].index=0;
            app.stage.addChild(puntEstacio[0]);
            puntZona[0]=new PIXI.Sprite(PIXI.loader.resources["imatges/zona_punt.png"].texture);
            puntZona[0].index=0;
            app.stage.addChild(puntZona[0]);
            mouEstacio(0);
            mouZona(0);

            for(i=0;i<maxSat;i++) {
                puntSat[i] = new PIXI.Sprite(PIXI.loader.resources["imatges/sat_punt.png"].texture);
                app.stage.addChild(puntSat[i]);
            }

            // UNITATS DE DISC I BATERIA
            discs =	new PIXI.Graphics();
            bateria = new PIXI.Graphics();

            botoMostraInstruccions();
    }	

    WIDTH=window.innerWidth * ampleRight;
    HEIGHT=window.innerHeight;
    
    var ratio = Math.min(WIDTH/(2*midaMapa), HEIGHT/(3.5*midaMapa));
    app.stage.position.set(WIDTH/2, HEIGHT/2);
    app.stage.scale.set(ratio, ratio);
    app.stage.pivot.set(WIDTH/2, HEIGHT/2);
                            
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    window.addEventListener( 'resize', onWindowResize, false );
    //window.addEventListener( 'focus', onFocus, false );

    for(k=1;k<6;k++) {
        //mapa[k] = L.map('mapa'+k,{zoomControl:false,scrollWheelZoom:false,dragging:false});
        mapa[k] = L.map('mapa'+k,{scrollWheelZoom:false,dragging:false});
    }
    $('#status').css('left', parseInt($('#content').css('width')) - parseInt($('#status').css('width')));

    initGUI();				
}

function mostraTros(i,j) {

    $("#finestraExploracio").css({"visibility":"visible"});
    $("#finestraExploracio").modal('show');
    for(k=1;k<6;k++) {
        $("#mapa"+k).css({"height":"400px"});
    }
    
    var latitud=90-180/midaQuadre*j-midaQuadre/2;
    var longitud=-180+360/(midaQuadre*2)*i+midaQuadre/2;
    $("#headerExploracio").html("Exploració de la zona (latitud:"+latitud+"°, longitud:"+longitud+"°)");

    for(k=1;k<6;k++) {
        mapa[k].eachLayer(function (layer) {
            mapa[k].removeLayer(layer);
        });
        $("#mapa"+k).hide();
        mapa[k].setView([latitud, longitud], 5);
    }

    var mapesOcupats=0;
    ocupaMapa(1,0,latitud,longitud); // Visible
    mapesOcupats++;
    if (sensor[1]||sensor[3]||sensor[5]) { // SAR, GNSS-R, LIDAR
        mapesOcupats++;
        ocupaMapa(mapesOcupats,1,latitud,longitud);
    }
    if (sensor[2]) { // Radiometer
        mapesOcupats++;
        ocupaMapa(mapesOcupats,2,latitud,longitud);
    }
    if (sensor[4]) { // GNSS-RO
        mapesOcupats++;
        ocupaMapa(mapesOcupats,3,latitud,longitud);
    }
    if (sensor[6]) { // HyperSpectral
        mapesOcupats++;
        ocupaMapa(mapesOcupats,4,latitud,longitud);
    }

    $('#finestraExploracio').on('shown.bs.modal', function(){
        setTimeout(function() {
            for(k=1;k<6;k++) {
                mapa[k].invalidateSize();
            }                  
        }, 2);
    });
}

function ocupaMapa(numMapa,sensor,latitud,longitud) {
    switch(sensor) {
    case 0: // Visible
        capa[numMapa] =  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri_WorldImagery'
        });
        capa[1].addTo(mapa[1]);
        break;
    case 1: // SAR, GNSS-R, LIDAR
        capa[numMapa] = L.tileLayer('https://map1.vis.earthdata.nasa.gov/wmts-webmerc/SRTM_Color_Index/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}', {
            attribution: 'GIBS / NASA / SRTM_Color_Index',
            bounds: [[latitud-30, longitud-30], [latitud+30, longitud+30]],
            minZoom: 1,
            maxZoom: 12,
            format: 'png',
            time: '',
            tilematrixset: 'GoogleMapsCompatible_Level'
        });
        capa[numMapa].addTo(mapa[numMapa]);					
        break;
    case 2: // Radiometer
        capa[numMapa] = L.tileLayer('https://map1.vis.earthdata.nasa.gov/wmts-webmerc/SMAP_L4_Soil_Temperature_Layer_1/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}', {
            attribution: 'GIBS / NASA / Soil_Temperature',
            bounds: [[latitud-30, longitud-30], [latitud+30, longitud+30]],
            minZoom: 1,
            maxZoom: 6,
            format: 'png',
            time: '',
            tilematrixset: 'GoogleMapsCompatible_Level'
        });
        capa[numMapa].addTo(mapa[numMapa]);
        break;
    case 3 : // GNSS-RO
        capa[numMapa] = L.tileLayer('https://map1.vis.earthdata.nasa.gov/wmts-webmerc/Particulate_Matter_Below_2.5micrometers_2010-2012/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}', {
            attribution: 'GIBS / NASA / Particulate_Matter_Below_2.5micrometers',
            bounds: [[latitud-30, longitud-30], [latitud+30, longitud+30]],
            minZoom: 1,
            maxZoom: 7,
            format: 'png',
            time: '',
            tilematrixset: 'GoogleMapsCompatible_Level'
        });
        capa[numMapa].addTo(mapa[numMapa]);
        break;
    case 4 : // HyperSpectral
        capa[numMapa] = L.tileLayer('https://map1.vis.earthdata.nasa.gov/wmts-webmerc/MODIS_Terra_NDVI_8Day/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}', {
            attribution: 'GIBS / NASA / MODIS_Terra_NDVI_8Day',
            bounds: [[latitud-30, longitud-30], [latitud+30, longitud+30]],
            minZoom: 1,
            maxZoom: 9,
            format: 'png',
            time: '2018-11-18',
            tilematrixset: 'GoogleMapsCompatible_Level'
        });
        capa[numMapa].addTo(mapa[numMapa]);
        break;
    } 
    $("#mapa"+numMapa).show();
}

function onFocus(){
    canviaParametres();
}

function onDragStartEst(evt) {
    this.data = evt.data;
    this.dragging = true;
    proximitat[this.index].clear();
}

function onDragMove(evt) {
    if (this.dragging)
    {
        var newPosition = this.data.getLocalPosition(this.parent);
        this.position.x = newPosition.x;
        this.position.y = newPosition.y;
    }
}

function onDragEndEst(evt) {
    this.dragging = false;
    angleLatEstacio[this.index]=(-puntEstacio[this.index].position.y+centreMapaY)*Math.PI/midaMapa;
    angleLonEstacio[this.index]=(puntEstacio[this.index].position.x-centreMapaX)*Math.PI/midaMapa;
    mouEstacio(this.index);
    this.data = null;
}

function onDragStartZona(evt) {
    this.data = evt.data;
this.dragging = true;
    zonaProx[this.index].clear();
}

function onDragEndZona(evt) {
    this.dragging = false;
    angleLatZona[this.index]=(-puntZona[this.index].position.y+centreMapaY)*Math.PI/midaMapa;
    angleLonZona[this.index]=(puntZona[this.index].position.x-centreMapaX)*Math.PI/midaMapa;
    mouZona(this.index);
    this.data = null;
}

function botoPausa() {	
    switch(estat) {
        case 0:    // no assignada
            alert("Encara no tens cap missió assignada. Incorpora't primer a una missió!");
            break;
        case 1:    // assignada
            if (comprova_inici()) {
                estat = 2;
                $("#estat_missio").html("Iniciada");
                enPausa = false;
                temps = 0;
                temps_exploració = 0;
                gigues_transferits = 0;
                $(".cr.number.has-slider").css("pointer-events","none");
                gui.__folders['SIMULACIÓ'].__controllers[1].__li.style.pointerEvents="unset";
                estil.backgroundColor = 'red';
                folder1.close();
                folder4.close();
                botoIniciar.name("A V O R T A");
                canviaParametres();
            }
            break;
        case 2:    // iniciada
        if (confirm("Segur que vols avortar la missió? Hauràs de tornar a iniciar-la i completar-la ...")) {
            restaura();
            break;
        }
    }	
}

function comprova_inici() {
    if (disSensors==0) {
        alert("No has incorporat cap sensor al satèl·lit, no podrà completar la missió assignada.");
        return false;
    } else {
        var possibles = row_mis[nM][9].split(",");
        var equipat = false;
        for(var i=1; i<row_sen.length; i++) {
            if (sensor[i]) {
                for(var j=0;j<possibles.length;j++) {
                    if (i==possibles[j]) {
                        equipat = true;
                        break;
                    }
                }
            }
        }
        if (equipat) {
            return true;						
        } else {
            var avís = "No has incorporat cap dels sensors recomenats per completar la missió assignada:\n\n"
            for(var j=0;j<possibles.length;j++) {
                avís+= "· " + row_sen[possibles[j]][0] + "\n"
            }
            alert(avís);
            return false;
        }
    }
}

var dies_restants;		
var hores_exploració;
var transferència;
var cobertura;

function addGraph() {
    if(!enPausa) {
        if (temps>segonsDia) {
            if(!diaSencer) {
                finalCountGraph=countGraph;
                diaSencer=true;
            }
        }

        // APORTACIONS I DESPESES DE DISC I BATERIA
        ritmeDisc=0;
        ritmeBateria=0;

        var enregistrant=false;
        var transferint=false;

        if (ambLlum) { // Aportació d'energia solar
            ritmeBateria+=parametres.panells*ritmeBateriaPanell;
        }

        var zonaEstudi=0;
        do { // Despesa única de càmeres i radar quan s'està dins d'alguna de les zones d'estudi
            if (dintreZona[0][zonaEstudi]) {
                ritmeDisc+=-disSensors/100000;
                ritmeBateria+=-potSensors/10000;
                enregistrant=true;
                temps_exploració+= parametres.velAnimacio * interval * shiftCount;
            }
            zonaEstudi++;						
        }
        while(!enregistrant && zonaEstudi<numZones)

        for(j=0;j<numEstacions;j++) { // Consum del transfer a totes les estacions properes
            if (dintre[0][j] && disSensors>0 && nivellDiscs<100) {
                ritmeDisc+=ritmeDiscTransfer;
                ritmeBateria+=ritmeBateriaTransfer;
                transferint=true;
                gigues_transferits+= parametres.velAnimacio * interval * shiftCount * ritmeDisc;
            }
        }

        /*if (transferint || enregistrant) { // Consum energètic dels discs
            ritmeBateria+=parametres.discs*ritmeBateriaDiscs;
        }*/

        nivellDiscs+= parametres.velAnimacio * interval * shiftCount * ritmeDisc / parametres.discs;


        if (nivellDiscs>100) {
            nivellDiscs=100;
        }
        if (nivellDiscs<=0) {
            nivellDiscs=0;
            $("#no-discs").css("display","block");
        } else {
            $("#no-discs").css("display","none");
        }

        nivellBateria+= parametres.velAnimacio *interval * shiftCount * ritmeBateria;

        if (nivellBateria>100) {
            nivellBateria=100;
        }
        if (nivellBateria<=0) {
            nivellBateria=0;
            $("#no-energy").css("display","block");
        } else {
            $("#no-energy").css("display","none");
        }	
            
        // Punts de les gràfiques

        if (diaSencer) {
            posDiscs[finalCountGraph * 2 + 0] = finalX;
            posDiscs[finalCountGraph * 2 + 1] = origenY+(finalY-origenY)/100*(100-nivellDiscs);
            posBateria[finalCountGraph * 2 + 0] = finalX;
            posBateria[finalCountGraph * 2 + 1] = origenY+(finalY-origenY)/100*(100-nivellBateria);
            for(i=0;i<finalCountGraph;i++){							
                posDiscs[i* 2 + 1] = posDiscs[i* 2 + 3];
                posBateria[i* 2 + 1] = posBateria[i* 2 + 3];
            }
        } else {
            posDiscs[countGraph * 2 + 0] = origenX+temps*(finalX-origenX)/segonsDia;
            posDiscs[countGraph * 2 + 1] = origenY+(finalY-origenY)/100*(100-nivellDiscs);
            posBateria[countGraph * 2 + 0] = origenX+temps*(finalX-origenX)/segonsDia;
            posBateria[countGraph * 2 + 1] = origenY+(finalY-origenY)/100*(100-nivellBateria);		
            countGraph++;
        }
        discs.clear();
        discs.position.set(0,0);	
        discs.lineStyle(3, 0x0000FF);
        discs.moveTo(origenX,origenY);
        app.stage.addChild(discs);
        bateria.clear();
        bateria.position.set(0,0);	
        bateria.lineStyle(3, 0x00FF00);
        bateria.moveTo(origenX,origenY+(finalY-origenY)/2);
        app.stage.addChild(bateria);
        for(i=0;i<countGraph;i++) {
            discs.lineTo(posDiscs[i * 2 + 0],posDiscs[i * 2 + 1]);
            bateria.lineTo(posBateria[i * 2 + 0],posBateria[i * 2 + 1]);
        }
    }
    dies_restants = Math.floor((limit_mis - temps / 86400) * 10) / 10;
    $("#dies_restants").html(dies_restants);		
    hores_exploració = Math.floor(temps_exploració / 3600 * 10) / 10;	
    $("#hores_exploració").html(hores_exploració);
    transferència = Math.floor(gigues_transferits * 10) / 10;
    $("#transferència").html(transferència);
    cobertura = Math.ceil(zona_visibles(0) / zonesTotal * 1000) / 10;
    if (cobertura>100) {
        cobertura=100;
    }
    $("#cobertura").html(cobertura);
    if (dies_restants <= 0) {				
        alert("S'ha exhaurit el temps disponible per completar la missió.");
        restaura();
    }
    var de_cobertura = cobertura / cobertura_mis;
    if (de_cobertura>1) {
        de_cobertura = 1;
        $("#cobertura").css("color","greenyellow");
    }
    var de_temps = hores_exploració / explora_mis;
    if (de_temps>1) {
        de_temps = 1;
        $("#hores_exploració").css("color","greenyellow");
    }
    var de_transfer = transferència /transfer_mis;
    if (de_transfer>1) {
        de_transfer = 1;
        $("#transferència").css("color","greenyellow");
    }
    var completat = Math.ceil((de_cobertura + de_temps + de_transfer) * 1000 / 3) /10;
    $("#compleció").html(completat);
    if (completat >=100) {
        estat = 0;
        $("#ods").html("-")
        $("#estat_missio").html("No assignada");
        $("#dies_restants").html("-");
        $("#dies_restants").css("color","white");
        $("#cobertura").css("color","white");
        $("#hores_exploració").css("color","white");
        $("#transferència").css("color","white");		
        $("#compleció").css("color","white");	
        botoMissio.name("Assignació de missió");
        reset();
        fet();
    }
}

function fet() {
    var data_hora = new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
    var informe = "Missió completada: " + row_mis[nM][1] + "\n\n";
    informe+= "Data i hora de la compleció: " + data_hora + "\n"; 
    informe+= "Temps invertit: " + Math.floor(temps / 86400 *10) / 10 + " dies\n";
    informe+= "Cobertura de la zona: " + cobertura + "%\n";
    informe+= "Exploració de la zona: " + hores_exploració + " hores\n";
    informe+= "Dades transferides a l'estació: " + transferència + " GB";
    row_mis.splice(nM,1);
    fes_pdf(informe);
    alert("Enhorabona, has completat la missió!\nA continuaciṕ es baixarà l'informe corresponent...");   
    canviaParametres();
}

function addPoint(){
    if(!enPausa) {				
        for(i=0;i<maxSat;i++) {
            var laLatitud=(centreMapaY-puntSat[i].y-radiPunt)/midaMapa*Math.PI;
            var laLongitud=(puntSat[i].x-centreMapaX+radiPunt)/midaMapa*Math.PI;

            var distanciaActual=0;
            dintre[i]=[];
            for(j=0;j<numEstacions;j++) {
                distanciaActual=distancia(angleLatEstacio[j],laLatitud,angleLonEstacio[j],laLongitud);
                if (distanciaActual<parametres.radiProximitat*1000) {
                    dintre[i][j]=true;
                }
                else {
                    dintre[i][j]=false;
                }
            }                    

            dintreZona[i]=[];
            for(j=0;j<numZones;j++) {
                distanciaActual=distancia(angleLatZona[j],laLatitud,angleLonZona[j],laLongitud);
                if (distanciaActual<parametres.radiZona*1000) {
                    dintreZona[i][j]=true;
                    var numTrosX=Math.floor(((puntSat[0].x + radiPunt - centreMapaX) + midaMapa) / midaQuadre);
                    var numTrosY=Math.floor(((puntSat[0].y + radiPunt - centreMapaY) + midaMapa/2) / midaQuadre);
                    if (tros[numTrosX][numTrosY].visible==false && nivellBateria>0 && nivellDiscs>0) {
                        tros[numTrosX][numTrosY].visible=true;
                    }
                }
                else {
                    dintreZona[i][j]=false;
                }
            }
        }

        var vectorSat3D=new THREE.Vector3();
        sat3D[0][0].getWorldPosition(vectorSat3D);
        var vectorSatUnitari=new THREE.Vector3().copy(vectorSat3D).multiplyScalar(1/vectorSat3D.length());
        
        ambLlum=true;
        var cosinus=vectorSatUnitari.dot(vectorLlum)
        var radiLlum=vectorSat3D.length()*Math.sin(Math.acos(cosinus));
        if (cosinus>0 && radiLlum<1) {
            ambLlum=false;
        }
    }
}

function addLink() {
    for(s=0;s<parametres.nOrb;s++) {
        for(i=0;i<parametres.nSat;i++) {
            var worldSat3D=new THREE.Vector3();
            sat3D[s][i].getWorldPosition(worldSat3D);
            for(j=0;j<numEstacions;j++) {
                if (link2D[i][j]!=null) {
                    link2D[i][j].clear();
                    link2D[i][j].position.set(0,0);	
                    link2D[i][j].lineStyle(1, 0xFF0000);
                    link2D[i][j].moveTo(puntEstacio[j].x+radiPunt,puntEstacio[j].y+radiPunt);
                    app.stage.addChild(link2D[i][j]);

                    var worldEstacio3D=new THREE.Vector3();
                    estacio3D[j].getWorldPosition(worldEstacio3D);

                    if (dintre[i][j]) {
                        link2D[i][j].lineTo(puntSat[i].x+radiPunt,puntSat[i].y+radiPunt);
                    }
                }
            }
        }
    }
}

function veureEixos() {
    if(parametres.veureEixos) {
        scene.add(arrowHelper);
        scene.add(axesHelper);
        scene.add(plaEquatorial);
        grupMon.add(plaOrbita);
    } else {
        scene.remove(arrowHelper);
        scene.remove(axesHelper);
        scene.remove(plaEquatorial);
        grupMon.remove(plaOrbita);
    }  
}

function canviaSemieix() {
    var eMax=1-satMin*rTerra/(parametres.aOrbita*1000);
    folder1.__controllers[5].max(eMax);
    canviaParametres();
}

function canviaExcentricitat() {
    var aMin=satMin*rTerra/(1-parametres.excentricitat)/1000;
    folder1.__controllers[4].min(aMin);
    canviaParametres();
}

function canviaAnomalia() {
    for(i=0;i<parametres.nSat;i++) {
        for(j=0;j<numEstacions;j++) {
            link2D[i][j].clear();
        }
    }
    canviaParametres();
}

function canviaParametres() {
    var angleInclinacio = parametres.inclinacio * Math.PI/180;
    var angleLongitud = (parametres.longitud + 90 ) * Math.PI/180;
    var anglePerigeu = (parametres.argPerigeu -90) * Math.PI/180;

    longitudAnterior=angleLongitud;

    var quaternionPerigeu=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),anglePerigeu);
    var quaternionInclinacio=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), -angleInclinacio);
    var quaternionLongitud=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1), angleLongitud);
    quaternionTerra=new THREE.Quaternion().multiplyQuaternions(quaternionLongitud,new THREE.Quaternion().multiplyQuaternions(quaternionInclinacio,quaternionPerigeu));

    eOrbita=parametres.excentricitat;				

    aOrbita=parametres.aOrbita*1000;
    pOrbita=aOrbita*(1-eOrbita);
    bOrbita=aOrbita*Math.sqrt(1-eOrbita*eOrbita);
    periodeSat=2*Math.PI*Math.sqrt(aOrbita**3/MU);
    omegaSat=2*Math.PI/periodeSat;

    var hores=Math.floor(periodeSat/3600);
    var minuts=Math.floor((periodeSat - 3600 * hores)/60);
    var segons=Math.floor(periodeSat-hores*3600-minuts*60 );
    var stringPeriode= hores + "h " + minuts + "' " + segons + "''";
    folder1.__controllers[7].setValue(stringPeriode);


// SAT 2D, 3D
    var mida=0.02*pOrbita/rTerra;
    for(s=0;s<parametres.nOrb;s++) {
        for(i=0;i<maxSat;i++) {
            grupSat[s].remove(sat3D[s][i]);
            //link3D[i]=[];
        }
    }	
    for(s=0;s<parametres.nOrb;s++) {
        for(i=0;i<parametres.nSat;i++) {
            grupSat[s].add(sat3D[s][i]);
            sat3D[s][i].scale.set(mida,mida,mida);
        }
    }				

// ÒRBITA
    grupMon.remove(orbita);
    var curve = new THREE.EllipseCurve((pOrbita-aOrbita)/rTerra,0,aOrbita/rTerra,bOrbita/rTerra,0,2*Math.PI,false,0);
    var points = curve.getPoints(360);
    var geometryOrbita = new THREE.BufferGeometry().setFromPoints(points);
    orbita = new THREE.Line( geometryOrbita, materialOrbita );
    orbita.quaternion.copy(quaternionTerra);
    grupMon.add(orbita);

// PLA ORBITA
    if(parametres.veureEixos) {
        grupMon.remove(plaOrbita);
    }
    var quaternionPla=new THREE.Quaternion().multiplyQuaternions(quaternionLongitud,quaternionInclinacio);				
    plaOrbita.quaternion.copy(quaternionPla);
    if(parametres.veureEixos) {
        grupMon.add(plaOrbita);
    }	
   
// DISCS
    posDiscs = new Float32Array(maxPointsGraph * 2);

// BATERIA
    posBateria = new Float32Array(maxPointsGraph * 2);

// LINK 2D
    for(i=0;i<parametres.nSat;i++) {
        link2D[i]=[];
        for(j=0;j<numEstacions;j++) {
            link2D[i][j]=new PIXI.Graphics();
        }
    }

// REINICI SIMULACIÓ
    previousTime=new Date().getTime();
    temps=0;
    temps_exploració=0;
    gigues_transferits=0;
    diaSencer=false;
    count=0;
    countGraph=0;
    steps=0;
    nivellDiscs=100;
    nivellBateria=50;
    for(s=0;s<parametres.nOrb;s++) {
        for(i=0;i<parametres.nSat;i++) {
            angleEscombrat[i]=Math.PI/180*(parametres.anomalia) + 2* Math.PI / parametres.nSat * i;
        }
    }
    for(i=0;i<midaQuadre*2;i++) {
        for(j=0;j<midaQuadre;j++) {
            if (tros[i]!=undefined) {
                tros[i][j].visible=false;
            }
        }
    }

// POSICIÓ TERRA
    angleRotTerra = - parametres.ERA * Math.PI / 180;
}

function onWindowResize() {				
    camera.aspect = window.innerWidth * ample / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth * ample, window.innerHeight );

    WIDTH = window.innerWidth * ampleRight;
    HEIGHT = window.innerHeight;

    var ratio = Math.min(WIDTH/(2*midaMapa), HEIGHT/(3.5*midaMapa));
    app.stage.position.set(WIDTH/2, HEIGHT/2);
    app.stage.scale.set(ratio, ratio);
    app.stage.pivot.set(WIDTH/2, HEIGHT/2);
    app.renderer.resize(WIDTH,HEIGHT);
    $('#status').css('left', parseInt($('#content').css('width')) - parseInt($('#status').css('width')));
}

function animate() {
    requestAnimationFrame( animate );
    render();
}

function render() {
    if (!enPausa) {
        var currentTime = new Date().getTime();
        interval= currentTime - previousTime;
        temps+=parametres.velAnimacio * interval;
        previousTime = currentTime;	
    }

    if(meshTerra!=null) {
        var quaternionZ=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1), omega*temps - angleRotTerra);
        meshTerra.quaternion.copy(quaternionZ);
    }

    for (s=0;s<parametres.nOrb;s++) {
        for (i=0;i<parametres.nSat;i++) {
            if (!enPausa) {
                angleEscombrat[i]+=Math.sqrt(MU/((aOrbita*(1-eOrbita**2))**3))*(1+eOrbita*Math.cos(angleEscombrat[i]))**2*parametres.velAnimacio*interval;
            }

            var quaternion=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),Math.PI + angleEscombrat[i]);
            sat3D[s][i].quaternion.copy(quaternion);
            
            var radi=pOrbita/rTerra*(1+eOrbita)/(1+eOrbita*Math.cos(angleEscombrat[i]));
            sat3D[s][i].position.x=radi*Math.cos(angleEscombrat[i]);
            sat3D[s][i].position.y=radi*Math.sin(angleEscombrat[i]);

            var vectorSatTerra=new THREE.Vector3(sat3D[s][i].position.x,sat3D[s][i].position.y,0);
            vectorSatTerra.applyQuaternion(quaternionTerra);
            vEsferic=coordEsferiques(vectorSatTerra);              										

            var voltes=Math.floor((vEsferic.z - omega * temps + angleRotTerra + Math.PI) / (2 * Math.PI));
            var longitudMapa=vEsferic.z -omega * temps + angleRotTerra - voltes * 2 * Math.PI;                  

            longitudAnterior=longitudMapa;	
            if (puntSat[i]!=undefined) {
                puntSat[i].x=centreMapaX+longitudMapa*midaMapa/Math.PI-radiPunt;
                puntSat[i].y=centreMapaY-(Math.PI/2-vEsferic.y)*midaMapa/Math.PI-radiPunt;
            }
        }
        grupSat[s].quaternion.copy(quaternionTerra);
    }               

    steps++;
    if (temps>0) {
        if (steps % shiftCount == 0) {
            addPoint();	
            addLink();
            addGraph();					
        }
} 
    camera.aspect=window.innerWidth * ample / window.innerHeight ;
    camera.updateProjectionMatrix();
    renderer.render( scene, camera );
}

function coordEsferiques(vector) {
    var r=vector.length();
    var theta=Math.acos(vector.z/r);
    var phi=Math.atan2(vector.y,vector.x);
    return(new THREE.Vector3(r,theta,phi));
}

function canviaMapa() {
    var loader3 = new THREE.TextureLoader();
    loader3.load( 'imatges/'+parametres.mapa3D, function (texture) {
        // TERRA
        grupMon.remove( meshTerra );
        var geometryTerra = new THREE.SphereGeometry( 1, 40, 40 );
        geometryTerra.rotateX(Math.PI/2);
        var materialTerra = new THREE.MeshLambertMaterial({ map: texture, overdraw: true });
        meshTerra = new THREE.Mesh( geometryTerra, materialTerra );
        meshTerra.castShadow=true;
        grupMon.add( meshTerra );
        for(j=0;j<numEstacions;j++) {
            meshTerra.add(estacio3D[j]);
        }
    } );	
}

function canviaSatelit() {
    var manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {
        for(s=0;s<maxOrb;s++) {
            for(i=0;i<maxSat;i++) {
                grupSat[s].add(sat3D[s][i]);	
            }
        }
    };
    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
        }
    };
    var onError = function ( xhr ) {
    };
    var loader = new THREE.OBJLoader( manager );
    var fitxerSat="imatges/sat"+parametres.panells+".obj";
    
    loader.load( fitxerSat, function ( object ) {
        object.traverse( function ( child ) {
            if ( child instanceof THREE.Mesh ) {
                child.material=new THREE.MeshStandardMaterial( { color: 0x565758, overdraw: true} );
                child.receiveShadow = true;
            }
        } );
        object.scale.set(midaSatelit,midaSatelit,midaSatelit);
        for(s=0;s<maxOrb;s++) {
            for(i=0;i<maxSat;i++) {
                grupSat[s].remove(sat3D[s][i]);
                sat3D[s][i]=object.clone();
            }
        }					
    }, onProgress, onError );
}

function botoEliminarEstacio() {
    numEstacions--;
    meshTerra.remove(estacio3D[numEstacions]);
    for(i=0;i<maxSat;i++) {
        scene.remove(link3D[i][numEstacions]);
    }
    app.stage.removeChild(puntEstacio[numEstacions]);	
    proximitat[numEstacions].clear();

}

function botoEliminarZona() {
    numZones--;
    app.stage.removeChild(puntZona[numZones]);	
    zonaProx[numZones].clear();
}

function botoAfegirEstacio() {
    alert("La nova estació s'ha ubicat provisionalment en el mapa.\nPots canviar la ubicació de les estacions arrossegant-les\namb el ratolí.")
    angleLatEstacio[numEstacions]=10*Math.PI/180;
    angleLonEstacio[numEstacions]=0;

    estacio3D[numEstacions]= new THREE.Mesh( geometryEstacio3D, materialEstacio3D );
    meshTerra.add(estacio3D[numEstacions]);	

    puntEstacio[numEstacions]=new PIXI.Sprite(PIXI.loader.resources["imatges/estacio_punt.png"].texture);
    puntEstacio[numEstacions].index=numEstacions;
    app.stage.addChild(puntEstacio[numEstacions]);	

    mouEstacio(numEstacions);
    numEstacions++;
}

function botoAfegirZona() {
    alert("La nova zona d\'estudi s'ha ubicat provisionalment en el mapa.\nPots canviar la ubicació de les zones d\'estudi arrossegant-les\namb el ratolí.")
    angleLatZona[numZones]=45*Math.PI/180;
    angleLonZona[numZones]=90*Math.PI/180;

    puntZona[numZones]=new PIXI.Sprite(PIXI.loader.resources["imatges/zona_punt.png"].texture);
    puntZona[numZones].index=numZones;
    app.stage.addChild(puntZona[numZones]);	

    mouZona(numZones);
    numZones++;
}

function canviaRadiProximitat() {	
    var distanciaZona=parametres.radiProximitat*1000/rTerra;			
    for(j=0;j<numEstacions;j++) {		
        proximitat[j].clear();
        if (proximitat[j]==undefined) {
            proximitat[j] = new PIXI.Graphics();
        }
        app.stage.addChild(proximitat[j]);
        proximitat[j].position.set(centreMapaX,centreMapaY);	
        proximitat[j].lineStyle(1, 0xFF0000);

        for (i=0;i<=360;i+=stepAngle) {
            azimuth=i*Math.PI/180;
            var novCoord=novesCoordenades(angleLatEstacio[j],angleLonEstacio[j],azimuth,distanciaZona);
            if(i==0) {
                proximitat[j].moveTo(midaMapa*novCoord.y/Math.PI,-midaMapa*novCoord.x/Math.PI);
            } else {
                proximitat[j].lineTo(midaMapa*novCoord.y/Math.PI,-midaMapa*novCoord.x/Math.PI);
            }
        }
    }
}

function canviaRadiZona() {	
    var distanciaZona=parametres.radiZona*1000/rTerra;			
    for(j=0;j<numZones;j++) {		
        zonaProx[j].clear();
        if (zonaProx[j]==undefined) {
            zonaProx[j] = new PIXI.Graphics();
        }
        app.stage.addChild(zonaProx[j]);
        zonaProx[j].position.set(centreMapaX,centreMapaY);	
        zonaProx[j].lineStyle(1, 0x872D00);

        for (i=0;i<=360;i+=stepAngle) {
            azimuth=i*Math.PI/180;
            var novCoord=novesCoordenades(angleLatZona[j],angleLonZona[j],azimuth,distanciaZona);
            if(i==0) {
                zonaProx[j].moveTo(midaMapa*novCoord.y/Math.PI,-midaMapa*novCoord.x/Math.PI);
            } else {
                zonaProx[j].lineTo(midaMapa*novCoord.y/Math.PI,-midaMapa*novCoord.x/Math.PI);
            }
        }
    }
}

function canviaNombre() {
        for(i=0;i<maxSat;i++) {
                for(j=0;j<numEstacions;j++) {
                        scene.remove(link3D[i][j]);
                }
        }
        canviaParametres();
}

function mouEstacio(numEst) {
    estacio3D[numEst].position.x=Math.sin(Math.PI/2-angleLatEstacio[numEst])*Math.cos(angleLonEstacio[numEst]);
    estacio3D[numEst].position.y=Math.sin(Math.PI/2-angleLatEstacio[numEst])*Math.sin(angleLonEstacio[numEst]);
    estacio3D[numEst].position.z=Math.cos(Math.PI/2-angleLatEstacio[numEst]);

    var distanciaZona=parametres.radiProximitat*1000/rTerra;

    puntEstacio[numEst].x=centreMapaX+midaMapa*angleLonEstacio[numEst]/Math.PI-radiPunt;
    puntEstacio[numEst].y=centreMapaY-midaMapa*angleLatEstacio[numEst]/Math.PI-radiPunt;
    if (proximitat[numEst]==undefined) {
        proximitat[numEst] = new PIXI.Graphics();
    }
    app.stage.addChild(proximitat[numEst]);
    proximitat[numEst].position.set(centreMapaX,centreMapaY);	
    proximitat[numEst].lineStyle(1, 0xFF0000);	

    for (i=0;i<=360;i+=stepAngle) {
        azimuth=i*Math.PI/180;
        var novCoord=novesCoordenades(angleLatEstacio[numEst],angleLonEstacio[numEst],azimuth,distanciaZona)
        if(i==0) {
            proximitat[numEst].moveTo(midaMapa*novCoord.y/Math.PI,-midaMapa*novCoord.x/Math.PI);
        } else {
            proximitat[numEst].lineTo(midaMapa*novCoord.y/Math.PI,-midaMapa*novCoord.x/Math.PI);
        }
    }			
}

function mouZona(numZona) {
    var distanciaZona=parametres.radiZona*1000/rTerra;

    puntZona[numZona].x=centreMapaX+midaMapa*angleLonZona[numZona]/Math.PI-radiPunt;
    puntZona[numZona].y=centreMapaY-midaMapa*angleLatZona[numZona]/Math.PI-radiPunt;
    if (zonaProx[numZona]==undefined) {
        zonaProx[numZona] = new PIXI.Graphics();
    }
    app.stage.addChild(zonaProx[numZona]);
    zonaProx[numZona].position.set(centreMapaX,centreMapaY);	
    zonaProx[numZona].lineStyle(1, 0x872D00);

    for (i=0;i<=360;i+=stepAngle) {
        azimuth=i*Math.PI/180;
        var novCoord=novesCoordenades(angleLatZona[numZona],angleLonZona[numZona],azimuth,distanciaZona)
        if(i==0) {
            zonaProx[numZona].moveTo(midaMapa*novCoord.y/Math.PI,-midaMapa*novCoord.x/Math.PI);
        } else {
            zonaProx[numZona].lineTo(midaMapa*novCoord.y/Math.PI,-midaMapa*novCoord.x/Math.PI);
        }
    }
}

function distancia(lat1,lat2,lon1,lon2) {			 	
    var dfi = (lat2-lat1);
    var dlambda = (lon2-lon1);
    var a = Math.sin(dfi/2) * Math.sin(dfi/2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dlambda/2) * Math.sin(dlambda/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = rTerra * c;
    return d;
}

function novesCoordenades(fi1, lambda1, azimuth, distance) {
    var delta = distance;
    var deltafi = delta * Math.cos(azimuth);
    var fi2 = fi1 + deltafi;
    var deltapsi = Math.log(Math.tan(fi2/2+Math.PI/4)/Math.tan(fi1/2+Math.PI/4));
    var q = Math.abs(deltapsi) > 10e-12 ? deltafi / deltapsi : Math.cos(fi1);
    var deltalambda = delta*Math.sin(azimuth)/q;
    var lambda2 = lambda1 + deltalambda;
    if (fi2>Math.PI/2) {fi2=Math.PI/2;}
    if (fi2<-Math.PI/2) {fi2=-Math.PI/2;}
    if (lambda2>Math.PI) {lambda2=Math.PI;}
    if (lambda2<-Math.PI) {lambda2=-Math.PI;}
    return new THREE.Vector3(fi2,lambda2,0);
}

function botoInfoSensors() {
    if (estat<2) {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",		    	    		
        //url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQgE509E8sh-fxq5pvy9LjjUSC4AHoJaSdqTW0xbFeS9MV6CpT1JeAgk3WhGrlQPBrU1qFX-TXEl3YZ/pub?output=tsv",
        url: "sensors.tsv",
        dataType: "text",
        success: function(data) {processData(data);}				
    });

    function processData(allText) {
        var csv=allText;    
        var msgDiv="<table style='width:100%;font-size:large;'>";
        msgDiv +="<tr><td id='potSensors' style='width:50%; background-color: #cacaca'>Potència necessària (W): 0</td>";//<td style='width:50%; background-color: #cacaca'>Panells solars : 1</td></tr>";
        msgDiv +="<td id='disSensors' style='width:50%; background-color: #cacaca'>Ocupació d'espai de disc (kb/s): 0</td></tr>";//<td style='width:50%; background-color: #cacaca'>Unitats de disc : 1</td></tr>";    				    				
        msgDiv +="</table><br>"; 
        msgDiv +="<table style='width:100%;font-size:10pt'>";
        var lines=csv.split("\n");
        row_sen = [];
        var nf = Intl.NumberFormat();

        for(var i=0; i<lines.length; i++) {
            row_sen[i]=lines[i].split("\t");
            msgDiv +="<tr>";
            if (i>0){
                msgDiv +="<td style='border: 1px solid #cacaca; padding:3px;'><input type='checkbox' class='sensor' name='sensor_"+i+"' id='sensor_"+i+"' onchange='calPotencia()'/></td>";		
            } else {
                msgDiv +="<td style='border: 1px solid #cacaca; padding:3px'></td>"
            }
            for(var c=0; c<row_sen[i].length; c++) {	  		
                var senVal=row_sen[i][c];
                if(i==0) {
                    msgDiv +="<td style='border: 1px solid #cacaca; padding:3px; text-align:center'><b>"+senVal+"</b></td>";
                } else {
                    if(c==0){
                        msgDiv +="<td style='width:25%;border: 1px solid #cacaca; padding:3px'>"+senVal+"</td>";
                    } 
                    if(c==1){
                        msgDiv +="<td style='width:10%; text-align:center; border: 1px solid #cacaca; padding:3px'>"+senVal+"</td>";
                    } 
                    if(c==2) {
                        msgDiv +="<td style='border: 1px solid #cacaca; padding:3px'><div style='height:40px;overflow-y:scroll'>"+senVal+"</div></td>";
                    }
                    if(c==3 || c==4) {
                        msgDiv +="<td style='border: 1px solid #cacaca; text-align: right; padding:3px;'>"+nf.format(senVal)+"</td>";
                    }
                    if(c==5) {
                            msgDiv +="<td style='border: 1px solid #cacaca; padding:3px'><img src='"+senVal+"' style='height:40px' class='center'></td>";
                    } 
                }
            }
            msgDiv +="</tr>";  						
        }			  

        msgDiv +="</table>";				

        $("#modalHeader").html("Sensors que incorpora el satèl·lit");
        $("#missatge").html(msgDiv);
        $("#finestraInfo").css({"visibility":"visible"});
        $("#finestraInfo").modal('show');	

        munSensors=lines.length-1;
        if (sensorsIniciats) {
            for(var i=1; i<lines.length; i++) {
                if (sensor[i]) {
                    //console.log("[id='sensor_"+i+"']");
                    $("[id='sensor_"+i+"']").prop("checked",true);
                }
            }
        }	
        calPotencia();
        sensorsIniciats=true;    	
    }
} else {
    alert("No es poden treure o afegir sensors quan el satèl·lit ja està orbitant...")
}
}	

var row_mis=[];
carregaMissions();
var nM=0; //index de la missió 
var ods_mis;
var lat_mis;
var lon_mis;
var sensor_mis;
var limit_mis;
var transfer_mis;
var explora_mis;
var cobertura_mis;

function carregaMissions() {			 	
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",		
        url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSjqpRYGZPowGnv70k6bKUOz7CjigpLQIoJZkGHEQlVGpDyH-XNjSMdPiEwtaxFLE_Rjgig-afk8aFD/pub?gid=1727080996&single=true&output=tsv",
        dataType: "text",
        success: function (dades) {
            row_mis=dades.split('\n');
            for (i=0;i<row_mis.length;i++){
                row_mis[i]=row_mis[i].split('\t');
            }
            $("#taulaMissions").show();
            $("#selMissio").show();
        }
    });
}

function botoInfoMissions() {			 	
    var msgDiv="<table style='width:100%;'>";
    //for(var i=0; i<row_mis.length; i++) {
    for(var i=0; i<7; i++) {					
        msgDiv +="<tr>";
        for(var c=0; c<row_mis[i].length; c++) {	  								
            var senVal=row_mis[i][c];	
            console.log(c,senVal);
            if(i==0) {
                msgDiv +="<td style='border: 1px solid #cacaca; padding:3px; text-align:center;'><b>"+senVal+"</b></td>";
            }	else {
                if (c==100){
                    msgDiv +="<td style='border: 1px solid #cacaca; padding:3px;'>"+senVal+"<br><button data-toggle='collapse' data-target='#demo'>Més informació</button><div id='demo' class='collapse'>Lorem ipsum dolor text....</div></td>";
                } else {
                    if (c==3) {	
                        msgDiv +="<td style='border: 1px solid #cacaca; padding:3px;'><a href='"+senVal+"' target='_blank'><img src='"+senVal+"' style='max-height:100px' class='center'></a></td>";														
                    } else {	
                        if (c==4) {
                            msgDiv +="<td style='border: 1px solid #cacaca; padding:3px'>";
                            var enll=senVal.split(',');
                            for (ii=0;ii<enll.length;ii++){
                                msgDiv +="<br><a href='"+enll[ii]+"' target='_blank'>Enllaç "+parseInt(ii+1)+"</a>";
                            }
                            msgDiv +="</td>";
                            //msgDiv +="<td style='border: 1px solid #cacaca; padding:3px'><a href='"+senVal+"' target='_blank'>Enllaç</a></td>";	
                        } else {
                            msgDiv +="<td style='border: 1px solid #cacaca; padding:3px;'>"+senVal+"</td>";
                        }
                    }
                }
            }
        }
        msgDiv +="</tr>";  
    }
    msgDiv +="</table>";
    $("#modalHeader").html("Relació de missions");
    $("#missatge").html(msgDiv);
    $("#finestraInfo").css({"visibility":"visible"});
    $("#finestraInfo").modal('show');	 		
}

function botoSelMissio() {	
    if (estat == 0) {
        botoMissio.name("Missió assignada");
        var max=row_mis.length;
        var min=1;
        nM = min + Math.floor(Math.random() * (max - min));
        ods_mis = row_mis[nM][5];
        lat_mis = row_mis[nM][6];
        lon_mis = row_mis[nM][7];
        parametres.radiZona = row_mis[nM][8];
        sensor_mis = row_mis[nM][9];
        limit_mis = row_mis[nM][10];
        transfer_mis = row_mis[nM][11];
        explora_mis = row_mis[nM][12];
        cobertura_mis = row_mis[nM][13];
        parametres.radiProximitat = row_mis[nM][15];

        $("#explora_mis").html(explora_mis);
        $("#cobertura_mis").html(cobertura_mis);
        $("#transfer_mis").html(transfer_mis);
        $("#hores_exploració").css("color","yellow");
        $("#cobertura").css("color","yellow");
        $("#transferència").css("color","yellow");
        $("#dies_restants").css("color","yellow");
        $("#compleció").css("color","yellow");
        $("#ods").html(ods_mis);
        angleLatZona[0] = parseFloat(lat_mis) * Math.PI / 180;
        angleLonZona[0] = parseFloat(lon_mis) * Math.PI / 180;
        mouZona(0);
        canviaRadiZona();
        var num_ciutat = Math.floor(Math.random() * ciutats.length);
        angleLatEstacio[0]= ciutats_lat[num_ciutat] * Math.PI / 180;
        angleLonEstacio[0]= ciutats_lon[num_ciutat] * Math.PI / 180;
        mouEstacio(0);
        canviaRadiProximitat();

        $("#estat_missio").html("Assignada");
        estat = 1;
        folder1.open();
        folder3.open();
        folder4.open();
        $("#dies_restants").html(limit_mis);	
        zonesTotal = zona_trossos(0);				
    }
    var msgDiv="<div style='width:55%; float: left'>";
    msgDiv +="<h3>Tipologia</h3>";
    msgDiv +="<p class='descripcio'>"+row_mis[nM][0]+". <b>ODS relacionats</b>: "+ods_mis+".</p>";
    msgDiv +="<h3>Descripció</h3>";
    msgDiv +="<p class='descripcio'>"+row_mis[nM][2]+"</p>";
    msgDiv +="<h3 style='margin-bottom:0px'>Notícies i enllaços d'interès</h3>";
    msgDiv +="<p class='descripcio'>"
    var enll=row_mis[nM][4].split(',');
    for (i=0;i<enll.length;i++){
        msgDiv +="<br><a href='"+enll[i]+"' target='_blank'>Enllaç "+parseInt(i+1)+"</a>";
    }
    msgDiv +="</p>";
    msgDiv +="</div>";	
    msgDiv +="<div style='width:45%; float: right'>";	
    msgDiv +="<div style='display:flex;justify-content:center'><img src='"+row_mis[nM][3]+ "' title='" + row_mis[nM][14] +"' style='margin-left:15px;max-height:50rem!important; width:100%!important'/></div>";
    msgDiv +="<h3 style='margin-left:10px'>Criteris de compleció</h3>";
    msgDiv +="<ul><li class='descripcio'>Límit de temps per completar la missió (dies): "+limit_mis+"</li>";
    msgDiv +="<li class='descripcio'>Mínim de dades transferides a l'estació de terra (GB): "+transfer_mis+"</li>";
    msgDiv +="<li class='descripcio'>Mínim de temps sobre la zona a explorar (hores): "+explora_mis+"</li>";
    msgDiv +="<li class='descripcio'>Mínim de superfície explorada (%): "+cobertura_mis+"</li></ul>";
    msgDiv +="</div>";
    $("#modalHeader").html("Missió a desenvolupar: "+row_mis[nM][1]);	
    $("#missatge").html(msgDiv);
    $("#finestraInfo").css({"visibility":"visible"});
    $("#selMissio").html("Visualitzar dades de la missió");
    $("#finestraInfo").modal('show');	
}	

function botoInfoParametres() {	
    $("#modalHeader").html("Elements orbitals");	
    $("#missatge").html('<object type="text/html" data="orbital.html" width="100%" height="450px"></object>');
    $("#finestraInfo").css({"visibility":"visible"});
    $("#finestraInfo").modal('show');
}	

function calPotencia(){
    totalPot=0;
    totalDis=0;
    for (var s=1; s<row_sen.length; s++) {
        totalPot +=parseFloat(row_sen[s][3]);
        totalDis +=parseFloat(row_sen[s][4]);	
    }	

    potSensors = 0;
    disSensors = 0;			   		
    for (var s=1; s<row_sen.length; s++) {
        if ($("#sensor_"+s).prop("checked")){
            potSensors +=parseFloat(row_sen[s][3]);
            disSensors +=parseFloat(row_sen[s][4]);
            sensor[s]=true;   
        } else {
            sensor[s]=false;
        }
    }				   		

    var nPanells=Math.ceil(potSensors/totalPot*5);
    var nDiscs=Math.ceil(disSensors/totalDis*5);
    if (nPanells==0) {nPanells=1;}
    if (nDiscs==0) {nDiscs=1;}
    var nf = Intl.NumberFormat();
    $('#potSensors').html("<td style='width:50%; background-color: #cacaca'>Potència necessària (W): "+nf.format(potSensors)+"</td>");//<td style='width:50%; background-color: #cacaca'>Panells solars : "+nPanells+"</td>")
    $('#disSensors').html("<td style='width:50%; background-color: #cacaca'>Ocupació d'espai de disc (kb/s): "+nf.format(disSensors)+"</td>");//<td style='width:50%; background-color: #cacaca'>Unitats de disc : "+nDiscs+"</td>");				        		
}	

function botoInfoSatelit() { 	
    var msgDiv="<iframe src='https://edumet.cat/areatac/zenit/visor-zenit.html' height='600' width='75%'></iframe>" 
    $("#modalHeader").html("Informació del satèl·lit");			
    $("#missatge").html(msgDiv);
    $("#finestraInfo").css({"visibility":"visible"});
    $("#finestraInfo").modal('show');		    		
}	

function botoMostraInstruccions() {
    $("#modalHeader").html("Incorpora't a una missió!");	
    $("#missatge").html('<object type="text/html" data="missio_ods-instruccions.html" width="100%" height="450px"></object>');
    $("#finestraInfo").css({"visibility":"visible"});
    $("#finestraInfo").modal('show');
}

function zona_trossos(k) {
    var latTros, lonTros;
    var num_trossos = 0;
    var esDintre;
    for (i=0;i<midaQuadre*2;i++) {
        for (j=0;j<midaQuadre;j++) {
            esDintre = false;
            lonTros = (-1 + i / midaQuadre) * Math.PI;
            latTros = (0.5 - j / midaQuadre) * Math.PI;
            distanciaActual=distancia(angleLatZona[k],latTros,angleLonZona[k],lonTros);
            if (distanciaActual<parametres.radiZona*1000) {
                esDintre = true;							
            }
            lonTros = (-1 + (i+1) / midaQuadre) * Math.PI;
            latTros = (0.5 - j / midaQuadre) * Math.PI;
            distanciaActual=distancia(angleLatZona[k],latTros,angleLonZona[k],lonTros);
            if (distanciaActual<parametres.radiZona*1000) {
                esDintre = true;							
            }
            lonTros = (-1 + i / midaQuadre) * Math.PI;
            latTros = (0.5 - (j+1) / midaQuadre) * Math.PI;
            distanciaActual=distancia(angleLatZona[k],latTros,angleLonZona[k],lonTros);
            if (distanciaActual<parametres.radiZona*1000) {
                esDintre = true;							
            }
            lonTros = (-1 + (i+1) / midaQuadre) * Math.PI;
            latTros = (0.5 - (j+1) / midaQuadre) * Math.PI;
            distanciaActual=distancia(angleLatZona[k],latTros,angleLonZona[k],lonTros);
            if (distanciaActual<parametres.radiZona*1000) {
                esDintre = true;						
            }
            if (esDintre) {
                num_trossos++;							
            }			
        }	
    }
    return num_trossos;
}

function zona_visibles(k) {
    var num_trossos = 0;
    for (i=0;i<midaQuadre*2;i++) {
        for (j=0;j<midaQuadre;j++) {
                if (tros[i][j].visible) {
                num_trossos++;
            }
        }
    }
    return num_trossos;
}

function restaura() {
    estat = 1;
    $("#estat_missio").html("Assignada");
    $("#dies_restants").html(limit_mis);	
    $("#cobertura").css("color","yellow");
    $("#hores_exploració").css("color","yellow");
    $("#transferència").css("color","yellow");		
    reset();
    canviaParametres();
}

function reset() {
    enPausa = true;
    $("#hores_exploració").html(0);
    $("#transferència").html(0);
    $("#cobertura").html(0);
    $("#compleció").html(0);
    $(".cr.number.has-slider").css("pointer-events","unset");
    $("#no-energy").css("display","none");
    $("#no-discs").css("display","none");
    estil.backgroundColor = 'green';
    botoIniciar.name("I N I C I A");
    folder1.open();
    folder4.open();
    //canviaParametres();
}

function fes_pdf(text_informe) {
    var docDefinition = {
        content: [{text:"INFORME DE LA MISSIÓ\n\n", fontSize: 16},{text:text_informe}
        ]
    };
    pdfMake.createPdf(docDefinition).download('informe.pdf');
}