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

### Status

My RSPec file is set up, as are my first passes at MP3 and FLAC
file classes. Tests can be run from the main directory using the following
command:

    rspec test/spec.rb

Lately my time has been spent polishing and improving the player and playlist
portions of the GUI (continuous play, shuffling, add/remove songs from the PL,
skipping to the next / previous song). While there are some additional features
that would be nice-to-haves (drag and drop to change song order), it's time to
move on to the library portion of the project.

For the library, my time is going to be split between javascript/CSS, Ruby, and
MySQL. Originally I had planned to incorporate cover art into the library GUI,
but for now a text based approach that reuses parts of the playlist seems more
realistic.

### Non Ruby Dependencies

+ [taglib](http://taglib.github.io/)

        sudo apt-get install libtag1-dev   

+ [avconv](http://libav.org/)

    Debian fork of the FFmpeg project. May add option
to use FFmpeg in the future. This is the default tool distributed with Ubuntu
and its derivatives.
