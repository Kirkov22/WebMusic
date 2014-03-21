require_relative '../src/mpeg.rb'

describe Mpeg do
  it 'raises an exception when file does not exist' do
    filename = 'test/wrongfile.mp3'
    expect{Mpeg.new(filename)}.to raise_error(Mpeg::FileNotFoundError)
  end
  
  it 'raises an exception when file is not an mp3' do
    filename = 'test/wrongfile.txt'
    expect{Mpeg.new(filename)}.to raise_error(Mpeg::WrongExtensionError)
  end

  it 'has a constant that defines its extension' do
    ext = '.mp3'
    expect(Mpeg::EXT).to eq(ext)
  end
  
  it 'reads mp3 ID3v1 tag when it exists' do
    filename = 'test/test id3v1.mp3'
    tag_values = {
      :artist => 'Test Artist',
      :album => 'Test Album',
      :title => 'Test Title',
      :year => 2000,
      :track => 1,
      :genre => 'Other',
      :comment => 'Test Comment'
    }
    mpeg = Mpeg.new(filename)
    expect(mpeg.filepath).to eq(filename)
    expect(mpeg.tag).to eq(tag_values)
  end
  
  it 'reads mp3 ID3v2 tag when it exists' do
    filename = 'test/test_id3v2.mp3'
    tag_values = {
      :artist => 'Test Artist',
      :album => 'Test Album',
      :title => 'Test Title',
      :year => 2000,
      :track => 1,
      :genre => 'Other',
      :comment => 'Test Comment'
    }
    mpeg = Mpeg.new(filename)
    expect(mpeg.filepath).to eq(filename)
    expect(mpeg.tag).to eq(tag_values)
  end
  
  it 'transcodes to a vorbis audio file' do
    filename = 'test/test id3v1.mp3'
    mpeg = Mpeg.new(filename)
    cli = 'avconv'
    outfile = 'out.ogg'
    mpeg.convert(cli, outfile)
    expect(File.exists?(outfile)).to be_true
    system "rm #{outfile}"
  end

  it 'raises an exception if transcoding is not successful' do
    filename = 'test/test id3v1.mp3'
    mpeg = Mpeg.new(filename)
    cli = 'nothing'
    outfile = 'out.ogg'
    expect{ mpeg.convert(cli, outfile) }.to raise_error(Mpeg::ConversionFailureError)
  end
end
