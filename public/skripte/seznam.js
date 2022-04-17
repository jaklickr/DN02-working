// Globalne spremenljivke
let sifranti = {
  leto: [],
  zanr: [],
};
let filmi = [];

// Premakni film iz seznama (desni del) v košarico (levi del)
const premakniFilmIzSeznamaVKosarico = (
  id,
  naslov,
  datum,
  ocena,
  trajanje,
  azuriraj
) => {
  if (azuriraj)
    $.get("/kosarica/" + id, (podatki) => {
      /* Dodaj izbran film v sejo */
    });

  // Dodaj film v desni seznam
  $("#kosarica").append(
    "<div id='" +
      id +
      "' class='film'> \
           <button type='button' class='btn btn-light btn-sm'> \
             <i class='fas fa-minus'></i> \
               <strong><span class='naslov' dir='ltr'>" +
      naslov +
      "</span></strong> \
           <i class='fas fa-calendar-days'></i><span class='datum-izdaje'>" +
      datum +
      "</span> \
          <i class='fas fa-signal'></i><span class='ocena'>" +
      ocena +
      "</ocena>\
          <i class='far fa-clock'></i><span class='trajanje'>" +
      trajanje +
      "</span> min \
            </button> \
          </div>"
  );

  // Dogodek ob kliku na film v košarici (na desnem seznamu)
  $("#kosarica #" + id + " button").click(function () {
    let film_kosarica = $(this);
    $.get("/kosarica/" + id, (podatki) => {
      /* Odstrani izbrano film iz seje */
      // Če je košarica prazna, onemogoči gumbe za pripravo računa
      if (!podatki || podatki.length == 0) {
        $("#racun_html").prop("disabled", true);
        $("#racun_xml").prop("disabled", true);
      }
    });
    // Izbriši film iz desnega seznama
    film_kosarica.parent().remove();
    // Pokaži film v levem seznamu
    $("#filmi #" + id).show();
  });

  // Skrij film v levem seznamu
  $("#filmi #" + id).hide();
  // Ker košarica ni prazna, omogoči gumbe za pripravo računa
  $("#racun_html").prop("disabled", false);
  $("#racun_xml").prop("disabled", false);
};

