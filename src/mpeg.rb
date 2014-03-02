require_relative 'audiofile'

class Mpeg < AudioFile

  def initialize(filepath)
    super({
      ext:      ".mp3",
      filepath: filepath })
  end
end