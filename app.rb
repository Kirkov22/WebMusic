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
  # TODO: Remove once MySQL database is set up
  include AppHelpers
  songs = tagArray(settings.config.opts[:path])
  set :songs, songs
end

# Main Page
get '/' do
  haml :home, :layout => :index, :format => :html5
end

get '/getartists' do
  first = /^#{params[:first_letter]}/i
  selected = settings.songs.select { |song| song[:artist] =~ first }
  artists = selected.map { |song| song[:artist] }
  JSON.generate(artists.uniq)
end

get '/getalbumsbyartist' do
  artist = params[:artist]
  selected = settings.songs.select { |song| song[:artist] == artist }
  albums = selected.map { |song| song[:album] }
  JSON.generate(albums.uniq)
end

get '/getsongsbyalbum' do
  album = params[:album]
#   keepers = [:title, :id, :track]
  selected = settings.songs.select { |song| song[:album] == album }
#   selected.map { |song| song.keep_if { |k| keepers.include? k }}
  selected.sort_by! { |song| song[:track] }
  JSON.generate(selected)
end

get '/getsonginfo' do
  id = params[:id]
  song = settings.songs.select { |song| song[:id] == id }
  JSON.generate(song[0])
end
# Retrieve music file list
# get '/getfilelist' do
#   files = tagArray(settings.config.opts[:path])
#   files.each do |song|
#     settings.songs[song[:id]] = song[:path]
#   end
#   JSON.generate(files)
# end

# Test for Javascript
get '/music' do
  id = params[:songID]
  if settings.converted.has_key?(id)
    settings.converted[id]
  else
    selected_song = settings.songs.select { |song| song[:id] == id }
    mp3 = Mpeg.new(selected_song[0][:path])
    tempfile = settings.playNames.shift
    settings.playNames.push(tempfile);
    mp3.convert(settings.config.opts[:converter], "public/" + tempfile)
    if settings.converted.length == 4
      settings.converted.shift
    end
    settings.converted[id] = '/' + tempfile
  end
end
