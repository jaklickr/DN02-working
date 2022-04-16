var sorodnik;

$(document).ready(() => {
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
                } else {
                    if (film.ocena == najvecjaOcena) {
                    rating.innerHTML = "Najbolje ocenjeni film na računu je " + film.opisArtikla.link("https://www.imdb.com/title/" + film.imdb) + " z oceno " + film.ocena.toString().replace(".", ",") + ".";
                    }
                }
            });
        });
    });
});