$(document).ready(() => {
  // Posodobi izbirne gumbe filtrov
  $.get("/filtri", (podatki) => {
    sifranti = podatki.sifranti;
    filmi = podatki.filmi;
    let parametri = ["leto", "zanr"];
    
    parametri.forEach((parameter) => {
      //console.log(sifranti["leto"]);
      $("#" + parameter + "-stevilo").html(sifranti[parameter].length);
      $("#" + parameter + "-izbira").append("<option value=''>...</option>");
      sifranti[parameter].forEach((vrednost) => {
        $("#" + parameter + "-izbira").append(
          "<option value='" + vrednost + "'>" + vrednost + "</option>"
        );
      });
    });
    
    function filterPoFilmih (leto, zanr) {
      var filtriraniFilmi = [];

      filmi.forEach(film => {
        if (leto == "" && zanr == "") {
          filtriraniFilmi.push(film);
        } else if (leto == "" && zanr != "") {
          if(film.zanri.split(",").includes(zanr)) {
            filtriraniFilmi.push(film);
          }
        } else if (zanr == "" && leto != "") {
          if(film.datumIzdaje.split("-", 1)[0] == leto) {
            filtriraniFilmi.push(film);
          }
        } else {
          if(film.zanri.split(",").includes(zanr) && film.datumIzdaje.split("-", 1)[0] == leto) {
            filtriraniFilmi.push(film);
          }
        }
      });

      return filtriraniFilmi;
    }

    var letoFilter = document.getElementById("leto-izbira");
    var zanrFilter = document.getElementById("zanr-izbira");
    var seznamFilmov = document.getElementById("filmi");

    function letaPoFiltru(filmi) {
      var leta = [];

      filmi.forEach(film => {
        if(!leta.includes(film.datumIzdaje.split("-", 1)[0])) {
          leta.push(film.datumIzdaje.split("-", 1)[0]);
        }
      });

      return leta;
    }

    function zanriPoFiltru(filmi) {
      var zanri = [];

      filmi.forEach(film => {
        for (var i = 0; i < film.zanri.split(",").length; i++) {
          if (!zanri.includes(film.zanri.split(",")[i])) {
            zanri.push(film.zanri.split(",")[i]);
          }
        }
      })

      return zanri;
    }

    function idjiPoFiltru(filmi) {
      var idji = [];

      filmi.forEach(film => {
        if (!idji.includes(film.id)) {
          idji.push(film.id.toString());
        }
      })

      return idji;
    }

    function posodobiFiltre(filmi) {
      $("#zanr-stevilo").html(zanriPoFiltru(filmi).length);
      $("#leto-stevilo").html(letaPoFiltru(filmi).length);

      for (var i = 1; i <= sifranti["leto"].length; i++) {
        if (letaPoFiltru(filmi).includes(letoFilter[i].value)) {
          letoFilter[i].disabled = false;
        } else {
          letoFilter[i].disabled = true;
        }
      }
      for (var i = 1; i <= sifranti["zanr"].length; i++) {
        if (zanriPoFiltru(filmi).includes(zanrFilter[i].value)) {
          zanrFilter[i].disabled = false;
        } else {
          zanrFilter[i].disabled = true;
        }
      }
    }

    function filtrirajFilme(filmi) {
      var izbire = document.querySelectorAll(".film");
      izbire.forEach(film => {
        if (idjiPoFiltru(filmi).includes(film.id)) {
          film.getElementsByTagName("button")[0].style.opacity = "1.0";
        } else {
          film.getElementsByTagName("button")[0].style.opacity = "0.3";
        }
      });
    }

    letoFilter.addEventListener("change", () => {
      posodobiFiltre(filterPoFilmih(letoFilter.value, zanrFilter.value));
      filtrirajFilme(filterPoFilmih(letoFilter.value, zanrFilter.value));
    })
    
    zanrFilter.addEventListener("change", () => {
      posodobiFiltre(filterPoFilmih(letoFilter.value, zanrFilter.value));
      filtrirajFilme(filterPoFilmih(letoFilter.value, zanrFilter.value));

    })
    
  });

  // Posodobi podatke iz košarice na spletni strani
  $.get("/kosarica", (kosarica) => {
    kosarica.forEach((film) => {
      premakniFilmIzSeznamaVKosarico(
        film.stevilkaArtikla,
        film.opisArtikla.split(" (")[0],
        film.datumIzdaje,
        film.ocena,
        film.trajanje,
        false
      );
    });
  });

  // Klik na film v levem seznamu sproži
  // dodajanje filma v desni seznam (košarica)
  $("#filmi .film button").click(function () {
    let film = $(this);
    premakniFilmIzSeznamaVKosarico(
      film.parent().attr("id"),
      film.find(".naslov").text(),
      film.find(".datum-izdaje").text(),
      film.find(".ocena").text(),
      film.find(".trajanje").text(),
      true
    );
  });

  // Klik na gumba za pripravo računov
  $("#racun_html").click(() => (window.location = "/izpisiRacun/html"));
  $("#racun_xml").click(() => (window.location = "/izpisiRacun/xml"));

  

  // Graf
  window.onload = function() {
    var CFR = [];
    var DTA = [];
    var CFRpoLetih = {};
    var DTApoLetih = {};
    
    $.get("/filtri", (podatki) => {
    filmi = podatki.filmi;

    function stCFR() {
      var stCFRI = 0;
      filmi.forEach((film) => {
        if(film.zanri.includes("Comedy") || film.zanri.includes("Family") || film.zanri.includes("Romance")) {
          stCFRI++;
        }
      });
      return stCFRI;
    }

    function stDTA() {
      var stDTAI = 0;
      filmi.forEach((film) => {
        if (film.zanri.includes("Drama") || film.zanri.includes("Thriller") || film.zanri.includes("Action")) {
          stDTAI++;
        }
      });
      return stDTAI;
    }
    
    function parseDataPoints () {
      filmi.forEach((film) => {
        if(film.zanri.includes("Comedy") || film.zanri.includes("Family") || film.zanri.includes("Romance")) {
          var leto = zaokrozi(film.datumIzdaje.split("-", 1)[0]);
          if (leto in CFRpoLetih) {
            CFRpoLetih[leto] += 1;
          } else {
            CFRpoLetih[leto] = 1;
          }
        } 
        if (film.zanri.includes("Drama") || film.zanri.includes("Thriller") || film.zanri.includes("Action")) {
          leto = zaokrozi(film.datumIzdaje.split("-", 1)[0]);
          if (leto in DTApoLetih) {
            DTApoLetih[leto] += 1;
          } else {
            DTApoLetih[leto] = 1;
          }
        }
      });
      Object.keys(CFRpoLetih).forEach(leto => {
        CFR.push({
          x: parseInt(leto),
          y: CFRpoLetih[leto]});
      });
      Object.keys(DTApoLetih).forEach(leto => {
        DTA.push({
          x: parseInt(leto),
          y: DTApoLetih[leto]});
      });
    }
      
      var chart = new CanvasJS.Chart("chartContainer", {
        title:{
          text: "Najboljši filmi čez čas",
          fontColor: "#580000"
        },
        subtitles:[{
          text: "grupirani podatki",
          fontColor: "#009900"
        }
        ],
        axisY:{
          title : "Število filmov",
          crosshair: {
            snapToDataPoint: true,
            enabled: true,
          }
        },
        axisX:{
          valueFormatString: "####",
          crosshair: {
            valueFormatString: "####",
            snapToDataPoint: true,
            enabled: true,
          }
        },
        
        data: [
        {
          type: "line",
          lineDashType: "dash",
          showInLegend: true,
          legendText: "Komedije, družinski in romance (" + stCFR() + ")",
          xValueFormatString: "####",
          dataPoints : CFR,
          markerType: "circle",
          color: "#FFA500",
          //markerColor: "#FFA500"
        },
        {
          type: "line",
          showInLegend: true,
          legendText: "Drame, Akcije, Trilerji ("  + stDTA() + ")",
          xValueFormatString: "####",
          dataPoints : DTA,
          markerType: "square",
          color: "#00468b",
          //markerColor: "#00468b"
        },
        ]
      });
      //console.log(DTA);
      //console.log(CFR);
      parseDataPoints();
      chart.render();
    });
  };

  function zaokrozi(num) {
    if (num % 10 < 5) {
      return Math.floor(num / 10) * 10;
    } else {
      return (Math.floor(num / 10) * 10) + 5;
    }
  };
});