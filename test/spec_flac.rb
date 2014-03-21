require_relative '../src/flac.rb'

describe Flac do
  it 'raises an exception when file does not exist' do
    filename = 'test/wrongfile.mp3'
    expect{Flac.new(filename)}.to raise_error(Flac::FileNotFoundError)
  end
  
  it 'raises an exception when file is not a flace file' do
    filename = 'test/wrongfile.txt'
    expect{Flac.new(filename)}.to raise_error(Flac::WrongExtensionError)
  end
  
  it 'has a constant that defines its extension' do
    ext = '.flac'
    expect(Flac::EXT).to eq(ext)
  end
  
  it 'reads flac ID3v1 tag when it exists' do
    filename = 'test/test id3v1.flac'
    tag_values = {
      :artist => 'Test Artist',
      :album => 'Test Album',
      :title => 'Test Title',
      :year => 2000,
      :track => 1,
      :genre => 'Other',
      :comment => 'Test Comment'
    }
    flac = Flac.new(filename)
    expect(flac.filepath).to eq(filename)
    expect(flac.tag).to eq(tag_values)
  end
  
  it 'reads flac ID3v2 tag when it exists' do
    filename = 'test/test_id3v2.flac'
    tag_values = {
      :artist => 'Test Artist',
      :album => 'Test Album',
      :title => 'Test Title',
      :year => 2000,
      :track => 1,
      :genre => 'Other',
      :comment => 'Test Comment'
    }
    flac = Flac.new(filename)
    expect(flac.filepath).to eq(filename)
    expect(flac.tag).to eq(tag_values)
  end
  
  it 'transcodes to a vorbis audio file' do
    filename = 'test/test id3v1.flac'
    flac = Flac.new(filename)
    cli = 'avconv'
    outfile = 'out.ogg'
    flac.convert(cli, outfile)
    expect(File.exists?(outfile)).to be_true
    system "rm #{outfile}"
  end

  it 'raises an exception if transcoding is not successful' do
    filename = 'test/test id3v1.flac'
    flac = Flac.new(filename)
    cli = 'nothing'
    outfile = 'out.ogg'
    expect{ flac.convert(cli, outfile) }.to raise_error(Flac::ConversionFailureError)
  end
end
