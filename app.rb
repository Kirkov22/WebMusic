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
  if settings.converted.has_key?(id)
    settings.converted[id]
  else
    mp3 = Mpeg.new(settings.songs[id])
    tempfile = settings.playNames.shift
    settings.playNames.push(tempfile);
    mp3.convert(settings.config.opts[:converter], "public/" + tempfile)
    if settings.converted.length == 4
      settings.converted.shift
    end
    settings.converted[id] = '/' + tempfile
  end
end
