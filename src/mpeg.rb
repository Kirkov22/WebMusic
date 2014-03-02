require_relative 'audiofile'

class Mpeg < AudioFile
  
  def initialize(filepath)
    super({
      ext:      ".mpeg",
      filepath: filepath })
  end
end