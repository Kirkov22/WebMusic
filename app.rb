require 'rubygems'
require 'sinatra'
require 'haml'
require 'json'
require_relative 'src/app_helpers.rb'
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
post '/music' do
  mp3 = Mpeg.new("public/" + params[:song])
  tempfile = "out.ogg"
  mp3.convert_to(settings.config.opts[:converter], "public/" + tempfile)
  return '/' + tempfile
end
