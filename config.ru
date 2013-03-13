require 'rack/proxy'
require 'uri'

GOV_UK_URL = URI.parse('https://www.gov.uk')

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

run Proxy.new
