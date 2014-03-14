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

Currently I'm prototyping various page functions. I've already done rough
versions of converting an MP3 and adding it as an audio node, as well as listing
files in a table using tag data. Next will be a simple form for configuring the
server options and creating a playlist.

### Non Ruby Dependencies

+ [taglib](http://taglib.github.io/)

        sudo apt-get install libtag1-dev   

+ [avconv](http://libav.org/)

    Debian fork of the FFmpeg project. May add option
to use FFmpeg in the future. This is the default tool distributed with Ubuntu
and its derivatives.
