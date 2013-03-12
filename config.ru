require 'rack'
require 'rack/proxy'
require 'uri'

GOV_UK_URL = URI.parse('https://www.gov.uk')
MIRROR_JAVASCRIPT_PATH = '/mirror.js'

class Proxy < Rack::Proxy
  def rewrite_env(env)
    env.
      merge(
        'rack.url_scheme' => GOV_UK_URL.scheme,
        'HTTP_HOST'       => GOV_UK_URL.host,
        'SERVER_PORT'     => GOV_UK_URL.port
      ).
      reject { |key, _| key == 'HTTP_ACCEPT_ENCODING' }
  end

  def rewrite_response(response)
    status, headers, body = response

    [
      status,
      headers.reject { |key, _| %w(status transfer-encoding).include?(key) },
      body
    ]
  end
end

class InsertTags < Struct.new(:app)
  def call(env)
    status, headers, body = app.call(env)

    Rack::Response.new(body, status, headers) do |response|
      if media_type(response) == 'text/html'
        content = add_tags(response.body.join)
        response.body = [content]
        response.headers['Content-Length'] = content.length.to_s
      end
    end
  end

  def media_type(response)
    response.content_type.to_s.split(';').first
  end

  def add_tags(content)
    content.sub(%r{(?=</head>)}, script_tags)
  end

  def script_tags
    %Q{<script src="#{MIRROR_JAVASCRIPT_PATH}"></script>}
  end
end

use Rack::Static, urls: [MIRROR_JAVASCRIPT_PATH]
use InsertTags
run Proxy.new
