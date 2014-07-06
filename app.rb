require 'rubygems'
require 'sinatra'
require 'haml'
require 'json'
require_relative 'src/app_helpers.rb'
require_relative 'src/flac.rb'
require_relative 'src/mpeg.rb'
require_relative 'src/server_config.rb'

helpers AppHelpers

configure do
  set :config, ServerConfig.new('config.json')
  set :playNames, ["file01.ogg",
                   "file02.ogg",
                   "file03.ogg",
                   "file04.ogg"];
  set :converted, {}
  include AppHelpers
  set :database, startupDB(settings.config)
end

# Main Page
get '/' do
  haml :home, :layout => :index, :format => :html5
end

get '/getartists' do
  first = params[:first_letter]
  artists = settings.database.artists_by_letter(first)
  JSON.generate(artists)
end

get '/getalbumsbyartist' do
  artist = params[:artist]
  albums = settings.database.albums_by_artist(artist)
  JSON.generate(albums)
end

get '/getsongsbyalbum' do
  album = params[:album]
  songs = settings.database.songs_by_album(album)
  JSON.generate(songs)
end

get '/getsonginfo' do
  id = params[:id]
  song = settings.database.song_info(id)
  JSON.generate(song)
end

get '/music' do
  id = params[:songID]
  song = settings.database.song_info(id)
  ext = File.extname(song[:path]).downcase
  
  case ext
  when Mpeg::EXT
    audio = Mpeg.new(song[:path])
  when Flac::EXT
    audio = Flac.new(song[:path])
  else
    audio = nil
  end
  unless audio.nil?
    if (settings.converted.has_key?(id))
      settings.converted[id]
    else
      tempfile = settings.playNames.shift
      settings.playNames.push(tempfile)
      audio.convert(settings.config.opts[:converter], "public/" + tempfile)
      if (settings.converted.length == 4)
        settings.converted.shift
      end
      settings.converted[id] = '/' + tempfile
    end
  end
end
