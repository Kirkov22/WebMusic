# Author: Tim Schofield
# Helper methods for the main Sinatra app
require_relative 'flac.rb'
require_relative 'mpeg.rb'

module AppHelpers

  class FileNotFoundError < Exception; end
  
  # Return a hash of tags for the music files at path
  def tagArray(path)
    [].tap do |taglist|
      i = 0
      listMusicFiles(path).each do |file|
        ext = File.extname(file).downcase
        
        case ext
        when Mpeg::EXT
          song = Mpeg.new(file).tag.clone
        when Flac::EXT
          song = Flac.new(file).tag.clone
        else
          song = {
            artist:  "Unhandled extension - #{ext}",
            album:   "",
            title:   "",
            year:    "",
            track:   "",
            genre:   "",
            comment: ""
          }
        end
        
        # TODO: Assign each song an ID through MySQL
        id = i.to_s
#         id = i.to_s.rjust(5,'0').to_sym
        
        # TODO: Remove these lines once path & id are in MySQL
        song[:id] = id
        song[:path] = file
        
        i += 1
        taglist.push(song)
      end
    end
  end
  
  # Return an array of music files at path
  def listMusicFiles(path)
    Dir.glob(path + "**{" + Mpeg::EXT + "," + Flac::EXT + "}", caseinsensitive)
  end
  
  # Flag for case insensitive glob expression
  def caseinsensitive
    File::FNM_CASEFOLD
  end
  
  def getMySQLSocket(mysql_config)
    # expects config file to have the following contents:
    # [mysqld]
    # ...
    # socket = <path to socket>

    raise FileNotFoundError.new("File not found at #{mysql_config}") unless
      File.exists? mysql_config
    File.open(mysql_config, "r") do |config|
      contents = config.read
      socket = /\[mysqld\].*?^socket\s*=(.*?)$/m.match(contents)[1]
      socket.strip
    end
  end

  def getMySQLPort(mysql_config)
    # expects config file to have the following contents:
    # [mysqld]
    # ...
    # port = <port number>

    raise FileNotFoundError.new("File not found at #{mysql_config}") unless
      File.exists? mysql_config
    File.open(mysql_config, "r") do |config|
      contents = config.read
      port = /\[mysqld\].*?^port\s*=(.*?)$/m.match(contents)[1]
      port.to_i
    end
  end
end
