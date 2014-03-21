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
  # TODO: Remove once MySQL database is set up
  set :songs, {}
end

# Main Page
get '/' do
  haml :home, :layout => :index, :format => :html5
end

# Retrieve music file list
get '/getfilelist' do
  files = tagArray(settings.config.opts[:path])
  files.each do |song|
    settings.songs[song[:id]] = song[:path]
  end
  JSON.generate(files)
end

# Test for Javascript
get '/music' do
  id = params[:songID]
#   puts id
#   puts settings.songs
#   puts settings.songs[id.to_str]
  mp3 = Mpeg.new(settings.songs[id])
#   mp3 = Mpeg.new("public/" + params[:song])
  tempfile = "other.ogg"
#   mp3.convert("avconv", tempfile)
  mp3.convert(settings.config.opts[:converter], "public/" + tempfile)
  '/' + tempfile
end
