# Author: Tim Schofield
# Helper methods for the main Sinatra app
require_relative 'flac.rb'
require_relative 'mpeg.rb'
require_relative 'database.rb'

module AppHelpers

  class FileNotFoundError < Exception; end
  
  def startupDB(server_config)
    opts = {
      host:   'localhost',
      user:   ENV['WEBMUSIC_DB_UNAME'],
      pword:  ENV['WEBMUSIC_DB_PWORD'],
      db:     server_config.opts[:db_name],
      port:   getMySQLPort(server_config.opts[:mysql_config]),
      sock:   getMySQLSocket(server_config.opts[:mysql_config])
    }
    Database.new(opts)
  end

  def getMySQLSocket(mysql_config)
    # expects config file to have the following contents:
    # [client]
    # ...
    # socket = <path to socket>

    raise FileNotFoundError.new("File not found at #{mysql_config}") unless
      File.exists? mysql_config
    File.open(mysql_config, "r") do |config|
      contents = config.read
      socket = /\[client\].*?^socket\s*=(.*?)$/m.match(contents)[1]
      socket.strip
    end
  end

  def getMySQLPort(mysql_config)
    # expects config file to have the following contents:
    # [client]
    # ...
    # port = <port number>

    raise FileNotFoundError.new("File not found at #{mysql_config}") unless
      File.exists? mysql_config
    File.open(mysql_config, "r") do |config|
      contents = config.read
      port = /\[client\].*?^port\s*=(.*?)$/m.match(contents)[1]
      port.to_i
    end
  end
end
