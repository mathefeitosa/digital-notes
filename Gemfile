source "https://rubygems.org"

ruby ">= 3.4.0"

gem "jekyll", "~> 4.4.1"

group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.17.0"
  gem "jekyll-sitemap", "~> 1.4"
  gem "jekyll-toc", "~> 0.19.0"
end

# Ruby 3.4 no longer ships some stdlib gems by default.
gem "csv", "~> 3.3"
gem "base64", "~> 0.3"
gem "kramdown", "~> 2.5"
gem "rouge", "~> 4.7"
gem "webrick", "~> 1.9"

install_if -> { RUBY_PLATFORM =~ %r!mingw|mswin|java! } do
  gem "tzinfo", "~> 1.2"
  gem "tzinfo-data"
end

gem "wdm", "~> 0.1.1", :install_if => Gem.win_platform?
