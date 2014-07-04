# Author: Tim Schofield
# Class to interface with server configuration
require 'json'

class ServerConfig
  # Formatting options for JSON output
  JSON_OPTS = {
    :indent => '  ',
    :space => ' ',
    :space_before => ' ',
    :object_nl => "\n"
  }
  
  class FileNotFoundError < Exception; end
  class InvalidOptionError < Exception; end
  
  attr_accessor :opts
  
  def initialize(config_file)
    raise FileNotFoundError.new("Unable to find #{config_file}.") unless File.exists?(config_file)
    @filename = config_file
    @opts = {
      path: '',
      converter: '',
      db_name: '',
      mysql_config: ''
    }
    read_config
  end
  
  def opts=(new_opts)
    new_opts.each_pair do |key, value|
      raise InvalidOptionError.new("#{key} is not a valid server option.") unless opts.has_key?(key)
      @opts[key] = value
    end
  end
  
  def write
    begin
      file = File.open(@filename, 'w')
      file.puts JSON.generate(self.opts, JSON_OPTS)
      file.close
    rescue Exception => e
      raise e
    end
  end
  
  private
  
  def read_config
    begin
      file = File.open(@filename)
      pending_opts = JSON.parse(file.read, symbolize_names: true)
      file.close
    rescue Exception => e
      raise e
    end
    self.opts = pending_opts
  end
end
