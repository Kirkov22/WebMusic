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
end

# Main Page
get '/' do
  haml :home, :layout => :index, :format => :html5
end

# Retrieve music file list
get '/getfilelist' do
  JSON.generate(tagHash(settings.config.opts[:path])) 
end

# Test for Javascript
post '/music' do
  mp3 = Mpeg.new("public/" + params[:song])
  tempfile = "out.ogg"
  mp3.convert_to(settings.config.opts[:converter], "public/" + tempfile)
  return '/' + tempfile
end
