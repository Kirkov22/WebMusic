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
end
