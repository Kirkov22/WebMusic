# Class to describe a MPEG music file
require 'taglib'

class FileNotFoundError < Exception; end

class Mpeg
  attr_reader :filepath
  
  def initialize(filepath)
    raise FileNotFoundError.new unless File.exists?(filepath)
    @filepath = filepath
  end

  # Read ID3v2 (preferred) or ID3v1 tag
  def tag
    tag = {}
    TagLib::MPEG::File.open(@filepath) do |mpeg_file|
      mpeg_tag = mpeg_file.tag
      tag = {
        :artist => mpeg_tag.artist,
        :album => mpeg_tag.album,
        :title => mpeg_tag.title,
        :year => mpeg_tag.year,
        :track => mpeg_tag.track,
        :genre => mpeg_tag.genre,
        :comment => mpeg_tag.comment
      }
    end
    tag
  end

  # Converts to Vorbis file, 128kpbs bitrate
  def convert_to(outfile)
    system "avconv -i #{@filepath} -y -loglevel panic -codec:a libvorbis -b 128k #{outfile}"
  end
end
