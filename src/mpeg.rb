# Author: Tim Schofield
# Class to describe a MPEG music file

require_relative 'audiofile.rb'

class Mpeg < AudioFile

  EXT = '.mp3'

  # Verify filename is a .mp3 file
  def initialize(filename)
    super(filename, EXT)
  end

  # Read tag using TagLib MPEG module
  def tag
    super('TagLib::MPEG::File')
  end
end
