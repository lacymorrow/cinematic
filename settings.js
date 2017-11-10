// // var secrets = require('./secrets');

// var settings = {
//     /* Secrets */
//     // api_key: (secrets.api_key) ? secrets.api_key : false, // http://docs.themoviedb.apiary.io/ config
//     // omdb_key: (secrets.omdb_key) ? secrets.omdb_key : false, // omdb api key    
    
//     api_key: '9d2bff12ed955c7f1f74b83187f188ae', // http://docs.themoviedb.apiary.io/ config
//     omdb_key: 'e0341ca3', // omdb key

//     /* Defaults */
//     DEFAULT_PATH: '/Users/',
//     sort_types: ["Alphabetical", "Popularity", "Release Date", "Runtime", "Random" /*, "Ratings" */ ],
//     recurse_level: 1, // how many directory levels to recursively search. higher is further down the rabbit hole === more processing time
//     rating_delay: 5000, // milli-seconds of rating rotate interval; 5000 = 5 seconds

//     /* SERVER */
//     valid_types: ['.avi', '.flv', '.mp4', '.m4v', '.mov', '.ogg', '.ogv', '.vob', '.wmv', '.mkv'],
//     base_url: "http://image.tmdb.org/t/p/",
//     secure_base_url: "https://image.tmdb.org/t/p/",
//     genre_url: "http://api.themoviedb.org/3/genre/movie/list",
//     backdrop_size: 'w1280', // "w300", "w780", "w1280", "original"
//     poster_size: 'w780', //"w92", "w154", "w185", "w342", "w500", "w780", "original",
//     /* app-specific */
//     // -- affects how app is run and may affect performance
//     cache: 3600, // seconds; 604800 = 7 days
//     overview_length: 'full', // "short", "full" - from omdb
//     parse_method: "parse", // Filename parsing options: "regex", "parse"; regex is kinda faulty but perfect for well-organized files lile This[2004].avi
//     max_connections: 4, // max number of simultaneous
//     retry_delay: 3000, // milli-seconds delay of retrying failed api requests to alieviate thousands of simultaneous requests;
//     ignore_list: ['sample', 'etrg'], // a lowercase list of movie titles to ignore; ex: sample.avi; could add performance issues

// }