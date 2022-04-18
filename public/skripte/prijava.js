var sorodnik;

$(document).ready(() => {
    var vnosDrzave = document.getElementById("Country");
    var check = document.getElementById("UstreznaDrzava")
    var validnaDrzava;

    vnosDrzave.addEventListener("keyup", function() {
        const prepovedaniVnosi = /[^a-z' ]/i;
        const zacetek = /[^A-Z]/;
        if (
            vnosDrzave.value.length < 3 || vnosDrzave.value.length > 15 ||
            prepovedaniVnosi.test(vnosDrzave.value) ||
            zacetek.test(vnosDrzave.value[0])
        ) {
            vnosDrzave.classList.remove("dovoljeno");
            check.classList.replace("fa-check", "fa-times");
            validnaDrzava = false;
        } else {
            vnosDrzave.classList.add("dovoljeno");
            check.classList.replace("fa-times", "fa-check");
            validnaDrzava = true;
        }
        validnost();
    });

    var vnosPriimka = document.getElementById("LastName");
    var vnosPodjetja = document.getElementById("CompanyString");
    var dopolni = document.getElementById("dopolniPodatke");

    vnosPriimka.addEventListener("keyup", function() {
        var priimek = vnosPriimka.value.toUpperCase();
        if (priimek != "") {
            $.get("/najdi_sorodnika/" + priimek, (odgovor) => {
                var stranka = odgovor;
                if (stranka.LastName !== undefined) {
                    const tipi = ["zadruga", "so.p", "s.p.", "d.o.o.", "d.n.o.", "d.d.", "k.d."];
                    dopolni.disabled = false;
                    dopolni.title = stranka.FirstName + " " + stranka.LastName
                    //autofill
                    dopolni.addEventListener("click", function() {
                        var firma = stranka.Company;
                        if (firma !== null) {    
                            var indeks = firma.length;
                            tipi.forEach(function (tipPodjetja) {
                                if (firma.indexOf(tipPodjetja) > 0) {
                                    indeks = firma.indexOf(tipPodjetja);
                                }
                            });
                            document.getElementById("CompanyString").value = firma.substring(0, indeks);
                        } else {
                            document.getElementById("CompanyString").value = "";
                        }
                        document.getElementById("Address").value = stranka.Address;
                        document.getElementById("State").value = stranka.State;
                        document.getElementById("PostalCode").value = stranka.PostalCode;
                        document.getElementById("City").value = stranka.City;
                        document.getElementById("Country").value = stranka.Country;
                        document.getElementById("Country").dispatchEvent(new Event("keyup"));
                        document.getElementById("Phone").value = stranka.Phone;
                        document.getElementById("Fax").value = stranka.Fax;
                        if (stranka.Email !== undefined && stranka.Email.includes("@")) {
                            document.getElementById("Email").value = "@" + stranka.Email.split("@")[1];
                        }
                        validnost();
                    });
                } else {
                    dopolni.disabled = true;
                }
            });
        }

    });

    vnosPodjetja.addEventListener("keyup", function() {
        validnost();
    });

    var reg = document.getElementById("Register");

    function validnost() {
        if (validnaDrzava && document.getElementById("CompanyString").value !== "") {
            reg.disabled = false;
        } else {
            reg.disabled = true;
        }
    }

    var izbiraRacuna = document.getElementById("seznamRacunov")
    izbiraRacuna.addEventListener("change", function() {
        var rating = document.getElementById("najboljeOcenjeniFilm");
        var racunId = izbiraRacuna.options[izbiraRacuna.selectedIndex].value;
        $.get("/filmi-racuna/" + racunId, (odgovor) => {
            var najvecjaOcena = Math.max.apply(Math, odgovor.map(function(film) {
                return film.ocena;
            }));
            odgovor.forEach((film) => {
                if (odgovor.length == 1) {
                    let url = "https://www.imdb.com/title/" + film.imdb
                    rating.innerHTML = "Edini film na računu je " + film.opisArtikla.link("https://www.imdb.com/title/" + film.imdb) + " z oceno " + film.ocena.toString().replace(".", ",") + ".";
                    rating.getElementsByTagName("a")[0].target="_blank";
                } else {
                    if (film.ocena == najvecjaOcena) {
                    rating.innerHTML = "Najbolje ocenjeni film na računu je " + film.opisArtikla.link("https://www.imdb.com/title/" + film.imdb) + " z oceno " + film.ocena.toString().replace(".", ",") + ".";
                    rating.getElementsByTagName("a")[0].target="_blank";    
                    }
                }
            });
        });
    });
});

