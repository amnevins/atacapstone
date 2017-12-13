var api = (function() {

    var api_key = '0d4e5741aa0f8d374c2c43a8006878e8';
    var popular = 'https://api.themoviedb.org/3/movie/popular?api_key=' + api_key;
    var search = 'https://api.themoviedb.org/3/search/movie?api_key=' + api_key + '&query=';
    var posterPath = 'https://image.tmdb.org/t/p/w500/';
    var apiGWUrl = 'https://u2veqiz2h8.execute-api.us-east-1.amazonaws.com/prod';

    function setHeaders() {
        return new Headers({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        });
    }

    function searchCallback(data) {
        console.log(data.results);
        var results = document.getElementById('results');
        results.innerHTML = '';

        for(var i = 0; i < data.results.length; i++) {

            var resultContainer = document.createElement('div');
            resultContainer.classList.add('center');

            var resultPicture = document.createElement('img');
            resultPicture.setAttribute('src', 'https://image.tmdb.org/t/p/w500/' + data.results[i].poster_path);

            var resultTitle = document.createElement('h2');
            resultTitle.innerHTML = data.results[i].title;

            var resultDescription = document.createElement('p');
            resultDescription.innerHTML = data.results[i].overview;

            var stars = document.querySelector('.starRating').cloneNode(true);
            stars.classList.remove('hidden');
            stars.setAttribute('id', data.results[i].title);


                stars.addEventListener('click', function(e) {
                    var allStars = e.currentTarget.children[0].children;
                    for (var i = 0; i < allStars.length; i++) {
                        allStars[i].classList.remove('selected');
                    }
                    e.target.classList.add('selected');
                    api.saveRating(e.target.getAttribute('data-value'), e.currentTarget.getAttribute('id'));
                });


            resultContainer.appendChild(resultPicture);
            resultContainer.appendChild(resultTitle);
            resultContainer.appendChild(resultDescription);
            resultContainer.appendChild(stars);

            results.appendChild(resultContainer);
        }
    }

    function saveRatingCallback(data) {
        getRatings();
    }

    function getRatingsCallback(data) {
        var favorites = document.getElementById('favorites');
        var stinkers = document.getElementById('stinkers');
        favorites.innerHTML = '';
        stinkers.innerHTML = '';
        for (var i = 0; i < data.length; i++) {
            if (data[i].rating > 3) {
                var newFav = document.createElement('div');
                newFav.innerHTML = data[i].title + " - " + data[i].rating;
                favorites.appendChild(newFav);
            }
            if (data[i].rating < 3) {
                var newStinker = document.createElement('div');
                newStinker.innerHTML = data[i].title + " - " + data[i].rating;
                stinkers.appendChild(newStinker);
            }
        }
        console.log('saved data', data);

    }

    function invokeApig(path, method, body, callback) {

        const url = apiGWUrl + path;

        body = (body) ? JSON.stringify(body) : body;

        fetch(url, {
            method: method,
            body: body,
            mode: 'cors',
            headers: setHeaders()
        })
        .then(function(data) {
            console.log(data)
            return data.json();
        })
        .then(function(data) {
            callback(data);
        })
        .catch(function(err) {
            console.log(err, ' cant save rating');
        });
    }

    function saveRating(rating, title) {
        if(!rating) {
            console.log('no rating');
            return;
        }

        if(!title) {
            console.log('no title');
            return;
        }
        invokeApig('/movies/recommendations', 'post', {rating: rating, title: title}, saveRatingCallback);
    }

    function getRatings() {
        invokeApig('/movies/recommendations', 'get', null, getRatingsCallback);
    }

    function searchMovies(movie) {
        fetch(search + movie, { method: 'get' })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            searchCallback(data);
        })
        .catch(function(err) {
            console.log(err);
        });
    }


    return {
        searchMovies: searchMovies,
        saveRating: saveRating,
        getRatings: getRatings
    }

})();

var init = (function() {
    var search = document.getElementById('search');
    var button = document.getElementById('search-button');
    button.addEventListener('click', function(e) {
        console.log(search.value, " value");
        api.searchMovies(search.value);
    });

    api.getRatings();
})();
