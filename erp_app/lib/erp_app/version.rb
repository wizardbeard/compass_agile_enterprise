module ErpApp
  module VERSION #:nodoc:
    MAJOR = 4
    MINOR = 0
    TINY  = 0

    STRING = [MAJOR, MINOR, TINY].compact.join('.')
  end

  def self.version
    ErpApp::VERSION::STRING
  end
end

