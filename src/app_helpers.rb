# Author: Tim Schofield
# Helper methods for the main Sinatra app
require_relative 'flac.rb'
require_relative 'mpeg.rb'

module AppHelpers
  
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
  
end
