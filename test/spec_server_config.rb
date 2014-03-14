require_relative '../src/server_config.rb'

describe ServerConfig do
  it 'raises an exception when config file does not exist' do
    filename = 'test/wrongfile.json'
    expect{ServerConfig.new(filename)}.to raise_error(ServerConfig::FileNotFoundError)
  end

  it 'reads the main music directory from a json file' do
    filename = 'test/config.json'
    server_config = ServerConfig.new(filename)
    expect(server_config.opts[:path]).to eq('/path/to/music') 
  end

  it 'allows new options to be written' do
    filename = 'test/config.json'
    server_config = ServerConfig.new(filename)
    new_path = '/path/to/nowhere'
    server_config.opts = {
      path: new_path
    }
    expect(server_config.opts[:path]).to eq(new_path)
  end

  it 'does not allow completely new options to be written' do
    filename = 'test/config.json'
    server_config = ServerConfig.new(filename)
    new_opts = {
      apples: 'bananas'
    }
    expect{server_config.opts = new_opts}.to raise_error(ServerConfig::InvalidOptionError) 
  end

  it 'writes the config back to the original file' do
    filename = 'test/config.json'
    server_config = ServerConfig.new(filename)
    old_path = server_config.opts[:path]
    new_path = '/path/to/nowhere'
    server_config.opts = { path: new_path }
    server_config.write
    new_config = ServerConfig.new(filename)
    expect(new_config.opts[:path]).to eq('/path/to/nowhere')
    server_config.opts = { path: old_path }
    server_config.write
  end
end
