require 'rubygems'
require 'sinatra'
require 'haml'
require_relative 'src/mpeg.rb'

# Main Page
get '/' do
  haml :home, :layout => :index, :format => :html5
end

# Test for Javascript
post '/music' do
  mp3 = Mpeg.new("public/" + params[:song])
  tempfile = "out.ogg"
  mp3.convert_to("public/" + tempfile)
  return '/' + tempfile
end
