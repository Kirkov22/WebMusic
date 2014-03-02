# Class to describe a MPEG music file
require 'taglib'

module Flac

  class FileNotFoundError   < Exception; end
  class WrongExtensionError < Exception; end

  class AudioFile
    attr_reader :filepath
    
    def initialize(filepath)
      raise FileNotFoundError.new unless File.exists?(filepath)
      ext = File.extname(filepath)
      raise WrongExtensionError.new("Detected #{ext} instead of .flac") unless ext == '.flac'
      @filepath = filepath
    end
    
    # Read FLAC tag
    def tag
      {}.tap do |tag|
        TagLib::FLAC::File.open(@filepath) do |flac_file|
          flac_tag = flac_file.tag
          
          tag[:artist]  = flac_tag.artist
          tag[:album]   = flac_tag.album
          tag[:title]   = flac_tag.title
          tag[:year]    = flac_tag.year
          tag[:track]   = flac_tag.track
          tag[:genre]   = flac_tag.genre
          tag[:comment] = flac_tag.comment
        end
      end
    end
    
    # Converts to Vorbis file, 128kpbs bitrate
    def convert_to(outfile)
      system "avconv -i #{@filepath} -y -loglevel panic -codec:a libvorbis -b 128k #{outfile}"
    end
  end
end
