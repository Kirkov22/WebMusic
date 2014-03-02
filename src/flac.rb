require_relative 'audiofile'

class Flac < AudioFile
  
  def initialize(filepath)
    super({
      ext:      ".flac",
      filepath: filepath })
  end
end