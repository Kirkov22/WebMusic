require_relative '../src/mpeg.rb'
require_relative '../src/flac.rb'

describe Mpeg::AudioFile do
  it 'raises an exception when file does not exist' do
    filename = 'test/wrongfile.mp3'
    expect{Mpeg::AudioFile.new(filename)}.to raise_error(Mpeg::FileNotFoundError)
  end
  
  it 'raises an exception when file is not an mp3' do
    filename = 'test/wrongfile.txt'
    expect{Mpeg::AudioFile.new(filename)}.to raise_error(Mpeg::WrongExtensionError)
  end
  
  it 'reads mp3 ID3v1 tag when it exists' do
    filename = 'test/test_id3v1.mp3'
    tag_values = {
      :artist => 'Test Artist',
      :album => 'Test Album',
      :title => 'Test Title',
      :year => 2000,
      :track => 1,
      :genre => 'Other',
      :comment => 'Test Comment'
    }
    mpeg = Mpeg::AudioFile.new(filename)
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
    mpeg = Mpeg::AudioFile.new(filename)
    expect(mpeg.filepath).to eq(filename)
    expect(mpeg.tag).to eq(tag_values)
  end
  
  it 'transcodes to a vorbis audio file' do
    pending

    filename = 'test/test_id3v1.mp3'
    mpeg = Mpeg::AudioFile.new(filename)
    outfile = 'out.ogg'
    mpeg.convert_to(outfile)
    expect(File.exists?(outfile)).to be_true
    system "rm #{outfile}"
  end
end

describe Flac::AudioFile do
  it 'raises an exception when file does not exist' do
    filename = 'test/wrongfile.mp3'
    expect{Flac::AudioFile.new(filename)}.to raise_error(Flac::FileNotFoundError)
  end
  
  it 'raises an exception when file is not a flace file' do
    filename = 'test/wrongfile.txt'
    expect{Flac::AudioFile.new(filename)}.to raise_error(Flac::WrongExtensionError)
  end
  
  it 'reads flac ID3v1 tag when it exists' do
    filename = 'test/test_id3v1.flac'
    tag_values = {
      :artist => 'Test Artist',
      :album => 'Test Album',
      :title => 'Test Title',
      :year => 2000,
      :track => 1,
      :genre => 'Other',
      :comment => 'Test Comment'
    }
    flac = Flac::AudioFile.new(filename)
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
    flac = Flac::AudioFile.new(filename)
    expect(flac.filepath).to eq(filename)
    expect(flac.tag).to eq(tag_values)
  end
  
  it 'transcodes to a vorbis audio file' do
    pending

    filename = 'test/test_id3v1.flac'
    flac = Flac::AudioFile.new(filename)
    outfile = 'out.ogg'
    flac.convert_to(outfile)
    expect(File.exists?(outfile)).to be_true
    system "rm #{outfile}"
  end
end
