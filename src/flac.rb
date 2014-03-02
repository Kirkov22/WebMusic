# Author: Tim Schofield
# Class to describe a FLAC music file

require_relative 'audiofile.rb'

class Flac < AudioFile

  # Verify filename is a .flac file
  def initialize(filename)
    super(filename, '.flac')
  end

  # Read tag using TagLib FLAC module
  def tag
    super('TagLib::FLAC::File')
  end
end
