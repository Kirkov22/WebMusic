class AudioFile
  
  class FileNotFoundError   < Exception; end
  class WrongExtensionError < Exception; end
  
  attr_reader :filepath
  
  def initialize(opts)
    raise FileNotFoundError.new unless File.exists?(opts[:filepath])
    ext = File.extname(opts[:filepath])

    raise WrongExtensionError.new("Detected #{ext} instead of #{opts[:ext]}") unless ext == opts[:ext]
    @filepath = opts[:filepath]
  end
  
  def tag
    file_type = Kernel.const_get(self.class.to_s.upcase)

    {}.tap do |tag|
      TagLib::file_type::File.open(@filepath) do |audio_file|
        audio_tag = audio_file.tag
        
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
    system "avconv -i #{filepath} -y -loglevel panic -codec:a libvorbis -b 128k #{outfile}"
  end
end