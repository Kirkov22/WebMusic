# Author: Tim Schofield
# Class to describe a generic music file

require 'taglib'

class AudioFile

  class FileNotFoundError < Exception; end
  class WrongExtensionError < Exception; end

  attr_reader :filepath
  
  # Each subclass of AudioFile must provide its own extension name
  def initialize(filepath, checked_ext = ".none")
    raise FileNotFoundError.new("Couldn't find #{filepath}.") unless File.exists?(filepath)
    ext = File.extname(filepath).downcase
    raise WrongExtensionError.new("Detected #{ext} instead of #{checked_ext}") unless ext == checked_ext
    @filepath = filepath
  end
  
  # Read back tag info
  def tag(taglib_filetype = 'TagLib::FLAC::File')
    {}.tap do |tag|
      Kernel.const_get(taglib_filetype).open(@filepath) do |flac_file|
        audio_tag = flac_file.tag

        tag[:artist]  = audio_tag.artist
        tag[:album]   = audio_tag.album
        tag[:title]   = audio_tag.title
        tag[:year]    = audio_tag.year
        tag[:track]   = audio_tag.track
        tag[:genre]   = audio_tag.genre
        tag[:comment] = audio_tag.comment
      end
    end
  end
  
  # Converts to Vorbis file, 128kpbs bitrate
  def convert_to(outfile)
    system "avconv -i #{@filepath} -y -loglevel panic -codec:a libvorbis -b 128k #{outfile}"
  end
end
