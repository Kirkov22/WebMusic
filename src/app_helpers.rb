# Author: Tim Schofield
# Helper methods for the main Sinatra app
require_relative 'flac.rb'
require_relative 'mpeg.rb'

module AppHelpers
  
  # Return a hash of tags for the music files at path
  def tagHash(path)
    {}.tap do |taglist|
      i = 0
      listMusicFiles(path).each do |file|
        ext = File.extname(file).downcase
        key = ("song" + i.to_s.rjust(3,'0')).to_sym
        
        case ext
        when Mpeg::EXT
          taglist[key] = Mpeg.new(file).tag
        when Flac::EXT
          taglist[key] = Flac.new(file).tag
        else
          taglist[key] = {
            artist:  "Unhandled extension - #{ext}",
            album:   "",
            title:   "",
            year:    "",
            track:   "",
            genre:   "",
            comment: ""
          }
        end
        
        i += 1
      end
    end
  end
  
  # Return an array of music files at path
  def listMusicFiles(path)
    Dir.glob(path + "**.{mp3, flac}", caseinsensitive)
  end
  
  # Flag for case insensitive glob expression
  def caseinsensitive
    File::FNM_CASEFOLD
  end
  
end
