require_relative 'app_helpers.rb'
require_relative 'flac.rb'
require_relative 'mpeg.rb'
require_relative 'server_config'

include AppHelpers

def insertAllSongs(path, db)
  listMusicFiles(path).each do |file|
    ext = File.extname(file).downcase
    
    case ext
    when Mpeg::EXT
      song = Mpeg.new(file).tag.clone
    when Flac::EXT
      song = Flac.new(file).tag.clone
    else
      song = {}
    end
    
    unless song.empty?
      song[:path] = File.absolute_path(file)
      db.add_or_update_song(song)
    end
    
  end
end

# Return an array of music files at path
def listMusicFiles(path)
  Dir.glob(path + "**/*{" + Mpeg::EXT + "," + Flac::EXT + "}", caseinsensitive)
end

# Flag for case insensitive glob expression
def caseinsensitive
  File::FNM_CASEFOLD
end

config = ServerConfig.new('config.json')
db = startupDB(config)
insertAllSongs(config.opts[:path], db)
