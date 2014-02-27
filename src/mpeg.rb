# Class to describe a MPEG music file
require 'taglib'

class FileNotFoundError < Exception; end

class Mpeg
  attr_reader :filepath, :tag
  
  def initialize(filepath)
    raise FileNotFoundError.new unless File.exists?(filepath)
    @filepath = filepath
    mp3 = TagLib::MPEG::File.open(@filepath) do |mpeg_file|
      mpeg_tag = mpeg_file.tag
      @tag = {
        :artist => mpeg_tag.artist,
        :album => mpeg_tag.album,
        :title => mpeg_tag.title,
        :year => mpeg_tag.year,
        :track => mpeg_tag.track,
        :genre => mpeg_tag.genre,
        :comment => mpeg_tag.comment
      }
    end
  end
end
