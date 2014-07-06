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
  
  def song_info(id)
    result = song_by_id(id)
    row = result.fetch_row
    if row.nil?
      {}
    else
      {
        title:  row[0],
        artist: row[1],
        album:  row[2],
        track:  row[3].to_i,
        year:   row[4].to_i,
        path:   row[5]
      }
    end
  end
  
  def add_or_update_song(song)
    song[:title]  ||= 'Unknown'
    song[:artist] ||= 'Unknown'
    song[:album]  ||= 'Unknown'
    song[:track]  ||= 1
    song[:year]   ||= Time.now.year
    song[:path]   ||= '~/song.mp3'
    
    id = song_by_path(song[:path])
    (id == -1) ? insert_song(song) : update_song(song, id)
  end
  
  def artists_by_letter(letter)
    result = query_artists_by_letter(letter)
    [].tap do |artists|
      result.each do |artist|
        artists.push(artist[0]) 
      end
    end
  end

  def albums_by_artist(artist)
    result = query_albums_by_artist(artist)
    [].tap do |albums|
      result.each do |album|
        albums.push(album[0])
      end
    end
  end
  
  def songs_by_album(album)
    result = query_songs_by_album(album)
    [].tap do |songs|
      result.each do |song|
        songs.push({
          id:     song[0],
          title:  song[1],
          track:  song[2]
        })
      end
    end
  end

  private 
  
  attr_accessor :db
  
  def query_with_result(query)
    @db.query_with_result = true
    @db.query(query)
  end

  def insert(query)
    @db.query_with_result = false
    @db.query(query)
    @db.insert_id
  end

  def find_artist(artist)
    query = "SELECT a.artist_id FROM artists a WHERE a.name = '#{Mysql.quote(artist)}'"
    result = query_with_result(query)
    row = result.fetch_row
    row.nil? ? -1 : row[0].to_i
  end
  
  def insert_artist(artist)
    query = "INSERT IGNORE INTO artists (name) VALUES ('#{Mysql.quote(artist)}')"
    insert(query)
  end

  def query_artists_by_letter(letter)
    query = "SELECT name FROM artists WHERE name "
    if /[[:alpha:]]/.match(letter.chr)
      query += "REGEXP '^#{letter.chr}'"
    else
      query += "NOT REGEXP '^[[:alpha:]]'"
    end
    query += " ORDER BY name"
    query_with_result(query)
  end
  
  def find_album(album)
    query = "SELECT a.album_id FROM albums a WHERE a.name = '#{Mysql.quote(album)}'"
    result = query_with_result(query)
    row = result.fetch_row
    row.nil? ? -1 : row[0].to_i
  end
  
  def insert_album(album)
    query = "INSERT IGNORE INTO albums (name) VALUES ('#{Mysql.quote(album)}')"
    insert(query)
  end
  
  def query_albums_by_artist(artist)
    query = <<ENDDOC
SELECT alb.name FROM albums alb
WHERE alb.album_id IN (
  SELECT s.album_id FROM songs s
  WHERE s.artist_id = (
    SELECT art.artist_id FROM artists art
    WHERE art.name = '#{Mysql.quote(artist)}'))
ORDER BY alb.name
ENDDOC
    query_with_result(query)
  end

  def song_by_path(path)
    query = "SELECT s.song_id FROM songs s WHERE s.path = '#{Mysql.quote(path)}'"
    result = query_with_result(query)
    row = result.fetch_row
    row.nil? ? -1 : row[0].to_i
  end
  
  def song_by_id(id)
    query = <<ENDDOC
SELECT s.title, art.name, alb.name, s.track_number, s.release_year, s.path
FROM songs s INNER JOIN artists art
  USING (artist_id)
  INNER JOIN albums alb
  USING (album_id)
WHERE s.song_id = #{id}
ENDDOC
    query_with_result(query)
  end

  def query_songs_by_album(album)
    query = <<ENDDOC
SELECT s.song_id, s.title, s.track_number FROM songs s
WHERE s.album_id = (
  SELECT a.album_id FROM albums a
  WHERE a.name = '#{Mysql.quote(album)}')
ORDER BY s.track_number
ENDDOC
    query_with_result(query)
  end

  def insert_song(song)
    artist_id = artist(song[:artist])
    album_id = album(song[:album])
    
    query = <<ENDDOC
INSERT IGNORE INTO songs (title, artist_id, album_id, track_number, release_year, path)
VALUES ('#{Mysql.quote(song[:title])}', #{artist_id}, #{album_id},
        #{song[:track]}, #{song[:year]}, '#{Mysql.quote(song[:path])}')
ENDDOC
    insert(query)
  end
  
  def update_song(song, id)
    artist_id = artist(song[:artist])
    album_id = album(song[:album])
    
    query = <<ENDDOC
UPDATE songs
SET title = '#{Mysql.quote(song[:title])}',
    artist_id = #{artist_id},
    album_id = #{album_id},
    track_number = #{song[:track]},
    release_year = #{song[:year]}
WHERE song_id = #{id} 
ENDDOC
    insert(query)
  end
end
