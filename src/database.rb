require 'mysql'

class Database

  def initialize(opts)
    opts[:host]   ||= 'localhost'
    opts[:user]   ||= 'user'
    opts[:pword]  ||= 'password'
    opts[:db]     ||= 'db'
    opts[:port]   ||= 3306
    opts[:sock]   ||= nil
    
    @db = Mysql.connect(
      opts[:host],    # Hostname
      opts[:user],    # User name
      opts[:pword],   # Password
      opts[:db],      # Database name
      opts[:port],    # Port #
      opts[:sock]     # MySQL socket
    )
  end

  def artist(artist)
    id = find_artist(artist)
    (id == -1) ? insert_artist(artist) : id
  end

  def album(album)
    id = find_album(album)
    (id == -1) ? insert_album(album) : id
  end

  private 

  attr_accessor :db

  def find_artist(artist)
    @db.query_with_result = true
    result = @db.query("SELECT a.artist_id FROM artists a WHERE a.name='#{Mysql.quote(artist)}'")
    row = result.fetch_row()
    row.nil? ? -1 : row[0].to_i
  end

  def insert_artist(artist)
    @db.query_with_result = false
    @db.query("INSERT IGNORE INTO artists (name) VALUES ('#{Mysql.quote(artist)}')")
    @db.insert_id
  end

  def find_album(album)
    @db.query_with_result = true
    result = @db.query("SELECT a.album_id FROM albums a WHERE a.name='#{Mysql.quote(album)}'")
    row = result.fetch_row()
    row.nil? ? -1 : row[0].to_i
  end

  def insert_album(album)
    @db.query_with_result = false
    @db.query("INSERT IGNORE INTO albums (name) VALUES ('#{Mysql.quote(album)}')")
    @db.insert_id
  end
end