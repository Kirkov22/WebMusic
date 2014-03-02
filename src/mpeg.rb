# Author: Tim Schofield
# Class to describe a MPEG music file

require_relative 'audiofile.rb'

class Mpeg < AudioFile

  # Verify filename is a .mp3 file
  def initialize(filename)
    super(filename, '.mp3')
  end

  # Read tag using TagLib MPEG module
  def tag
    super('TagLib::MPEG::File')
  end
end
