# Personal Music Streamer

This goal of this project is to be able to select and stream MP3 and FLAC files
from a personal music collection through a website. This project is an
opportunity to explore the following:

+ __Test Driven Development__ - Use [RSpec](http://rspec.info/) to build unit
tests and guide development.   
+ __MySQL__ - Use a MySQL database to simplify and standardize the display of
songs and the creation of playlists.   
+ __Javascript__ - Use Javascript to interact with a Sinatra app and dynamically
modify the page

### Non Ruby Dependencies

+ [taglib](http://taglib.github.io/)

        sudo apt-get install libtag1-dev   

+ [avconv](http://libav.org/) or [ffmpeg](https://www.ffmpeg.org/)

    avconv is a Debian fork of the FFmpeg project. This is the default tool
    distributed with Ubuntu and its derivatives. The audio converter on your
    system should be specified in the `converter` entry of the config.json file.

+ MySQL server

    This project stores and retrieves audio file information in a MySQL
    database. The database name is stored in the `db_name` entry in config.json,
    while the username and password should be stored in the environment
    variables `WEBMUSIC_DB_UNAME` and `WEBMUSIC_DB_PWORD`. The path to your
    MySQL config file should also be stored in the `mysql_config` entry of
    config.json; this ensures the mysql Ruby gem will connect to the appropriate
    port and socket.

    The music database must have tables created as follows:

          CREATE TABLE artists (
            artist_id MEDIUMINT UNSIGNED AUTO_INCREMENT,
            name VARCHAR(100),
            CONSTRAINT pk_artist_id PRIMARY KEY (artist_id),
            CONSTRAINT uniq_artist_name UNIQUE (name)
          );

          CREATE TABLE albums (
            album_id MEDIUMINT UNSIGNED AUTO_INCREMENT,
            name VARCHAR(100),
            CONSTRAINT pk_album_id PRIMARY KEY (album_id),
            CONSTRAINT uniq_album_name UNIQUE (name)
          );

          CREATE TABLE songs (
            song_id MEDIUMINT UNSIGNED AUTO_INCREMENT,
            title VARCHAR(100),
            artist_id MEDIUMINT UNSIGNED,
            album_id MEDIUMINT UNSIGNED,
            track TINYINT UNSIGNED,
            release_year YEAR,
            path VARCHAR(512),
            CONSTRAINT pk_song_id PRIMARY KEY (song_id),
            CONSTRAINT fk_songs_artist_id FOREIGN KEY (artist_id)
              REFERENCES artists (artist_id),
            CONSTRAINT fk_songs_album_id FOREIGN KEY (album_id)
              REFERENCES albums (album_id),
            CONSTRAINT uniq_song_path UNIQUE (path)
          );

### Usage

This project includes an RSpec test suite for my basic Ruby classes. It can be
executed from the project's root directory using the following command:

    rspec test/spec.rb

This project also includes a script to take information from audio files and
insert them as entries in the database. Existing entries are simply updated.
Files are read from within the directory specified by the `path` entry in
config.json. To run this script, use the following command from the project's
root directory:

    ruby src/build_db.rb

Lastly, this is a Sinatra project, so the main application is found in app.rb in
the project's root directory.

### Status

Right now the project is in a functional but incomplete form. My original
learning goals have been met, and for now I'm going to move on to other things.
There are a few issues I'm aware of:

+ CSS does not work for all browsers

    When I developed the CSS for the page, I only used Firefox as my browser. It
    turns out Chrome does not support the same table formatting options that
    Firefox does, so at a minimum my CSS for tables needs to be revisited.

+ Javascript does not work for all browsers

    The audio player portion of the page is completely unresponsive in IE.

+ UI Improvements

    Add better library navigation and drag & drop song selection.

+ Database functionality

    Add a proper "scan for updates" function instead of my brute force script.
