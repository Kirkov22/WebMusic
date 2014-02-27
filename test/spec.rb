require_relative '../src/mpeg.rb'

describe Mpeg do
  describe 'read tags' do
    it 'raises an exception when file does not exist' do
      filename = 'test/wrongfile.mp3'
      expect{Mpeg.new(filename)}.to raise_error
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
      mpeg = Mpeg.new(filename)
      expect(mpeg.filepath).to eq(filename)
      expect(mpeg.tag).to eq(tag_values)
    end

  end
end
